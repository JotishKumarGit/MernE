// src/pages/userDashboard/UserSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export default function UserSidebar() {
  const { user } = useAuthStore();

  return (
    <aside className="dashboard-sidebar bg-white border-end">
      <div className="sidebar-inner p-3 d-flex flex-column h-100">
        <div className="d-flex align-items-center mb-3">
          <img
            key={user?.profilePic}
            src={
              user?.profilePic
                ? `${import.meta.env.VITE_API_URL}${user.profilePic}?v=${Date.now()}`
                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            width="34"
            height="34"
            className="rounded-circle"
            alt="User"
          />

          <div>
            <div className="fw-bold">{user?.name || user?.email}</div>
            <small className="text-muted">{user?.role || "Customer"}</small>
          </div>
        </div>

        <nav className="nav flex-column mb-3">
          <NavLink to="/dashboard" end className={({ isActive }) => "nav-link text-start " + (isActive ? "active fw-semibold" : "")}>
            Profile
          </NavLink>
          <NavLink to="/dashboard/orders" className={({ isActive }) => "nav-link text-start " + (isActive ? "active fw-semibold" : "")}>
            My Orders
          </NavLink>
          <NavLink to="/dashboard/settings" className={({ isActive }) => "nav-link text-start " + (isActive ? "active fw-semibold" : "")}>
            Settings
          </NavLink>
        </nav>

        <div className="mt-auto small text-muted">Need help? <a href="/help">Contact us</a></div>
      </div>
    </aside>
  );
}
