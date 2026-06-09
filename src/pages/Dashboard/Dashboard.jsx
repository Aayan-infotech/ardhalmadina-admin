import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axiosInstance from "../../utils/axiosInstance";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    vehicles: 0,
    categories: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const [
        usersRes,
        vehiclesRes,
        categoriesRes,
        ordersRes,
      ] = await Promise.all([
        axiosInstance.get("/admin/users/getAll"),
        axiosInstance.get("/listings/admin/listings"),
        axiosInstance.get("/category"),
        axiosInstance.get("/material/admin/orders"),
      ]);

      const usersCount =
        usersRes?.data?.total ||
        usersRes?.data?.users?.length ||
        0;

      const vehiclesCount =
        vehiclesRes?.data?.pagination?.totalCount ||
        0;

      const categoriesCount =
        categoriesRes?.data?.total ||
        categoriesRes?.data?.categories?.length ||
        categoriesRes?.data?.data?.length ||
        0;

      const ordersCount =
        ordersRes?.data?.total ||
        ordersRes?.data?.data?.length ||
        ordersRes?.data?.orders?.length ||
        0;

      setStats({
        users: usersCount,
        vehicles: vehiclesCount,
        categories: categoriesCount,
        orders: ordersCount,
      });
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const chartData = {
    labels: [
      "Users",
      "Vehicles",
      "Categories",
      "Orders",
    ],
    datasets: [
      {
        label: "Total Count",
        data: [
          stats.users,
          stats.vehicles,
          stats.categories,
          stats.orders,
        ],
        backgroundColor: [
          "#2C8769",
          "#3498db",
          "#f39c12",
          "#e74c3c",
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };
if (loading) {
  return (
    <div className="dashboard-loading">
      <div className="spinner"></div>
    </div>
  );
}
  return (
    <div className="dashboard">
      <div className="row g-4 mb-4">
        <StatCard
  title="Total Users"
  value={stats.users}
/>

<StatCard
  title="Total Vehicles"
  value={stats.vehicles}
/>

<StatCard
  title="Total Categories"
  value={stats.categories}
/>

<StatCard
  title="Total Orders"
  value={stats.orders}
/>
      </div>

     <div className="row g-4">
  {/* GRAPH */}
  <div className="col-lg-6">
    <div className="dashboard-card graph-card">
      <h6>System Overview</h6>

      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
        }}
      />
    </div>
  </div>

  {/* SUMMARY */}
  <div className="col-lg-6">
    <div className="dashboard-card summary-card">
      <h6>Statistics Summary</h6>

      <div className="summary-row">
        <span>Total Users</span>
        <strong>{stats.users}</strong>
      </div>

      <div className="summary-row">
        <span>Total Vehicles</span>
        <strong>{stats.vehicles}</strong>
      </div>

      <div className="summary-row">
        <span>Total Categories</span>
        <strong>{stats.categories}</strong>
      </div>

      <div className="summary-row">
        <span>Total Orders</span>
        <strong>{stats.orders}</strong>
      </div>
    </div>
  </div>
</div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="col-xl-3 col-md-6">
      <div className="stat-card">
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}