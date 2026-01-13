import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import "./MegaMenu.css";

const MegaMenu = () => {
  const [menu, setMenu] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMegaMenu();
  }, []);

  const fetchMegaMenu = async () => {
    try {
      const { data } = await api.get("/categories/mega-menu");
      setMenu(data);
    } catch (err) {
      console.error("Mega menu error", err);
    }
  };

  const isDesktop = window.innerWidth > 1024;

  return (
    <div className="mega-header">
      <ul className="menu-list">
        {menu.map((cat) => (
          <li
            key={cat._id}
            onMouseEnter={() => isDesktop && setActiveCat(cat._id)}
            onMouseLeave={() => isDesktop && setActiveCat(null)}
          >
            {/* CATEGORY NAME */}
            <span
              onClick={() =>
                !isDesktop &&
                setActiveCat(activeCat === cat._id ? null : cat._id)
              }
            >
              {cat.name}
            </span>

            {/* MEGA MENU */}
            {activeCat === cat._id && (
              <div className="mega-overlay">
                <div className="mega-panel">
                  {cat.subCategories.map((sub) => (
                    <div className="mega-column" key={sub._id}>
                      <h6
                        onClick={() =>
                          navigate(`/category/${cat.slug}/${sub.slug}`)
                        }
                      >
                        {sub.name}
                      </h6>

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
