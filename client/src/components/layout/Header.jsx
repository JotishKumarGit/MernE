import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CiDark } from "react-icons/ci";
import { MdOutlineLightMode } from "react-icons/md";

import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { useThemeStore } from "../../stores/themeStore";
import getProfilePic from '../../utills/getProfilePic';

import MegaMenu from "./MegaMenu";

function Header() {
  /* ================= GLOBAL STORES ================= */
  const { user, logout } = useAuthStore();
  const { cartCount } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();

  /* ================= LOCAL STATES ================= */
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

  /* ================= APPLY THEME TO BODY ================= */
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  /* ================= SEARCH HANDLER ================= */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(searchText)}`);
    setSearchText("");
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-light border-bottom small py-1 px-3 d-flex justify-content-between">
        <span>📧 jotishk649@gmail.com | 📞 +91 7827710029</span>
        <Link to="/help" className="text-muted text-decoration-none"> Help</Link>
      </div>

      {/* MAIN NAVBAR */}
      <nav className={`navbar navbar-expand-lg shadow-sm py-3 ${theme === "dark" ? "navbar-dark bg-dark" : "navbar-light bg-white"}`}>
        <div className="container-fluid">

          {/* ================= BRAND ================= */}
          <Link className="navbar-brand fw-bold text-primary fs-4" to="/"> ShopEase</Link>

          {/* ================= DESKTOP MEGA MENU ================= */}
          {/* Only visible on large screens */}
          <div className="d-none d-lg-block ms-4">
            <MegaMenu mode="desktop" />
          </div>

          {/* ================= MOBILE TOGGLER ================= */}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* ================= COLLAPSIBLE CONTENT ================= */}
          <div className="collapse navbar-collapse" id="navbarNav">

            {/* ================= MOBILE MEGA MENU ================= */}
            {/* Appears only inside hamburger */}
            <div className="d-lg-none w-100 mb-3">
              <MegaMenu mode="mobile" />
            </div>

            {/* ================= RIGHT SIDE CONTENT ================= */}
            <div className="ms-lg-auto d-flex align-items-center flex-wrap gap-3">

              {/* 🔍 SEARCH */}
              <form className="d-flex" style={{ maxWidth: 280 }} onSubmit={handleSearch}>
                <input className="form-control rounded-start-pill" placeholder="Search products..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                <button className="btn btn-primary rounded-end-pill"> 🔍</button>
              </form>

              {/* 🛒 CART */}
              <Link className="nav-link position-relative" to="/cart">🛒
                <span className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill">{cartCount()}</span>
              </Link>

              {/* 🌗 THEME TOGGLE */}
              <button className="btn btn-outline-secondary btn-sm" onClick={toggleTheme} title="Toggle Theme">
                {theme === "dark" ? (
                  <CiDark size={24} />
                ) : (
                  <MdOutlineLightMode size={24} />
                )}
              </button>

              {/* ================= AUTH ================= */}
              {!user ? (
                <>
                  <Link className="btn btn-outline-primary" to="/login" > Login</Link>
                  <Link className="btn btn-primary" to="/register">Register</Link>
                </>
              ) : (
                <div className="dropdown">
                  <button className="btn dropdown-toggle p-0 border-0 bg-transparent" data-bs-toggle="dropdown" >
                    <img
                      // src={
                      //   user?.profilePic
                      //     ? `${import.meta.env.VITE_API_URL}${user.profilePic}?t=${Date.now()}`
                      //     : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      // }
                      // src={user ? user.profilePic : "...."}
                      src={getProfilePic(user?.profilePic)}
                      width="34" height="34" className="rounded-circle" alt={user.name || "User"} />

                  </button>

                  <ul className="dropdown-menu dropdown-menu-end">
                    {user.role === "admin" && (
                      <li> <Link className="dropdown-item" to="/admin/dashboard">Admin Panel</Link></li>
                    )}
                    {user.role === "user" && (
                      <li><Link className="dropdown-item" to="/user/dashboard" >User Dashboard</Link></li>
                    )}
                    <li>
                      <button className="dropdown-item text-danger" onClick={logout} > Logout </button>
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
