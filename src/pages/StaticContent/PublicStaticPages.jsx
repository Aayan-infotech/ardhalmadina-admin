import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaShieldAlt, FaGavel, FaHome, FaLock, FaGlobe } from "react-icons/fa";
import DOMPurify from "dompurify";
import axiosInstance from "../../utils/axiosInstance";
import "./PublicStaticPages.css";

export default function PublicStaticPage({ pageType }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const PAGE_CONFIGS = {
    about: {
      title: "About Us",
      apiKey: "aboutUs",
      icon: <FaHome />,
      subtitle: "Learn more about Ardhal Madina and our mission.",
    },
    privacy: {
      title: "Privacy Policy",
      apiKey: "privacyPolicy",
      icon: <FaShieldAlt />,
      subtitle: "Understand how we collect, use, and protect your information.",
    },
    terms: {
      title: "Terms & Conditions",
      apiKey: "termsAndConditions",
      icon: <FaGavel />,
      subtitle: "Read the rules and guidelines for using our services.",
    },
  };

  const currentConfig = PAGE_CONFIGS[pageType] || PAGE_CONFIGS.about;

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/staticContent/get/${currentConfig.apiKey}`
      );
      const htmlContent = response.data?.data?.content || "";
      setContent(htmlContent || "<p>No content available at the moment.</p>");
    } catch (error) {
      console.error("LOAD ERROR:", error);
      setContent("<p>Failed to load content. Please try again later.</p>");
    } finally {
      setLoading(false);
    }
  }, [currentConfig.apiKey]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

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
            <button
              className={`nav-item ${pageType === "about" ? "active" : ""}`}
              onClick={() => navigate("/about")}
            >
              About Us
            </button>
            <button
              className={`nav-item ${pageType === "privacy" ? "active" : ""}`}
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </button>
            <button
              className={`nav-item ${pageType === "terms" ? "active" : ""}`}
              onClick={() => navigate("/terms")}
            >
              Terms & Conditions
            </button>
            <button
              className="nav-item"
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </button>
          </div>

        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="public-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-icon-wrapper">{currentConfig.icon}</div>
          <h1 className="hero-title">{currentConfig.title}</h1>
          <p className="hero-subtitle">{currentConfig.subtitle}</p>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main className="public-content-container">
        {loading ? (
          <div className="public-loading">
            <div className="spinner"></div>
            <p>Fetching latest document...</p>
          </div>
        ) : (
          <div className="public-paper">
            <div
              className="public-prose"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(content),
              }}
            />
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
            <span onClick={() => navigate("/contact")}>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
