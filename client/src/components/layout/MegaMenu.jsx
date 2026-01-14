import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import "./MegaMenu.css";

const MegaMenu = () => {
  const [menu, setMenu] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const navigate = useNavigate();

  const isDesktop = window.innerWidth > 1024;

  useEffect(() => {
    fetchMegaMenu();
  }, []);

  const fetchMegaMenu = async () => {
    try {
      const { data } = await api.get("/categories/mega-menu");
      setMenu(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mega-header">
      <ul className="menu-list">
        {menu.map((cat) => (
          <li
            key={cat._id}
            className="menu-item"
            onMouseEnter={() => isDesktop && setActiveCat(cat._id)}
            onMouseLeave={() => isDesktop && setActiveCat(null)}
          >
            {/* CATEGORY */}
            <span
              className="menu-title"
              onClick={() =>
                !isDesktop &&
                setActiveCat(activeCat === cat._id ? null : cat._id)
              }
            >
              {cat.name}
              {!isDesktop && <span className="arrow">{activeCat === cat._id ? "▾" : "▸"}</span>}
            </span>

            {/* MEGA MENU */}
            {activeCat === cat._id && (
              <div className="mega-overlay">
                <div className="mega-panel">
                  {cat.subCategories.map((sub) => (
                    <div className="mega-column" key={sub._id}>
                      {/* SUB CATEGORY */}
                      <div
                        className="sub-head"
                        onClick={() =>
                          !isDesktop &&
                          setActiveSub(activeSub === sub._id ? null : sub._id)
                        }
                      >
                        <h6
                          onClick={() =>
                            isDesktop &&
                            navigate(`/category/${cat.slug}/${sub.slug}`)
                          }
                        >
                          {sub.name}
                        </h6>

                        {!isDesktop && (
                          <span className="arrow">
                            {activeSub === sub._id ? "▾" : "▸"}
                          </span>
                        )}
                      </div>

                      {/* PRODUCTS */}
                      {(isDesktop || activeSub === sub._id) && (
                        <div className="products-wrap">
                          {sub.products.map((p) => (
                            <div
                              key={p._id}
                              className="mega-product"
                              onClick={() => navigate(`/product/${p._id}`)}
                            >
                              <img
                                src={`${import.meta.env.VITE_API_URL}${p.image}`}
                                alt={p.name}
                              />
                              <div>
                                <p>{p.name}</p>
                                <span>₹{p.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
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
