import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaUser, FaEnvelope, FaTrashAlt, FaGlobe, FaCheckCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import "./DeleteAccount.css";

export default function DeleteAccount() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!confirm) {
      toast.error("You must confirm the data deletion statement");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/auth/delete-account/request", {
        fullName,
        email,
        reason,
      });

      setSuccess(true);
      toast.success("Account deletion request submitted successfully");
    } catch (error) {
      console.error("DELETE ERROR:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit deletion request. Please check details.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-account-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* NAVBAR */}
      <nav className="public-navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate("/")}>
            <FaGlobe className="brand-logo" />
            <span className="brand-name">Ardhal Madina</span>
          </div>

          <div className="navbar-links">
            <button className="nav-item" onClick={() => navigate("/about")}>
              About Us
            </button>
            <button className="nav-item" onClick={() => navigate("/privacy")}>
              Privacy Policy
            </button>
            <button className="nav-item" onClick={() => navigate("/terms")}>
              Terms & Conditions
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="delete-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-icon-wrapper">
            <FaTrashAlt />
          </div>
          <h1 className="hero-title">Delete Account</h1>
          <p className="hero-subtitle">Permanently delete your Ardh Al Madina account and all associated data</p>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="delete-content-container">
        {success ? (
          <div className="delete-success-card">
            <FaCheckCircle className="success-icon" />
            <h2>Deletion Request Submitted</h2>
            <p>
              Your account deletion request has been processed successfully. 
              Your profile, orders, and all related data will be permanently deleted from our system shortly.
            </p>
            <button className="btn-back-home" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        ) : (
          <div className="delete-paper">
            <div className="warning-box">
              <FaExclamationTriangle className="warning-icon" />
              <div className="warning-text">
                <h3>Warning: This action is permanent!</h3>
                <p>
                  Your account and all associated data will be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="delete-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your registered email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Leaving (Optional)</label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="privacy">Privacy concerns</option>
                  <option value="no-longer-needed">I no longer need this service</option>
                  <option value="app-issues">Technical issues / App not working well</option>
                  <option value="another-account">I created another account</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="confirm-deletion"
                  checked={confirm}
                  onChange={(e) => setConfirm(e.target.checked)}
                />
                <label htmlFor="confirm-deletion">
                  I understand that this action is irreversible and all my account data will be permanently lost.
                </label>
              </div>

              <button
                type="submit"
                className="btn-submit-delete"
                disabled={loading}
              >
                {loading ? (
                  "Submitting Request..."
                ) : (
                  <>
                    <FaTrashAlt /> Delete Account Request
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="public-footer">
        <div className="footer-container">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Ardhal Madina. All rights reserved.
          </p>
          <div className="footer-links">
            <span onClick={() => navigate("/about")}>About Us</span>
            <span onClick={() => navigate("/privacy")}>Privacy Policy</span>
            <span onClick={() => navigate("/terms")}>Terms & Conditions</span>
            <span onClick={() => navigate("/delete-account")}>Delete Account</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
