
// src/components/admin/AdminAnalytics.jsximport React, { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import { Line, Bar } from "react-chartjs-2";
import "./AdminSidebar.css";
import {
  Chart as ChartJS,CategoryScale,LinearScale,BarElement,PointElement,LineElement,Title,Tooltip,Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,LinearScale,BarElement,PointElement,LineElement, Title,Tooltip,Legend
);

export default function AdminAnalytics() {
  const [revenueData, setRevenueData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [metricCards, setMetricCards] = useState([
    { title: "Total Revenue", value: "$0", color  : "bg-gradient-green" },
    { title: "Avg Order Value", value: "$0", color  : "bg-gradient-blue" },
    { title: "Total Orders", value: "0", color  : "bg-gradient-purple" },
  ]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // 🔹 1. Total Revenue & AOV
        const aovRes = await api.get("/admin/orders/aov");
        const { totalRevenue, totalOrders, averageOrderValue } = aovRes.data;

        setMetricCards([
          { title: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, color  : "bg-gradient-green" },
          { title: "Avg Order Value", value: `$${averageOrderValue.toFixed(2)}`, color  : "bg-gradient-blue" },
          { title: "Total Orders", value: totalOrders, color  : "bg-gradient-purple" },
        ]);

        // 🔹 2. Monthly Revenue Trend
        const revenueRes = await api.get("/admin/revenue/monthly");

        setRevenueData({
          labels: revenueRes.data.map((r) => r.month),
          datasets: [
            {
              label: "Monthly Revenue",
              data: revenueRes.data.map((r) => r.totalRevenue),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.4,
            },
          ],
        });

        // 🔹 3. Top Selling Products
        const productsRes = await api.get("/admin/products/top-selling");
        console.log("Top products API:", productsRes.data);
       
        setProductsData({
          labels: productsRes.data.map((p) => p.productName),
          datasets: [
            {
              label: "Units Sold",
              data: productsRes.data.map((p) => p.unitsSold),
              backgroundColor: "rgba(255, 99, 132, 0.6)",
            },
          ],
        });
      } catch (error) {
        console.error("Analytics fetch error:", error);
      }
    };

    fetchAnalytics();
  }, []);
  

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📊 Admin Analytics Dashboard</h2>

      {/* 🔹 Metric Cards */}
      <div className="row mb-4">
        {metricCards.map((card, index) => (
          <div className="col-md-4 mb-3" key={index}>
            <div className={`card text-white h-100 ${card.color}`}>
              <div className="card-body">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text display-6">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Revenue Chart */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card p-3">
            <h5>Monthly Revenue</h5>
            {revenueData ? <Line data={revenueData} /> : <p>Loading...</p>}
          </div>
        </div>
      </div>

      {/* 🔹 Top Products */}
      <div className="row">
        <div className="col-md-12">
          <div className="card p-3">
            <h5>Top Selling Products</h5>
            {productsData ? <Bar data={productsData} /> : <p>Loading...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
