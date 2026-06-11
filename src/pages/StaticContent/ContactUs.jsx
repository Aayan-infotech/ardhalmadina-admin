import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaGlobe, FaUser, FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import "./ContactUs.css";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      // API call to submit contact inquiry
      await axiosInstance.post("/contact-us/send", formData);
      toast.success("Message sent successfully!");
      setFormData({ fullName: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-static-layout">
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
            <button className="nav-item active" onClick={() => navigate("/contact")}>
              Contact Us
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="public-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-icon-wrapper"><FaEnvelope /></div>
          <h1 className="hero-title">Contact Us</h1>
          <p className="hero-subtitle">We would love to hear from you. Get in touch with us.</p>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main className="public-content-container">
        <div className="public-paper contact-form-card">
          <form onSubmit={handleSubmit} className="contact-form-element">
            <div className="contact-input-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="contact-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="contact-input-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-contact-submit" disabled={loading}>
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <FaPaperPlane /> Send Message
                </>
              )}
            </button>
          </form>
        </div>
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
            <span onClick={() => navigate("/contact")}>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
