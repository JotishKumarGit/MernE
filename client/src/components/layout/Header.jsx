// src/components/layout/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CiDark } from "react-icons/ci";
import { MdOutlineLightMode } from "react-icons/md";

import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { useThemeStore } from "../../stores/themeStore";
import { useCategoryStore } from "../../stores/categoryStore";
import MegaMenu from "./MegaMenu";

function Header() {
  const { user, logout } = useAuthStore();
  const { cartCount } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const { megaCategories, fetchMegaCategories } = useCategoryStore();

  const [searchText, setSearchText] = useState("");
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    fetchMegaCategories();
  }, [fetchMegaCategories]);

  // Apply theme
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = () => setOpenCategoryId(null);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/?keyword=${encodeURIComponent(searchText)}`);
    }
  };

  return (
    <>
      {/* 🔹 Topbar */}
      <div className="bg-light border-bottom small py-1 px-3 d-flex justify-content-between">
        <span>📧 jotishk649@gmail.com | 📞 +91 7827710029</span>
        <Link to="/help" className="text-muted text-decoration-none">
          Help
        </Link>
      </div>

      {/* 🔹 Navbar */}
      <nav
        className={`navbar navbar-expand-lg shadow-sm py-3 ${theme === "dark" ? "navbar-dark bg-dark" : "navbar-light bg-white"
          } px-3`}
      >
        <div className="container-fluid">
          {/* Brand */}
          <Link className="navbar-brand fw-bold text-primary fs-4" to="/">ShopEase</Link>

          <MegaMenu />

          {/* Mobile toggler */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="d-flex align-items-center ms-auto">
              {/* Search */}
              <form
                className="d-flex me-3"
                style={{ maxWidth: 300 }}
                onSubmit={handleSearch}
              >
                <input
                  className="form-control rounded-start-pill"
                  placeholder="Search products..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="btn btn-primary rounded-end-pill">
                  🔍
                </button>
              </form>

              {/* Cart */}
              <Link className="nav-link position-relative me-3" to="/cart">
                🛒
                <span className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill">
                  {cartCount()}
                </span>
              </Link>

              {/* Theme */}
              <button
                className="btn btn-outline-secondary btn-sm me-3"
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <CiDark size={26} />
                ) : (
                  <MdOutlineLightMode size={26} />
                )}
              </button>

              {/* Auth */}
              {!user ? (
                <>
                  <Link className="btn btn-outline-primary me-2" to="/login">
                    Login
                  </Link>
                  <Link className="btn btn-primary" to="/register">
                    Register
                  </Link>
                </>
              ) : (
                <div className="dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <img
                      src={
                        user.profilePic ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      }
                      width="30"
                      height="30"
                      className="rounded-circle"
                    />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {user.role === "admin" && (
                      <li>
                        <Link className="dropdown-item" to="/admin/dashboard">
                          Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <button className="dropdown-item" onClick={logout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
