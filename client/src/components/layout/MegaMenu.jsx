import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import "./MegaMenu.css";
import { useThemeStore } from "../../stores/themeStore";

const PRODUCT_LIMIT = 5;

const MegaMenu = () => {
  const [menu, setMenu] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const isDesktop = window.innerWidth > 1024;

  useEffect(() => {
    fetchMegaMenu();
  }, []);

  const fetchMegaMenu = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/categories/mega-menu");
      setMenu(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SWIPE (MOBILE) ================= */
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 80) {
      setMobileOpen(false);
      setActiveCat(null);
      setActiveSub(null);
    }
  };

  /* ================= SEARCH FILTER ================= */
  const filterProducts = (products) =>
    products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className={`mega-header ${theme}`}>
      {/* 🔥 HAMBURGER */}
      {!isDesktop && (
        <div
          className="hamburger"
          role="button"
          tabIndex="0"
          aria-label="Open Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </div>
      )}

      <ul
        className={`menu-list ${mobileOpen ? "open" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {menu.map((cat) => (
          <li
            key={cat._id}
            className="menu-item"
            onMouseEnter={() => isDesktop && setActiveCat(cat._id)}
            onMouseLeave={() => isDesktop && setActiveCat(null)}
          >
            {/* CATEGORY */}
            <div
              className="menu-title"
              tabIndex="0"
              role="button"
              onClick={() => {
                if (!isDesktop) {
                  setActiveCat(activeCat === cat._id ? null : cat._id);
                  setActiveSub(null);
                }
              }}
            >
              {cat.name}
              {!isDesktop && (
                <span className="arrow">
                  {activeCat === cat._id ? "▾" : "▸"}
                </span>
              )}
            </div>

            {/* MEGA MENU */}
            {activeCat === cat._id && (
              <div className="mega-overlay slide-down">
                <div className="mega-panel">
                  {/* BACK BUTTON */}
                  {!isDesktop && (
                    <button
                      className="back-btn"
                      onClick={() => {
                        setActiveCat(null);
                        setActiveSub(null);
                      }}
                    >
                      ← Back
                    </button>
                  )}

                  {/* 🔍 SEARCH */}
                  <input
                    className="mega-search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  {loading
                    ? [...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton" />
                      ))
                    : cat.subCategories.map((sub) => {
                        const filtered = filterProducts(sub.products);
                        const visible =
                          isDesktop || activeSub === sub._id
                            ? filtered.slice(0, PRODUCT_LIMIT)
                            : [];

                        return (
                          <div className="mega-column" key={sub._id}>
                            {/* SUB CATEGORY */}
                            <div
                              className="sub-head"
                              tabIndex="0"
                              role="button"
                              onClick={() =>
                                !isDesktop &&
                                setActiveSub(
                                  activeSub === sub._id ? null : sub._id
                                )
                              }
                            >
                              <h6>{sub.name}</h6>
                              {!isDesktop && (
                                <span className="arrow">
                                  {activeSub === sub._id ? "▾" : "▸"}
                                </span>
                              )}
                            </div>

                            {/* PRODUCTS */}
                            {(isDesktop || activeSub === sub._id) && (
                              <div className="products-wrap slide-inner">
                                {visible.map((p) => (
                                  <div
                                    key={p._id}
                                    className="mega-product"
                                    tabIndex="0"
                                    role="button"
                                    onClick={() =>
                                      navigate(`/product/${p._id}`)
                                    }
                                  >
                                    <img
                                      src={`${import.meta.env.VITE_API_URL}${p.image}`}
                                      alt={p.name}
                                      loading="lazy"
                                    />
                                    <div>
                                      <p>{p.name}</p>
                                      <span>₹{p.price}</span>
                                    </div>
                                  </div>
                                ))}

                                {/* READ MORE */}
                                {filtered.length > PRODUCT_LIMIT && (
                                  <button
                                    className="read-more"
                                    onClick={() =>
                                      navigate(
                                        `/category/${cat.slug}/${sub.slug}`
                                      )
                                    }
                                  >
                                    View all ({filtered.length})
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MegaMenu;
