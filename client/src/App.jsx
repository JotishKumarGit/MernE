import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "aos/dist/aos.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// public route 
import Home from "./pages/user/Home";
import ProductDetails from "./pages/user/ProductDetails";
import Cart from "./pages/user/Cart";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";

// only for admin 
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import Categories from './pages/admin/Categories';
import SubCategories from './pages/admin/SubCategories';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import AdminAnalytics from './components/admin/AdminAnalytics';
import AuditLogs from './pages/admin/AuditLogs'

// user dashboard route 
import DashboardLayout from "./pages/user/userDashboard/DashboardLayout";
import UserProfile from "./pages/user/userDashboard/UserProfile";
import UserOrders from "./pages/user/userDashboard/UserOrders";
import UserSettings from "./pages/user/userDashboard/UserSettings";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import NotFound from "./pages/NotFound";

import { useAuthStore } from "./stores/authStore";

// Layouts
import UserLayout from "./components/layout/UserLayout";
import AdminLayout from "./components/layout/AdminLayout";

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes with UserLayout */}
        <Route path="/" element={<UserLayout><Home /></UserLayout>} />
        <Route path="/product/:id" element={<UserLayout><ProductDetails /></UserLayout>} />
        <Route path="/cart" element={<UserLayout><Cart /></UserLayout>} />
        <Route path="/login" element={<UserLayout><PublicRoute><Login /></PublicRoute></UserLayout>} />
        <Route path="/register" element={<UserLayout><PublicRoute><Register /></PublicRoute></UserLayout>} />
        {/* <Route path="/profile" element={<UserLayout><ProtectedRoute><Profile /></ProtectedRoute></UserLayout>} /> */}

        {/* user dashboard route */}
        <Route path="/user/dashboard/" element={<ProtectedRoute><DashboardLayout /> </ProtectedRoute>}>
          <Route index element={<UserProfile />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>

        {/* Admin Routes with AdminLayout */}
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminLayout><Products /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminLayout><Orders /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminLayout><Categories /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/sub-categories" element={<ProtectedRoute adminOnly><AdminLayout><SubCategories /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminLayout>< AdminAnalytics /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute adminOnly><AdminLayout>< AuditLogs /></AdminLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
