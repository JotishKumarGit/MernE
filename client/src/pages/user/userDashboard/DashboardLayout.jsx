import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { FaBars, FaUserCircle, FaSignOutAlt, FaCog, FaBox, FaUser } from "react-icons/fa";
import './styles.css';
import getProfilePic from "../../../utills/getProfilePic";

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const closeOnNavigation = () => setSidebarOpen(false);
    // Close sidebar on route change for better mobile UX
    useEffect(() => {

        // listen for popstate (back/forward) or you can use React Router hooks in parent
        window.addEventListener("popstate", closeOnNavigation);
        return () => window.removeEventListener("popstate", closeOnNavigation);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-wrapper d-flex flex-column vh-100">
            {/* Topbar */}
            <nav className="dashboard-topbar navbar navbar-light bg-white shadow-sm px-3 py-2 fixed-top d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    {/* Mobile: toggle sidebar */}
                    <button className="btn btn-outline-secondary d-lg-none" type="button" onClick={() => setSidebarOpen(prev => !prev)} aria-label={sidebarOpen ? "Close menu" : "Open menu"} >
                        <FaBars />
                    </button>
                    <h5 className="mb-0 fw-semibold">User Dashboard</h5>
                </div>

                {/* Profile Dropdown (desktop) */}
                <div className="dropdown">
                    <button className="btn btn-light d-flex align-items-center gap-2 dropdown-toggle border-0" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false" >
                        <img
                            // src={user?.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}?t=${Date.now()}` : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                            src={getProfilePic(user.profilePic)}
                            width="34" height="34" className="rounded-circle" alt={user.name || "User"} />
                        <span className="fw-medium d-none d-md-inline">{user?.name || "User"}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
                        <li>
                            <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => navigate("/user/dashboard")}>
                                <FaUser /> Profile
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => navigate("/user/dashboard/settings")}>
                                <FaCog /> Settings
                            </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                                <FaSignOutAlt /> Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Sidebar + Main */}
            <div className="d-flex flex-grow-1 overflow-hidden" style={{ paddingTop: "60px" }}>
                {/* Sidebar: we toggle a class to show/hide for mobile */}
                <aside className={`dashboard-sidebar bg-dark text-white ${sidebarOpen ? "open" : ""}`}>
                    <div className="sidebar-header d-flex align-items-center gap-2 p-3 border-bottom border-secondary">
                        <img
                            // src={user?.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}?t=${Date.now()}` : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                            src={getProfilePic(user.profilePic)}
                            width="34" height="34" className="rounded-circle" alt={user.name || "User"} />
                        <div>
                            <div className="fw-bold">{user?.name || "User"}</div>
                            <small className="text-muted d-block text-white-50">{user?.email}</small>
                        </div>
                        {/* close button visible only on mobile sidebar */}
                        <button className="btn-close btn-close-white ms-auto d-lg-none" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"></button>
                    </div>

                    <nav className="nav flex-column mt-3">
                        <NavLink to="/user/dashboard" end className={({ isActive }) => "nav-link px-4 py-2 d-flex align-items-center gap-2 " + (isActive ? "active-nav" : "text-white-50")}>
                            <FaUser /> Profile
                        </NavLink>

                        <NavLink to="/user/dashboard/orders" className={({ isActive }) => "nav-link px-4 py-2 d-flex align-items-center gap-2 " + (isActive ? "active-nav" : "text-white-50")}>
                            <FaBox /> My Orders
                        </NavLink>

                        <NavLink to="/user/dashboard/settings" className={({ isActive }) => "nav-link px-4 py-2 d-flex align-items-center gap-2 " + (isActive ? "active-nav" : "text-white-50")}>
                            <FaCog /> Settings
                        </NavLink>
                    </nav>

                    <div className="mt-auto p-3 border-top border-secondary">
                        <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="dashboard-content flex-grow-1 overflow-auto p-3 bg-light">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
