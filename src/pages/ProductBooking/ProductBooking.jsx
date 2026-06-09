import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTools,
  FaUser,
  FaUndo,
  FaCheck,
  FaBan,
  FaClock,
  FaUsers,
  FaMobile,
  FaEnvelope,
  FaUserCheck,
  FaChartLine,
  FaBuilding,
  FaMoneyBillWave,
  FaCalendarWeek,
  FaImage,
  FaCube,
  FaTachometerAlt,
  FaWeightHanging,
  FaBatteryFull,
  FaCalendarCheck,
  FaInfoCircle,
  FaDollarSign,
  FaPercentage,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProductBooking.css";
import axiosInstance from "../../utils/axiosInstance";

export default function ProductBooking() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [viewListing, setViewListing] = useState(null);
  const [interestsModal, setInterestsModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedImage, setSelectedImage] = useState(null);

  // State for admin overview data
  const [adminOverview, setAdminOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [pagination, setPagination] = useState(null);

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return false;
    }
    return true;
  };

  // Fetch admin listings from the only API endpoint
  const fetchAdminListings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/booking/admin/listings-overview",
      );

      console.log("API Response:", response.data);

      // Extract data from response
      const responseData = response.data;

      // Check if response has success flag and data
      if (responseData.success && responseData.data) {
        const listingsData = responseData.data;
        const paginationData = responseData.pagination;

        // Set pagination
        if (paginationData) {
          setPagination(paginationData);
          // Update items per page from API if needed
          if (paginationData.perPage) {
            setItemsPerPage(paginationData.perPage);
          }
        }

        // Format the listings data
        const formattedListings = listingsData.map((listing) => ({
          id: listing._id,
          userId: listing.userId,
          name: listing.name,
          description: listing.description,
          addressLine: listing.addressLine,
          listingCategory: listing.listingCategory,
          categoryId: listing.categoryId,
          subCategoryId: listing.subCategoryId,
          listingType: listing.listingType,
          status: listing.status,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
          photos: listing.photos || [],
          companyName: listing.companyName,
          equipmentData: listing.equipmentData,
          rentDetails: listing.rentDetails,
          location: listing.location,
          interestsCount: listing.interestsCount || 0,
          bookingsCount: listing.bookingsCount || 0,
          interests: listing.interests || [],
        }));

        setListings(formattedListings);
        setFilteredListings(formattedListings);

        // Calculate overview statistics from the data
        const totalListings = listingsData.length;
        const activeListings = listingsData.filter(
          (l) => l.status === "active",
        ).length;
        const pendingListings = listingsData.filter(
          (l) => l.status === "pending",
        ).length;
        const completedListings = listingsData.filter(
          (l) => l.status === "completed",
        ).length;
        const cancelledListings = listingsData.filter(
          (l) => l.status === "cancelled",
        ).length;
        const soldListings = listingsData.filter(
          (l) => l.status === "sold",
        ).length;

        setAdminOverview({
          totalListings,
          activeListings,
          pendingListings,
          completedListings,
          cancelledListings,
          soldListings,
        });
      } else {
        // Handle case when response doesn't have expected structure
        console.error("Unexpected API response structure:", responseData);
        showSuccessMessage("Failed to load listings: Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching admin listings:", error);
      if (error.response?.status === 401) {
        showSuccessMessage("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        showSuccessMessage(
          `Failed to load listings: ${error.response?.data?.message || error.message}`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchAdminListings();
    }
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchTerm, statusFilter, dateRange, listings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange]);

  const filterListings = () => {
    let filtered = [...listings];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.name?.toLowerCase().includes(search) ||
          listing.description?.toLowerCase().includes(search) ||
          listing.addressLine?.toLowerCase().includes(search) ||
          listing.userId?.email?.toLowerCase().includes(search) ||
          listing.companyName?.toLowerCase().includes(search),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((listing) => listing.status === statusFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(
        (listing) => new Date(listing.createdAt) >= new Date(dateRange.start),
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (listing) => new Date(listing.createdAt) <= new Date(dateRange.end),
      );
    }

    setFilteredListings(filtered);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredListings.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredListings.length / itemsPerPage),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredListings, totalPages]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const showSuccessMessage = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: "status-active", icon: <FaCheck />, text: "ACTIVE" },
      pending: { class: "status-pending", icon: <FaClock />, text: "PENDING" },
      cancelled: {
        class: "status-cancelled",
        icon: <FaBan />,
        text: "CANCELLED",
      },
      completed: {
        class: "status-completed",
        icon: <FaCheckCircle />,
        text: "COMPLETED",
      },
      sold: {
        class: "status-sold",
        icon: <FaCheckCircle />,
        text: "SOLD",
      },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getInterestStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: "status-pending", icon: <FaClock />, text: "PENDING" },
      confirmed: {
        class: "status-active",
        icon: <FaCheck />,
        text: "CONFIRMED",
      },
      rejected: {
        class: "status-cancelled",
        icon: <FaBan />,
        text: "REJECTED",
      },
      completed: {
        class: "status-completed",
        icon: <FaCheckCircle />,
        text: "COMPLETED",
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`interest-status-badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount, currency = "AED") => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange({ start: "", end: "" });
    setFiltersVisible(false);
  };

  const openInterestsModal = (listing) => {
    setInterestsModal(listing);
  };

  return (
    <div className="">
      {successMessage && (
        <div className="success-toast">
          <FaCheckCircle className="toast-icon" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="header-section">
        <div>
          <h3 className="page-title">Listings Interests And Booking </h3>
          <p className="page-subtitle">
            Manage all product listings from users
          </p>
        </div>

        <div className="headers-actions">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            className={`btn-filter ${filtersVisible ? "active" : ""}`}
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            <FaFilter /> Filters
          </button>
        </div>
      </div>

      {filtersVisible && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-groups">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div className="filter-groups">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="filter-input"
                placeholder="From Date"
              />
            </div>

            <div className="filter-groups">
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="filter-input"
                placeholder="To Date"
              />
            </div>

            <div className="filter-actions">
              <button className="btn-reset" onClick={resetFilters}>
                <FaUndo /> Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="content-wrapper">
        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Loading listings...</p>
            </div>
          ) : (
            <>
              <table className="requirements-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User Info</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Price/Day</th>
                    <th>Interests</th>
                    <th>Bookings</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((listing, index) => (
                      <tr key={listing.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <div className="user-info">
                            <div className="user-name">
                              {listing.userId?.fullName || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="product-name-cell">
                            <strong>{listing.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">
                            {listing.categoryId?.name ||
                              listing.listingCategory ||
                              "Equipment"}
                          </span>
                        </td>
                        <td>
                          <div className="location-cell">
                            <FaMapMarkerAlt className="location-icon" />
                            <span>
                              {listing.addressLine?.substring(0, 30)}
                              {listing.addressLine?.length > 30 ? "..." : ""}
                            </span>
                          </div>
                        </td>
                        <td>
                          {listing.equipmentData?.pricing?.pricePerDay ? (
                            <div className="price-cell">
                              <span className="price-amount">
                                {formatCurrency(
                                  listing.equipmentData.pricing.pricePerDay,
                                  listing.equipmentData.pricing.currency,
                                )}
                              </span>
                              <span className="price-unit">/day</span>
                            </div>
                          ) : listing.rentDetails?.dailyRate ? (
                            <div className="price-cell">
                              <span className="price-amount">
                                {formatCurrency(listing.rentDetails.dailyRate)}
                              </span>
                              <span className="price-unit">/day</span>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td>
                          <button
                            className="interests-btn"
                            onClick={() => openInterestsModal(listing)}
                            title="View Interests"
                          >
                            <FaUsers />
                            <span className="interests-count">
                              {listing.interestsCount || 0}
                            </span>
                          </button>
                        </td>
                        <td>
                          <span className="bookings-badge">
                            <FaCalendarWeek />
                            {listing.bookingsCount || 0}
                          </span>
                        </td>
                        <td>{getStatusBadge(listing.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn view-btn"
                              onClick={() => setViewListing(listing)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="empty-row">
                      <td colSpan="10">
                        <div className="empty-state">
                          <FaExclamationTriangle className="empty-icon" />
                          <p>No listings found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {filteredListings.length > 0 && (
                <div className="pagination-container">
                  <div className="pagination-controls">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    <div className="page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) => {
                          if (
                            number === 1 ||
                            number === totalPages ||
                            (number >= currentPage - 1 &&
                              number <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`page-number ${
                                  currentPage === number ? "active" : ""
                                }`}
                              >
                                {number}
                              </button>
                            );
                          } else if (
                            number === currentPage - 2 ||
                            number === currentPage + 2
                          ) {
                            return (
                              <span key={number} className="page-ellipsis">
                                ...
                              </span>
                            );
                          }
                          return null;
                        },
                      )}
                    </div>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                  <div className="pagination-info">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredListings.length)} of{" "}
                    {filteredListings.length} listings
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Listing Modal - Enhanced with Images and Complete Data */}
      {viewListing && (
        <div className="modal-overlay" onClick={() => setViewListing(null)}>
          <div
            className="modal-box view-modal enhanced-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h5>
                <FaInfoCircle /> Complete Listing Details
              </h5>
              <button
                className="modal-close"
                onClick={() => setViewListing(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body view-body enhanced-body">
              {/* Image Gallery Section */}
              {viewListing.photos && viewListing.photos.length > 0 && (
                <div className="view-section image-gallery-section">
                  <h6>
                    <FaImage /> Product Images ({viewListing.photos.length})
                  </h6>
                  <div className="image-gallery">
                    {viewListing.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="gallery-image"
                        onClick={() => setSelectedImage(photo)}
                      >
                        <img src={photo} alt={`Product ${idx + 1}`} />
                        <div className="image-overlay">
                          <FaEye />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Information */}
              <div className="view-section">
                <h6>
                  <FaUser /> User Information
                </h6>
                <div className="info-grid">
                  <div className="view-item">
                    <span className="view-label">Full Name:</span>
                    <span className="view-value">
                      {viewListing.userId?.fullName || "N/A"}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">Email:</span>
                    <span className="view-value">
                      {viewListing.userId?.email || "N/A"}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">Mobile:</span>
                    <span className="view-value">
                      {viewListing.userId?.mobile?.number
                        ? `${viewListing.userId.mobile.countryCode || "+971"} ${viewListing.userId.mobile.number}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">User Status:</span>
                    <span className="view-value">
                      {viewListing.userId?.status === "active" ? (
                        <span className="status-active-text">Active</span>
                      ) : (
                        <span className="status-inactive-text">Inactive</span>
                      )}
                    </span>
                  </div>
                  {viewListing.companyName && (
                    <div className="view-item">
                      <span className="view-label">
                        <FaBuilding /> Company:
                      </span>
                      <span className="view-value">
                        {viewListing.companyName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Basic Information */}
              <div className="view-section">
                <h6>
                  <FaCube /> Product Information
                </h6>
                <div className="info-grid">
                  <div className="view-item">
                    <span className="view-label">Product Name:</span>
                    <span className="view-value">{viewListing.name}</span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">Category:</span>
                    <span className="view-value">
                      {viewListing.categoryId?.name ||
                        viewListing.listingCategory}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">Listing Type:</span>
                    <span className="view-value">
                      {viewListing.listingType?.toUpperCase()}
                    </span>
                  </div>
                  <div className="view-item full-width">
                    <span className="view-label">Description:</span>
                    <span className="view-value">
                      {viewListing.description || "No description provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Equipment Specific Details */}
              {viewListing.equipmentData && (
                <>
                  <div className="view-section">
                    <h6>
                      <FaTools /> Equipment Specifications
                    </h6>
                    <div className="info-grid">
                      <div className="view-item">
                        <span className="view-label">Equipment Type:</span>
                        <span className="view-value">
                          {viewListing.equipmentData.equipmentType || "N/A"}
                        </span>
                      </div>
                      <div className="view-item">
                        <span className="view-label">Brand:</span>
                        <span className="view-value">
                          {viewListing.equipmentData.brand || "N/A"}
                        </span>
                      </div>
                      <div className="view-item">
                        <span className="view-label">Model:</span>
                        <span className="view-value">
                          {viewListing.equipmentData.model || "N/A"}
                        </span>
                      </div>
                      <div className="view-item">
                        <span className="view-label">Condition:</span>
                        <span className="view-value">
                          {viewListing.equipmentData.condition || "N/A"}
                        </span>
                      </div>
                      <div className="view-item">
                        <span className="view-label">Title:</span>
                        <span className="view-value">
                          {viewListing.equipmentData.title || "N/A"}
                        </span>
                      </div>
                      <div className="view-item full-width">
                        <span className="view-label">
                          Equipment Description:
                        </span>
                        <span className="view-value">
                          {viewListing.equipmentData.description || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  {viewListing.equipmentData.specifications && (
                    <div className="view-section">
                      <h6>
                        <FaTachometerAlt /> Technical Specifications
                      </h6>
                      <div className="info-grid">
                        <div className="view-item">
                          <span className="view-label">Power:</span>
                          <span className="view-value">
                            {viewListing.equipmentData.specifications.power ||
                              "N/A"}{" "}
                            {viewListing.equipmentData.specifications.power &&
                              "W"}
                          </span>
                        </div>
                        <div className="view-item">
                          <span className="view-label">Capacity:</span>
                          <span className="view-value">
                            {viewListing.equipmentData.specifications
                              .capacity || "N/A"}{" "}
                            {viewListing.equipmentData.specifications
                              .capacity && "L"}
                          </span>
                        </div>
                        <div className="view-item">
                          <span className="view-label">Weight:</span>
                          <span className="view-value">
                            {viewListing.equipmentData.specifications.weight ||
                              "N/A"}{" "}
                            {viewListing.equipmentData.specifications.weight &&
                              "kg"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Equipment Features */}
                  {viewListing.equipmentData.features && (
                    <div className="view-section">
                      <h6>Features</h6>
                      <div className="features-list">
                        <span
                          className={`feature-tag ${viewListing.equipmentData.features.portable ? "active" : "inactive"}`}
                        >
                          {viewListing.equipmentData.features.portable
                            ? "✓ Portable"
                            : "✗ Not Portable"}
                        </span>
                        <span
                          className={`feature-tag ${viewListing.equipmentData.features.fuelIncluded ? "active" : "inactive"}`}
                        >
                          {viewListing.equipmentData.features.fuelIncluded
                            ? "✓ Fuel Included"
                            : "✗ Fuel Not Included"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Pricing Details */}
                  {viewListing.equipmentData.pricing && (
                    <div className="view-section">
                      <h6>
                        <FaMoneyBillWave /> Pricing Details
                      </h6>
                      <div className="info-grid">
                        <div className="view-item">
                          <span className="view-label">Currency:</span>
                          <span className="view-value">
                            {viewListing.equipmentData.pricing.currency ||
                              "AED"}
                          </span>
                        </div>
                        <div className="view-item">
                          <span className="view-label">Price per Hour:</span>
                          <span className="view-value price-highlight">
                            {formatCurrency(
                              viewListing.equipmentData.pricing.pricePerHour,
                              viewListing.equipmentData.pricing.currency,
                            )}
                          </span>
                        </div>
                        <div className="view-item">
                          <span className="view-label">Price per Day:</span>
                          <span className="view-value price-highlight">
                            {formatCurrency(
                              viewListing.equipmentData.pricing.pricePerDay,
                              viewListing.equipmentData.pricing.currency,
                            )}
                          </span>
                        </div>
                        <div className="view-item">
                          <span className="view-label">Price per Week:</span>
                          <span className="view-value">
                            {formatCurrency(
                              viewListing.equipmentData.pricing.pricePerWeek,
                              viewListing.equipmentData.pricing.currency,
                            )}
                          </span>
                        </div>
                        <div className="view-item">
                          <span className="view-label">Price per Month:</span>
                          <span className="view-value">
                            {formatCurrency(
                              viewListing.equipmentData.pricing.pricePerMonth,
                              viewListing.equipmentData.pricing.currency,
                            )}
                          </span>
                        </div>
                        <div className="view-item">
                          <span className="view-label">Security Deposit:</span>
                          <span className="view-value deposit-highlight">
                            {formatCurrency(
                              viewListing.equipmentData.pricing.securityDeposit,
                              viewListing.equipmentData.pricing.currency,
                            )}
                          </span>
                        </div>
                        <div className="view-item">
                          <span className="view-label">
                            <FaPercentage /> VAT Included:
                          </span>
                          <span className="view-value">
                            {viewListing.equipmentData.pricing.vatIncluded
                              ? "Yes"
                              : "No"}
                          </span>
                        </div>
                        <div className="view-item">
                          <span className="view-label">Available Units:</span>
                          <span className="view-value">
                            {viewListing.equipmentData.quantity
                              ?.availableUnits || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Alternative Rent Details */}
              {viewListing.rentDetails && !viewListing.equipmentData && (
                <div className="view-section">
                  <h6>
                    <FaMoneyBillWave /> Rental Pricing
                  </h6>
                  <div className="info-grid">
                    <div className="view-item">
                      <span className="view-label">Daily Rate:</span>
                      <span className="view-value price-highlight">
                        {formatCurrency(viewListing.rentDetails.dailyRate)}
                      </span>
                    </div>
                    <div className="view-item">
                      <span className="view-label">Weekly Rate:</span>
                      <span className="view-value">
                        {formatCurrency(viewListing.rentDetails.weeklyRate)}
                      </span>
                    </div>
                    <div className="view-item">
                      <span className="view-label">Monthly Rate:</span>
                      <span className="view-value">
                        {formatCurrency(viewListing.rentDetails.monthlyRate)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Details */}
              <div className="view-section">
                <h6>
                  <FaMapMarkerAlt /> Location Details
                </h6>
                <div className="info-grid">
                  <div className="view-item full-width">
                    <span className="view-label">Address:</span>
                    <span className="view-value">
                      {viewListing.addressLine}
                    </span>
                  </div>
                  {viewListing.location?.coordinates && (
                    <>
                      <div className="view-item">
                        <span className="view-label">Latitude:</span>
                        <span className="view-value">
                          {viewListing.location.coordinates[1]}
                        </span>
                      </div>
                      <div className="view-item">
                        <span className="view-label">Longitude:</span>
                        <span className="view-value">
                          {viewListing.location.coordinates[0]}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status & Timeline */}
              <div className="view-section">
                <h6>
                  <FaCalendarCheck /> Status & Timeline
                </h6>
                <div className="info-grid">
                  <div className="view-item">
                    <span className="view-label">Listing Status:</span>
                    {getStatusBadge(viewListing.status)}
                  </div>
                  <div className="view-item">
                    <span className="view-label">Created At:</span>
                    <span className="view-value">
                      {formatDateTime(viewListing.createdAt)}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">Last Updated:</span>
                    <span className="view-value">
                      {formatDateTime(viewListing.updatedAt)}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <FaUsers /> Total Interests:
                    </span>
                    <span className="view-value interest-count">
                      {viewListing.interestsCount || 0}
                    </span>
                  </div>
                  <div className="view-item">
                    <span className="view-label">
                      <FaCalendarWeek /> Total Bookings:
                    </span>
                    <span className="view-value booking-count">
                      {viewListing.bookingsCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setViewListing(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div
            className="image-fullscreen-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="image-close-btn"
              onClick={() => setSelectedImage(null)}
            >
              <FaTimes />
            </button>
            <img src={selectedImage} alt="Fullscreen" />
          </div>
        </div>
      )}

      {/* Interests Modal */}
      {interestsModal && (
        <div className="modal-overlay" onClick={() => setInterestsModal(null)}>
          <div
            className="modal-box interested-users-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h5>
                <FaUsers /> Interests & Bookings
              </h5>
              <button
                className="modal-close"
                onClick={() => setInterestsModal(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="requirement-summary">
                <h6>Listing Details</h6>
                <p>
                  <strong>Product:</strong> {interestsModal.name}
                </p>
                <p>
                  <strong>Location:</strong> {interestsModal.addressLine}
                </p>
                <p>
                  <strong>Total Interests:</strong>{" "}
                  {interestsModal.interestsCount || 0}
                </p>
                <p>
                  <strong>Total Bookings:</strong>{" "}
                  {interestsModal.bookingsCount || 0}
                </p>
              </div>

              <div className="interested-users-list">
                <h6>Interests ({interestsModal.interests?.length || 0})</h6>

                {interestsModal.interests?.length > 0 ? (
                  <div className="users-grid">
                    {interestsModal.interests.map((interest, index) => (
                      <div
                        key={interest._id || index}
                        className="interested-user-card"
                      >
                        <div className="user-card-header">
                          <div className="user-avatar">
                            <FaUser />
                          </div>
                          <div className="user-status">
                            {getInterestStatusBadge(interest.interestStatus)}
                          </div>
                        </div>
                        <div className="user-card-body">
                          <div className="user-detail">
                            <FaEnvelope className="detail-icon" />
                            <span>
                              {interest.interestedUserId?.email || "N/A"}
                            </span>
                          </div>
                          <div className="user-detail">
                            <FaUserCheck className="detail-icon" />
                            <span>
                              {interest.interestedUserId?.fullName || "N/A"}
                            </span>
                          </div>
                          <div className="user-detail">
                            <FaMobile className="detail-icon" />
                            <span>
                              {interest.interestedUserId?.mobile?.number
                                ? `${interest.interestedUserId.mobile.countryCode || "+971"} ${interest.interestedUserId.mobile.number}`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="user-detail">
                            <FaCalendarAlt className="detail-icon" />
                            <span>
                              {formatDate(interest.startDate)} -{" "}
                              {formatDate(interest.endDate)}
                            </span>
                          </div>
                          <div className="user-detail">
                            <FaClock className="detail-icon" />
                            <span>Duration: {interest.totalDays} days</span>
                          </div>
                          {interest.message && (
                            <div className="user-detail message-detail">
                              <span className="message-label">Message:</span>
                              <span className="message-text">
                                {interest.message}
                              </span>
                            </div>
                          )}
                          {interest.bookingId && (
                            <div className="booking-info">
                              <strong>Booking ID:</strong>{" "}
                              {interest.bookingId.bookingNumber}
                              <br />
                              <strong>Booking Status:</strong>{" "}
                              {interest.bookingId.bookingStatus}
                              <br />
                              <strong>Total Amount:</strong>{" "}
                              {formatCurrency(
                                interest.bookingId.pricing?.totalAmount,
                                "AED",
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-interested-users">
                    <FaUsers className="empty-icon" />
                    <p>No interests have been shown for this listing yet.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setInterestsModal(null)}
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
