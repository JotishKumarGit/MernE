import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import './AdminSidebar.css';

export default function StatsCards() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories:0,
    lowStockProducts: [],
    recentOrders: [],
  });

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get("/admin/dashboard");

      setStats({
        totalUsers: data.totalUsers || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        totalProducts: data.totalProducts || 0,
        totalCategories: data.totalCategories || 0,
        lowStockProducts: data.lowStockProducts || [],
        recentOrders: data.recentOrders || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

const cards = [
  {
    title: "Users",
    value: stats.totalUsers,
    color: "bg-gradient-cyan",
  },
  {
    title: "Revenue",
    value: `$${stats.totalRevenue.toLocaleString()}`,
    color: "bg-gradient-green",
  },
  {
    title: "Orders",
    value: stats.totalOrders,
    color: "bg-gradient-blue",
  },
  {
    title: "Products",
    value: stats.totalProducts,
    color: "bg-gradient-orange",
  },
  {
    title: "Categories",
    value: stats.totalCategories,
    color: "bg-gradient-purple",
  },
  {
    title: "Low Stock Products",
    value: stats.lowStockProducts.length,
    color: "bg-gradient-red", // 🔴 Alert / warning feel
  },
  {
    title: "Recent Orders",
    value: stats.recentOrders.length,
    color: "bg-gradient-pink", // 🌸 Fresh / activity
  },
];

  return (
    <div className="row g-4 mb-4">
      {cards.map((card) => (
        <div className="col-12 col-md-4" key={card.title}>
          <div
            className={`card text-white shadow-sm ${card.color}`}
            data-aos="zoom-in"
          >
            <div className="card-body">
              <h5 className="card-title">{card.title}</h5>
              <p className="card-text fs-4 fw-bold">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
}
