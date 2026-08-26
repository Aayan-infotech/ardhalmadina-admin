import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaSearch,
  FaFilter,
  FaUndo,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaBoxOpen,
  FaSpinner,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaClipboardList,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaBuilding,
  FaCreditCard,
  FaMoneyBillWave,
  FaPhone,
  FaHashtag,
  FaDollarSign,
  FaBox,
  FaUserCircle,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ListingOrders.css";
import axiosInstance from "../../utils/axiosInstance";

export default function ListingOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");

  const orderStatuses = [
    {
      value: "pending",
      label: "Pending",
      color: "#ff9800",
      icon: <FaSpinner />,
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "#2196f3",
      icon: <FaCheckCircle />,
    },
    {
      value: "processing",
      label: "Processing",
      color: "#9c27b0",
      icon: <FaSync />,
    },
    { value: "shipped", label: "Shipped", color: "#00bcd4", icon: <FaTruck /> },
    {
      value: "delivered",
      label: "Delivered",
      color: "#4caf50",
      icon: <FaBoxOpen />,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "#f44336",
      icon: <FaTimesCircle />,
    },
  ];

  const getOrderStatusConfig = (status) =>
    orderStatuses.find((s) => s.value === status) || orderStatuses[0];

  const getStatusBadge = (status) => {
    const config = getOrderStatusConfig(status);
    return (
      <span className={`listing-order-status-badge status-${status}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  const formatDateTime = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const showSuccessMessage = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showErrorMessage = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/material/admin/orders");
      let ordersData = [];
      if (response.data.data && Array.isArray(response.data.data))
        ordersData = response.data.data;
      else if (Array.isArray(response.data)) ordersData = response.data;
      else if (response.data.orders && Array.isArray(response.data.orders))
        ordersData = response.data.orders;

      const formattedOrders = ordersData.map((order) => ({
        id: order._id,
        userId: order.userId,
        materialId: order.materialId,
        quantity: order.quantity,
        pricePerUnit: order.pricePerUnit,
        totalAmount: order.totalAmount,
        addressLine: order.addressLine,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
      showSuccessMessage(
        `Loaded ${formattedOrders.length} listings successfully`,
      );
    } catch (error) {
      console.error("Error fetching listings:", error);
      if (error.response?.status === 401) {
        showErrorMessage("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        showErrorMessage(
          `Failed to load listings: ${error.response?.data?.message || error.message}`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.materialId?.materialName?.toLowerCase().includes(search) ||
          order.userId?.email?.toLowerCase().includes(search) ||
          order.addressLine?.toLowerCase().includes(search) ||
          order.id?.toLowerCase().includes(search) ||
          order.materialId?.supplierName?.toLowerCase().includes(search) ||
          order.userId?.name?.toLowerCase().includes(search) ||
          order.userId?.phone?.toLowerCase().includes(search),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.paymentMethod === paymentMethodFilter,
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= new Date(dateRange.start),
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) <= new Date(dateRange.end),
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentMethodFilter, dateRange, orders]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setDateRange({ start: "", end: "" });
    setFiltersVisible(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / itemsPerPage),
  );

  return (
    <div className="listing-orders-container">
      {successMessage && (
        <div className="listing-success-toast">
          <FaCheckCircle className="toast-icon" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="listing-error-toast">
          <FaExclamationTriangle className="toast-icon" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="listing-header-section">
        <div>
          <h3 className="listing-page-title">
            <FaClipboardList /> Listing Orders
          </h3>
          <p className="listing-page-subtitle">
            View and track all customer orders / listings
          </p>
        </div>
        <div className="listing-header-actions">
          <div className="listing-search-wrapper">
            <FaSearch className="listing-search-icon" />
            <input
              type="text"
              placeholder="Search by order ID, material, customer, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="listing-search-input"
            />
          </div>
          <button
            className={`listing-btn-filter ${filtersVisible ? "active" : ""}`}
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            <FaFilter /> Filters
          </button>
          <button className="listing-btn-refresh" onClick={fetchOrders}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {filtersVisible && (
        <div className="listing-filters-panel">
          <div className="listing-filters-grid">
            <div className="listing-filters-groups">
              <label>Order Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="listing-filter-select"
              >
                <option value="all">All Status</option>
                {orderStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="listing-filters-groups">
              <label>Payment Method</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="listing-filter-select"
              >
                <option value="all">All Methods</option>
                <option value="COD">Cash on Delivery</option>
                <option value="online">Online Payment</option>
              </select>
            </div>
            <div className="listing-filters-groups">
              <label>From Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="listing-filter-input"
              />
            </div>
            <div className="listing-filters-groups">
              <label>To Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="listing-filter-input"
              />
            </div>
            <div className="listing-filter-actions">
              <button className="listing-btn-reset" onClick={resetFilters}>
                <FaUndo /> Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="listing-content-wrapper">
        <div className="listing-table-responsive">
          {loading ? (
            <div className="listing-loader-container">
              <div className="listing-spinner"></div>
              <p>Loading listings...</p>
            </div>
          ) : (
            <>
              <table className="listing-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Info</th>
                    <th>User Details</th>
                    <th>Material Details</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length ? (
                    currentItems.map((order, index) => (
                      <tr key={order.id}>
                        <td data-label="Order ID">
                          <span className="listing-order-id">
                            {order.id?.slice(-8) || `#${index + 1}`}
                          </span>
                        </td>

                        <td data-label="Customer Info">
                          <div className="listing-customer-details">
                            <div className="listing-customer-email">
                              <FaEnvelope /> {order.userId?.email || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td data-label="Material Details">
                          <div className="listing-material-details">
                            <strong className="listing-material-name">
                              {order.materialId?.materialName || "N/A"}
                            </strong>
                          </div>
                        </td>

                        <td data-label="Quantity">
                          <span>
                            {order.quantity}{" "}
                            {order.materialId?.priceUnit || "units"}
                          </span>
                        </td>
                        <td data-label="Total Amount">
                          <strong className="listing-total-amount">
                            {formatPrice(order.totalAmount)}
                          </strong>
                        </td>

                        <td data-label="Payment Method">
                          <span
                            className={`listing-payment-badge payment-${order.paymentMethod?.toLowerCase() || "cod"}`}
                          >
                            {order.paymentMethod === "COD" ? (
                              <FaMoneyBillWave />
                            ) : (
                              <FaCreditCard />
                            )}
                            {order.paymentMethod || "COD"}
                          </span>
                        </td>
                        <td data-label="Order Status">
                          {getStatusBadge(order.orderStatus)}
                        </td>

                        <td data-label="Actions">
                          <div className="listing-action-buttons">
                            <button
                              className="listing-action-btn view-btn"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12">
                        <div className="listing-empty-state">
                          <FaExclamationTriangle className="listing-empty-icon" />
                          <p>No listings found</p>
                          <button
                            className="listing-btn-refresh-empty"
                            onClick={fetchOrders}
                          >
                            <FaSync /> Refresh Listings
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {filteredOrders.length > 0 && (
                <div className="listing-pagination-container">
                  <div className="listing-pagination-info">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredOrders.length)} of{" "}
                    {filteredOrders.length} listings
                  </div>
                  <div className="listing-pagination-controls">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="listing-pagination-btn"
                    >
                      {" "}
                      Previous
                    </button>
                    <div className="listing-page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) =>
                          number === 1 ||
                          number === totalPages ||
                          (number >= currentPage - 1 &&
                            number <= currentPage + 1) ? (
                            <button
                              key={number}
                              onClick={() => setCurrentPage(number)}
                              className={`listing-page-number ${currentPage === number ? "active" : ""}`}
                            >
                              {number}
                            </button>
                          ) : number === currentPage - 2 ||
                            number === currentPage + 2 ? (
                            <span
                              key={number}
                              className="listing-page-ellipsis"
                            >
                              ...
                            </span>
                          ) : null,
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="listing-pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div
          className="listing-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="listing-modal-box listing-order-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="listing-modal-header">
              <h5>
                <FaClipboardList /> Complete Order Details
              </h5>
              <button
                className="listing-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                <FaTimesCircle />
              </button>
            </div>
            <div className="listing-modal-body">
              <div className="listing-order-summary">
                <div className="listing-summary-header">
                  <h6>
                    Order ID:{" "}
                    <span className="listing-order-id-full">
                      {selectedOrder.id}
                    </span>
                  </h6>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
              </div>
              <div className="listing-details-grid">
                <div className="listing-details-section">
                  <h6>Customer Information</h6>
                  <div className="listing-detail-item">
                    <FaUser className="detail-icon" />
                    <strong>Name:</strong>
                    <span>{selectedOrder.userId?.name || "N/A"}</span>
                  </div>
                  <div className="listing-detail-item">
                    <FaHashtag className="detail-icon" />
                    <strong>User ID:</strong>
                    <span>{selectedOrder.userId?._id || "N/A"}</span>
                  </div>
                  <div className="listing-detail-item">
                    <strong>User Role:</strong>
                    <span>{selectedOrder.userId?.role || "Customer"}</span>
                  </div>
                  <div className="listing-detail-item">
                    <strong>Account Status:</strong>
                    <span>
                      {selectedOrder.userId?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {selectedOrder.userId?.address && (
                    <div className="listing-detail-item">
                      <FaMapMarkerAlt className="detail-icon" />
                      <strong>User Address:</strong>
                      <span>{selectedOrder.userId.address}</span>
                    </div>
                  )}
                </div>

                <div className="listing-details-section">
                  <h6>Order Timeline</h6>
                  <div className="listing-detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <strong>Ordered On:</strong>
                    <span>{formatDateTime(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="listing-detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <strong>Last Updated:</strong>
                    <span>{formatDateTime(selectedOrder.updatedAt)}</span>
                  </div>
                </div>

                <div className="listing-details-section">
                  <h6>Material Details</h6>
                  <div className="listing-detail-item">
                    <FaBox className="detail-icon" />
                    <strong>Material Name:</strong>
                    <span>
                      {selectedOrder.materialId?.materialName || "N/A"}
                    </span>
                  </div>
                  <div className="listing-detail-item">
                    <FaBuilding className="detail-icon" />
                    <strong>Supplier:</strong>
                    <span>
                      {selectedOrder.materialId?.supplierName || "N/A"}
                    </span>
                  </div>
                  <div className="listing-detail-item">
                    <strong>SKU:</strong>
                    <span>{selectedOrder.materialId?.sku || "N/A"}</span>
                  </div>
                  <div className="listing-detail-item">
                    <strong>Category:</strong>
                    <span>
                      {selectedOrder.materialId?.categoryId?.name || "N/A"}
                    </span>
                  </div>
                  {selectedOrder.materialId?.categoryId?.image && (
                    <div className="listing-detail-item">
                      <strong>Category Image:</strong>
                      <div className="listing-category-info">
                        <img
                          src={selectedOrder.materialId.categoryId.image}
                          className="listing-category-image"
                          alt="category"
                        />
                      </div>
                    </div>
                  )}
                  <div className="listing-detail-item">
                    <strong>Quantity Ordered:</strong>
                    <span>
                      {selectedOrder.quantity}{" "}
                      {selectedOrder.materialId?.priceUnit || "units"}
                    </span>
                  </div>
                  <div className="listing-detail-item">
                    <strong>Price Per Unit:</strong>
                    <span>{formatPrice(selectedOrder.pricePerUnit)}</span>
                  </div>
                  <div className="listing-detail-item listing-total-amount">
                    <strong>Total Amount:</strong>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                <div className="listing-details-section">
                  <h6>Delivery & Payment Information</h6>
                  <div className="listing-detail-item">
                    <FaMapMarkerAlt className="detail-icon" />
                    <strong>Delivery Address:</strong>
                    <span>{selectedOrder.addressLine || "N/A"}</span>
                  </div>
                  <div className="listing-detail-item">
                    <strong>Payment Method:</strong>
                    <span>{selectedOrder.paymentMethod || "COD"}</span>
                  </div>
                  <div className="listing-detail-item">
                    <strong>Payment Status:</strong>
                    <span>{selectedOrder.paymentStatus || "Pending"}</span>
                  </div>
                </div>

                {selectedOrder.materialId?.photos?.length > 0 && (
                  <div className="listing-details-section">
                    <h6>Material Images</h6>
                    <div className="listing-material-images">
                      {selectedOrder.materialId.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Material ${idx + 1}`}
                          className="listing-material-thumbnail"
                          onClick={() => window.open(photo, "_blank")}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="listing-modal-footer">
              <button
                className="listing-btn-close"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
