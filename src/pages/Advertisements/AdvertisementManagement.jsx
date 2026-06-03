import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaLock,
  FaLockOpen,
  FaPlus,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSearch,
  FaImage,
  FaUpload,
} from "react-icons/fa";
import "./AdvertisementManagement.css";
import axiosInstance from "../../utils/axiosInstance";

export default function AdvertisementManagement() {
  const [advertisements, setAdvertisements] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAdvertisement, setNewAdvertisement] = useState({
    companyName: "",
    userId: "",
    startDate: "",
    endDate: "",
    status: "active",
    sequence: 1,
    bannerImage: null,
    bannerImagePreview: "",
  });
  const [editAdvertisement, setEditAdvertisement] = useState(null);
  const [viewAdvertisement, setViewAdvertisement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch advertisements from API
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/advertisements/admin/all");

      let advertisementsData = [];
      const data = response.data;

      if (Array.isArray(data)) {
        advertisementsData = data;
      } else if (data.data && Array.isArray(data.data)) {
        advertisementsData = data.data;
      } else if (data.advertisements && Array.isArray(data.advertisements)) {
        advertisementsData = data.advertisements;
      } else if (data.result && Array.isArray(data.result)) {
        advertisementsData = data.result;
      }

      const formattedAdvertisements = advertisementsData.map((ad) => ({
        id: ad._id,
        companyName: ad.companyName,
        userId: ad.userId,
        bannerImage: ad.bannerImage || null,
        startDate: ad.startDate,
        endDate: ad.endDate,
        status: ad.status,
        sequence: ad.sequence,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
      }));
      setAdvertisements(formattedAdvertisements);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      if (error.response?.status === 401) {
        showSuccessMessage("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        showSuccessMessage(
          `Failed to load advertisements: ${error.response?.data?.message || error.message}`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await axiosInstance.get("/admin/users/getAll");

      const data = response.data;
      let usersArray = [];

      if (data.users && Array.isArray(data.users)) {
        usersArray = data.users;
      } else if (data.success && data.users) {
        usersArray = data.users;
      } else if (Array.isArray(data)) {
        usersArray = data;
      } else {
        throw new Error("Unexpected API response format");
      }

      const formattedUsers = usersArray.map((user) => ({
        _id: user._id,
        username:
          user.fullName || user.username || user.email?.split("@")[0] || "N/A",
        email: user.email || "N/A",
        phone: user.mobile || user.phone || "N/A",
        fullName: user.fullName || user.username,
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 401) {
        showSuccessMessage("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        showSuccessMessage("Failed to load users");
      }
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredAdvertisements = advertisements.filter((ad) => {
    const search = searchTerm.toLowerCase();
    const userName = ad.userId?.fullName || ad.userId?.username || "";
    const userEmail = ad.userId?.email || "";
    return (
      ad.companyName?.toLowerCase().includes(search) ||
      userName.toLowerCase().includes(search) ||
      userEmail.toLowerCase().includes(search) ||
      String(ad.sequence).toLowerCase().includes(search) ||
      ad.status?.toLowerCase().includes(search)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredAdvertisements.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAdvertisements.length / itemsPerPage),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredAdvertisements, totalPages]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const showSuccessMessage = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        if (isEdit) {
          setEditError(
            "Please upload a valid image file (JPEG, PNG, GIF, or WEBP)",
          );
        } else {
          setAddError(
            "Please upload a valid image file (JPEG, PNG, GIF, or WEBP)",
          );
        }
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        if (isEdit) {
          setEditError("Image size should be less than 5MB");
        } else {
          setAddError("Image size should be less than 5MB");
        }
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditAdvertisement({
            ...editAdvertisement,
            bannerImage: file,
            bannerImagePreview: reader.result,
          });
        } else {
          setNewAdvertisement({
            ...newAdvertisement,
            bannerImage: file,
            bannerImagePreview: reader.result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!newAdvertisement.companyName.trim()) {
      setAddError("Company name cannot be empty");
      return;
    }

    if (newAdvertisement.companyName.length < 2) {
      setAddError("Company name must be at least 2 characters long");
      return;
    }

    if (newAdvertisement.companyName.length > 100) {
      setAddError("Company name cannot exceed 100 characters");
      return;
    }

    if (!newAdvertisement.userId) {
      setAddError("Please select a user");
      return;
    }

    if (!newAdvertisement.startDate) {
      setAddError("Please select start date");
      return;
    }

    if (!newAdvertisement.endDate) {
      setAddError("Please select end date");
      return;
    }

    if (new Date(newAdvertisement.startDate) >= new Date(newAdvertisement.endDate)) {
      setAddError("End date must be after start date");
      return;
    }

    if (!newAdvertisement.sequence || newAdvertisement.sequence < 1) {
      setAddError("Sequence must be at least 1");
      return;
    }

    if (newAdvertisement.sequence > 999) {
      setAddError("Sequence cannot exceed 999");
      return;
    }

    if (!newAdvertisement.bannerImage) {
      setAddError("Please upload a banner image");
      return;
    }

    try {
      setLoading(true);
      setAddError("");

      const formData = new FormData();
      formData.append("companyName", newAdvertisement.companyName.trim());
      formData.append("userId", newAdvertisement.userId);
      formData.append("startDate", newAdvertisement.startDate);
      formData.append("endDate", newAdvertisement.endDate);
      formData.append("status", newAdvertisement.status);
      formData.append("sequence", newAdvertisement.sequence.toString());
      if (newAdvertisement.bannerImage) {
        formData.append("bannerImage", newAdvertisement.bannerImage);
      }

      await axiosInstance.post("/advertisements/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchAdvertisements();
      setNewAdvertisement({
        companyName: "",
        userId: "",
        startDate: "",
        endDate: "",
        status: "active",
        sequence: 1,
        bannerImage: null,
        bannerImagePreview: "",
      });
      setShowModal(false);
      showSuccessMessage(`Advertisement "${newAdvertisement.companyName}" added successfully!`);
    } catch (error) {
      console.error("Error adding advertisement:", error);
      if (error.response) {
        setAddError(error.response.data.message || "Failed to add advertisement");
      } else if (error.request) {
        setAddError("Network error: Unable to connect to server");
      } else {
        setAddError(error.message || "Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    const adToDelete = advertisements.find((ad) => ad.id === id);
    setDeleteConfirm({
      id,
      name: adToDelete?.companyName,
      show: true,
      type: "advertisement",
    });
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);

      if (deleteConfirm.type === "advertisement") {
        await axiosInstance.delete(`/advertisements/${deleteConfirm.id}`);
        await fetchAdvertisements();
        showSuccessMessage(`"${deleteConfirm.name}" has been deleted successfully!`);
      }

      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting:", error);
      if (error.response) {
        showSuccessMessage(error.response.data.message || "Failed to delete");
      } else {
        showSuccessMessage("Failed to delete");
      }
    } finally {
      setLoading(false);
    }
  };

const toggleStatus = async (id, currentStatus) => {
  const adToToggle = advertisements.find((ad) => ad.id === id);
  // Change: Use "inactive" instead of "blocked"
  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    setLoading(true);
    
    const response = await axiosInstance.patch(`/advertisements/status/${id}`, {
      status: newStatus
    });
    
    await fetchAdvertisements();
    showSuccessMessage(
      `"${adToToggle.companyName}" status updated to ${newStatus} successfully`,
    );
  } catch (error) {
    console.error("Error updating status:", error);
    const errorMessage = error.response?.data?.message || "Failed to update status";
    showSuccessMessage(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleEditSave = async () => {
  if (!editAdvertisement.companyName.trim()) {
    setEditError("Company name cannot be empty");
    return;
  }

  if (editAdvertisement.companyName.length < 2) {
    setEditError("Company name must be at least 2 characters long");
    return;
  }

  if (editAdvertisement.companyName.length > 100) {
    setEditError("Company name cannot exceed 100 characters");
    return;
  }

  if (!editAdvertisement.userId) {
    setEditError("Please select a user");
    return;
  }

  if (!editAdvertisement.startDate) {
    setEditError("Please select start date");
    return;
  }

  if (!editAdvertisement.endDate) {
    setEditError("Please select end date");
    return;
  }

  if (new Date(editAdvertisement.startDate) >= new Date(editAdvertisement.endDate)) {
    setEditError("End date must be after start date");
    return;
  }

  if (!editAdvertisement.sequence || editAdvertisement.sequence < 1) {
    setEditError("Sequence must be at least 1");
    return;
  }

  if (editAdvertisement.sequence > 999) {
    setEditError("Sequence cannot exceed 999");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("companyName", editAdvertisement.companyName.trim());
    formData.append("userId", editAdvertisement.userId);
    formData.append("startDate", editAdvertisement.startDate);
    formData.append("endDate", editAdvertisement.endDate);
    formData.append("status", editAdvertisement.status);
    formData.append("sequence", editAdvertisement.sequence.toString());
    if (editAdvertisement.bannerImage && typeof editAdvertisement.bannerImage !== "string") {
      formData.append("bannerImage", editAdvertisement.bannerImage);
    }

    await axiosInstance.put(`/advertisements/update/${editAdvertisement.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    await fetchAdvertisements();
    setEditAdvertisement(null);
    setEditError("");
    showSuccessMessage(`Advertisement has been updated successfully!`);
  } catch (error) {
    console.error("Error updating advertisement:", error);
    if (error.response) {
      setEditError(
        error.response.data.message || "Failed to update advertisement",
      );
    } else {
      setEditError(error.message || "Failed to update advertisement");
    }
  } finally {
    setLoading(false);
  }
};

  const removeImage = (isEdit = false) => {
    if (isEdit) {
      setEditAdvertisement({ ...editAdvertisement, bannerImage: null, bannerImagePreview: "" });
    } else {
      setNewAdvertisement({ ...newAdvertisement, bannerImage: null, bannerImagePreview: "" });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserDisplay = (userId) => {
    if (!userId) return "N/A";
    if (typeof userId === "object" && userId !== null) {
      return `${userId.fullName || userId.username || "N/A"} (${userId.email || "N/A"})`;
    }
    const user = users.find((u) => u._id === userId);
    if (user) {
      return `${user.fullName || user.username} (${user.email})`;
    }
    return "User not found";
  };

  return (
    <div className="category-container">
      {successMessage && (
        <div className="success-toast">
          <FaCheckCircle className="toast-icon" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Confirm Delete</h5>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body delete-body">
              <FaExclamationTriangle className="delete-warning-icon" />
              <p>Are you sure you want to delete "{deleteConfirm.name}"?</p>
              <p className="delete-hint">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-delete" onClick={confirmDelete} disabled={loading}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="header-section">
        <div>
          <h3 className="page-title">Advertisement Management</h3>
          <p className="page-subtitle">Manage all banner advertisements</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative" }}>
            <FaSearch
              style={{
                position: "absolute",
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                color: "#999",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search by company, user or sequence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 12px 8px 32px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                width: "300px",
              }}
            />
          </div>

          <button
            className="btn-add"
            onClick={() => {
              setShowModal(true);
              setAddError("");
              setNewAdvertisement({
                companyName: "",
                userId: "",
                startDate: "",
                endDate: "",
                status: "active",
                sequence: 1,
                bannerImage: null,
                bannerImagePreview: "",
              });
            }}
            disabled={loading}
          >
            <FaPlus style={{ marginRight: "8px" }} /> Add Advertisement
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              <table className="material-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Banner</th>
                    <th>Company</th>
                    <th>User</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    {/* <th>Sequence</th> */}
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((advertisement, index) => (
                      <tr key={advertisement.id}>
                        <td className="sr-cell">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="image-cell">
                          {advertisement.bannerImage ? (
                            <img
                              src={advertisement.bannerImage}
                              alt={advertisement.companyName}
                              className="advertisement-image"
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          ) : (
                            <div className="no-image">
                              <FaImage color="#999" size={24} />
                            </div>
                          )}
                        </td>
                        <td className="name-cell">
                          <strong>{advertisement.companyName}</strong>
                        </td>
                        <td className="description-cell">
                          <div style={{ fontSize: "13px" }}>
                            <div>{getUserDisplay(advertisement.userId)}</div>
                          </div>
                        </td>
                        <td>{formatDate(advertisement.startDate)}</td>
                        <td>{formatDate(advertisement.endDate)}</td>
                        {/* <td style={{ textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            backgroundColor: "#e0f2fe",
                            borderRadius: "6px",
                            fontWeight: "600",
                            fontSize: "12px"
                          }}>
                            #{advertisement.sequence}
                          </span>
                        </td> */}
                        <td>
                          <span className={`status-badge ${
  advertisement.status === "active" ? "active" : "inactive"
}`}>
  {advertisement.status === "active" ? "Active" : "Inactive"}
</span>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button
                              className="table-action-btn view-btn"
                              onClick={() => setViewAdvertisement(advertisement)}
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="table-action-btn edit-btn"
                              onClick={() => {
                                const startDate = advertisement.startDate 
                                  ? new Date(advertisement.startDate).toISOString().split('T')[0] 
                                  : "";
                                const endDate = advertisement.endDate 
                                  ? new Date(advertisement.endDate).toISOString().split('T')[0] 
                                  : "";
                                setEditAdvertisement({
                                  ...advertisement,
                                  startDate: startDate,
                                  endDate: endDate,
                                  bannerImagePreview: advertisement.bannerImage,
                                });
                                setEditError("");
                              }}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="table-action-btn delete-btn"
                              onClick={() => handleDelete(advertisement.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                            <button
                              className={`table-action-btn ${
                                advertisement.status === "active"
                                  ? "lock-btn"
                                  : "unlock-btn"
                              }`}
                              onClick={() => toggleStatus(advertisement.id, advertisement.status)}
                              title={advertisement.status === "active" ? "Deactivate" : "Activate"}
                            >
                              {advertisement.status === "active" ? (
                                <FaLock />
                              ) : (
                                <FaLockOpen />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="empty-row">
                      <td colSpan="9">
                        <div className="empty-state">
                          <FaExclamationTriangle className="empty-icon" />
                          <p>No advertisements found</p>
                          <button
                            className="btn-add-small"
                            onClick={() => setShowModal(true)}
                          >
                            <FaPlus /> Add Your First Advertisement
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {filteredAdvertisements.length > 0 && (
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
                      {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1,
                      ).map((number) => {
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
                              className={`page-number ${currentPage === number ? "active" : ""}`}
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
                      })}
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
                    {Math.min(indexOfLastItem, filteredAdvertisements.length)}{" "}
                    of {filteredAdvertisements.length} advertisements
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ADD ADVERTISEMENT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Add New Advertisement</h5>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <label className="input-label">Banner Image *</label>
              <div className="image-upload-container">
                {newAdvertisement.bannerImagePreview ? (
                  <div className="image-previews">
                    <img src={newAdvertisement.bannerImagePreview} alt="Banner preview" />
                    <button type="button" className="remove-image" onClick={() => removeImage(false)}>
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-area" onClick={() => document.getElementById('bannerImageInput').click()}>
                    <label className="upload-label">
                      <FaUpload size={32} />
                      <span>Click to upload banner image</span>
                      <small>Recommended: 1200x400px, max 5MB (JPEG, PNG, GIF, WEBP)</small>
                    </label>
                    <input
                      id="bannerImageInput"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => handleImageChange(e, false)}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </div>

              <label className="input-label">Company Name *</label>
              <input
                className={`modal-input ${addError ? "error" : ""}`}
                placeholder="Enter company name"
                value={newAdvertisement.companyName}
                onChange={(e) => {
                  setNewAdvertisement({ ...newAdvertisement, companyName: e.target.value });
                  if (addError) setAddError("");
                }}
                autoFocus
              />

              <label className="input-label" style={{ marginTop: "15px" }}>
                Select User *
              </label>
              <select
                className={`modal-input ${addError ? "error" : ""}`}
                value={newAdvertisement.userId}
                onChange={(e) => {
                  setNewAdvertisement({ ...newAdvertisement, userId: e.target.value });
                  if (addError) setAddError("");
                }}
                disabled={usersLoading}
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.fullName || user.username} ({user.email})
                  </option>
                ))}
              </select>
              {usersLoading && <div className="input-hint">Loading users...</div>}

              <label className="input-label" style={{ marginTop: "15px" }}>
                Start Date *
              </label>
              <input
                type="date"
                className={`modal-input ${addError ? "error" : ""}`}
                value={newAdvertisement.startDate}
                onChange={(e) => {
                  setNewAdvertisement({ ...newAdvertisement, startDate: e.target.value });
                  if (addError) setAddError("");
                }}
              />

              <label className="input-label" style={{ marginTop: "15px" }}>
                End Date *
              </label>
              <input
                type="date"
                className={`modal-input ${addError ? "error" : ""}`}
                value={newAdvertisement.endDate}
                onChange={(e) => {
                  setNewAdvertisement({ ...newAdvertisement, endDate: e.target.value });
                  if (addError) setAddError("");
                }}
              />

              {/* <label className="input-label" style={{ marginTop: "15px" }}>
                Sequence *
              </label>
              <input
                type="number"
                className={`modal-input ${addError ? "error" : ""}`}
                placeholder="Enter display sequence (1-999)"
                value={newAdvertisement.sequence}
                onChange={(e) => {
                  setNewAdvertisement({ ...newAdvertisement, sequence: parseInt(e.target.value) || 1 });
                  if (addError) setAddError("");
                }}
                min="1"
                max="999"
              /> */}

              <label className="input-label" style={{ marginTop: "15px" }}>
                Status
              </label>
              <select
                className="modal-input"
                value={newAdvertisement.status}
                onChange={(e) => setNewAdvertisement({ ...newAdvertisement, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>

              {addError && (
                <div className="error-message">
                  <FaExclamationTriangle className="error-icon" />
                  <span>{addError}</span>
                </div>
              )}
              {/* <div className="input-hint">
                * Company name: 2-100 characters | Sequence: 1-999 | Banner image is required
              </div> */}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleAdd} disabled={loading}>
                Save Advertisement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ADVERTISEMENT MODAL - ALL FIELDS EDITABLE */}
{editAdvertisement && (
  <div className="modal-overlay" onClick={() => setEditAdvertisement(null)}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h5>Edit Advertisement</h5>
        <button className="modal-close" onClick={() => setEditAdvertisement(null)}>
          <FaTimes />
        </button>
      </div>
      <div className="modal-body">
        <label className="input-label">Banner Image</label>
        <div className="image-upload-container">
          {editAdvertisement.bannerImagePreview ? (
            <div className="image-previews">
              <img src={editAdvertisement.bannerImagePreview} alt="Banner preview" />
              <button type="button" className="remove-image" onClick={() => removeImage(true)}>
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="image-upload-area" onClick={() => document.getElementById('editBannerImageInput').click()}>
              <label className="upload-label">
                <FaUpload size={32} />
                <span>Click to upload new banner image</span>
                <small>Recommended: 1200x400px, max 5MB</small>
              </label>
              <input
                id="editBannerImageInput"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => handleImageChange(e, true)}
                style={{ display: "none" }}
              />
            </div>
          )}
        </div>

        <label className="input-label">Company Name *</label>
        <input
          className={`modal-input ${editError ? "error" : ""}`}
          value={editAdvertisement.companyName}
          onChange={(e) => {
            setEditAdvertisement({ ...editAdvertisement, companyName: e.target.value });
            if (editError) setEditError("");
          }}
        />

        <label className="input-label" style={{ marginTop: "15px" }}>
          Select User *
        </label>
        <select
          className={`modal-input ${editError ? "error" : ""}`}
          value={editAdvertisement.userId}
          onChange={(e) => {
            setEditAdvertisement({ ...editAdvertisement, userId: e.target.value });
            if (editError) setEditError("");
          }}
          disabled={usersLoading}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.fullName || user.username} ({user.email})
            </option>
          ))}
        </select>

        <label className="input-label" style={{ marginTop: "15px" }}>
          Start Date *
        </label>
        <input
          type="date"
          className={`modal-input ${editError ? "error" : ""}`}
          value={editAdvertisement.startDate}
          onChange={(e) => {
            setEditAdvertisement({ ...editAdvertisement, startDate: e.target.value });
            if (editError) setEditError("");
          }}
        />

        <label className="input-label" style={{ marginTop: "15px" }}>
          End Date *
        </label>
        <input
          type="date"
          className={`modal-input ${editError ? "error" : ""}`}
          value={editAdvertisement.endDate}
          onChange={(e) => {
            setEditAdvertisement({ ...editAdvertisement, endDate: e.target.value });
            if (editError) setEditError("");
          }}
        />

        <label className="input-label" style={{ marginTop: "15px" }}>
          Sequence *
        </label>
        <input
          type="number"
          className={`modal-input ${editError ? "error" : ""}`}
          placeholder="Enter display sequence (1-999)"
          value={editAdvertisement.sequence}
          onChange={(e) => {
            setEditAdvertisement({ ...editAdvertisement, sequence: parseInt(e.target.value) || 1 });
            if (editError) setEditError("");
          }}
          min="1"
          max="999"
        />

        {/* <label className="input-label" style={{ marginTop: "15px" }}>
          Status
        </label>
        <select
          className="modal-input"
          value={editAdvertisement.status}
          onChange={(e) => setEditAdvertisement({ ...editAdvertisement, status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select> */}

        {editError && (
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <span>{editError}</span>
          </div>
        )}
        <div className="input-hint">
          * Company name: 2-100 characters | Sequence: 1-999
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-cancel" onClick={() => setEditAdvertisement(null)}>
          Cancel
        </button>
        <button className="btn-save" onClick={handleEditSave} disabled={loading}>
          Update Advertisement
        </button>
      </div>
    </div>
  </div>
)}
      {/* VIEW ADVERTISEMENT MODAL */}
      {viewAdvertisement && (
        <div className="modal-overlay" onClick={() => setViewAdvertisement(null)}>
          <div className="modal-box view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Advertisement Details</h5>
              <button className="modal-close" onClick={() => setViewAdvertisement(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body view-body">
              {viewAdvertisement.bannerImage && (
                <div className="view-item">
                  <span className="view-label">Banner Image:</span>
                  <div className="view-value">
                    <img
                      src={viewAdvertisement.bannerImage}
                      alt={viewAdvertisement.companyName}
                      style={{
                        width: "200px",
                        height: "auto",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="view-item">
                <span className="view-label">Company Name:</span>
                <span className="view-value">{viewAdvertisement.companyName}</span>
              </div>
              <div className="view-item">
                <span className="view-label">User:</span>
                <span className="view-value">{getUserDisplay(viewAdvertisement.userId)}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Start Date:</span>
                <span className="view-value">{formatDate(viewAdvertisement.startDate)}</span>
              </div>
              <div className="view-item">
                <span className="view-label">End Date:</span>
                <span className="view-value">{formatDate(viewAdvertisement.endDate)}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Sequence:</span>
                <span className="view-value">{viewAdvertisement.sequence}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Status:</span>
                <span className={`view-status ${viewAdvertisement.status === "active" ? "active" : "inactive"}`}>
  {viewAdvertisement.status === "active" ? "Active" : "Inactive"}
</span>
              </div>
              {/* <div className="view-item">
                <span className="view-label">Created At:</span>
                <span className="view-value">{new Date(viewAdvertisement.createdAt).toLocaleString()}</span>
              </div>
              <div className="view-item">
                <span className="view-label">Last Updated:</span>
                <span className="view-value">{new Date(viewAdvertisement.updatedAt).toLocaleString()}</span>
              </div>
              <div className="view-item">
                <span className="view-label">ID:</span>
                <span className="view-value">{viewAdvertisement.id}</span>
              </div> */}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setViewAdvertisement(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}