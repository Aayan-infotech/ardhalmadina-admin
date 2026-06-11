import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaCog,
  FaQuestionCircle,
  FaFileAlt,
  FaTimes,
  FaChevronDown,
  FaUtensils,
  FaConciergeBell,
  FaBuilding,
  FaHamburger,
  FaLeaf,
  FaDrumstickBite,
  FaSeedling,
  FaTags,
  FaStore,
  FaFolder,
  FaTrash,
  FaUserShield,
  FaCreditCard,
  FaFolderOpen,
  FaTruck,
  FaTools,
  FaGlobe,
  FaQuestion,
  FaBoxes,
  FaThLarge,
  FaShoppingCart,
  FaClipboardList,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen ,
  FaMoneyBillWave,
  FaAd,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "./images/logo.png";

export default function Sidebar({ collapsed, onClose }) {
  const navigate = useNavigate();
  const [restaurantTypeOpen, setRestaurantTypeOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [foodOpen, setFoodOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [staticOpen, setStaticOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    onClose && onClose();
  };

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className="crm-sidebar">
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="logo">
          {collapsed ? (
            <h2
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                color: "rgb(255 254 251)",
                textAlign: "center",
              }}
            >
              A M
            </h2>
          ) : (
            <h2
              style={{
                fontWeight: "bold",
                fontSize: "20px",
                color: "rgb(255 254 251)",
              }}
            >
              ARDH AL MADINA
            </h2>
          )}
        </div>
        <button className="sidebar-close" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <nav>
        <NavLink to="/dashboard" className="menu-item" onClick={handleNavClick}>
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
        {/* USER MANAGEMENT DROPDOWN */}
        <div
          className={`menu-item dropdown ${userOpen ? "open" : ""}`}
          onClick={() => !collapsed && setUserOpen(!userOpen)}
        >
          <FaUserShield />
          {!collapsed && (
            <>
              <span>User Management</span>
              <FaChevronDown className="dropdown-icon" />
            </>
          )}
        </div>

        {userOpen && !collapsed && (
          <div className="submenu">
            <NavLink
              to="/users/list"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaUsers className="submenu-icon" />
              User List
            </NavLink>
          </div>
        )}

        {/* CONFIGURATION DROPDOWN */}
        <div
          className={`menu-item dropdown ${configOpen ? "open" : ""}`}
          onClick={() => !collapsed && setConfigOpen(!configOpen)}
        >
          <FaCog />
          {!collapsed && (
            <>
              <span>Configuration</span>
              <FaChevronDown className="dropdown-icon" />
            </>
          )}
        </div>

        {configOpen && !collapsed && (
          <div className="submenu">
            <NavLink
              to="/configuration/category"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaThLarge className="submenu-icon" />
              Category
            </NavLink>

            <NavLink
              to="/configuration/subcategory-management"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaThLarge className="submenu-icon" />
              Subcategory
            </NavLink>

            <NavLink
              to="/configuration/material-category"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaBoxes className="submenu-icon" />
              Material Category
            </NavLink>

            <NavLink
              to="/Configuration/add-material"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaTags className="submenu-icon" />
              Add Material
            </NavLink>
            <NavLink
              to="/Configuration/Vechicles"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaTruck className="submenu-icon" />
              Product List
            </NavLink>
            <NavLink
              to="/product-booking"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaBoxOpen className="submenu-icon" />
              Product Booking
            </NavLink>
          </div>
        )}

        {/* REQUIREMENTS */}
        <NavLink
          to="/requirements"
          className="menu-item"
          onClick={handleNavClick}
        >
          <FaTools />
          {!collapsed && <span>Requirements</span>}
        </NavLink>
         {/* REQUIREMENTS */}
        <NavLink
          to="/advertisement"
          className="menu-item"
          onClick={handleNavClick}
        >
          <FaAd />
          {!collapsed && <span>Advertisements</span>}
        </NavLink>
        {/* STATIC CONTENT */}
        <div
          className={`menu-item dropdown ${staticOpen ? "open" : ""}`}
          onClick={() => !collapsed && setStaticOpen(!staticOpen)}
        >
          <FaGlobe />
          {!collapsed && (
            <>
              <span>Web Content</span>
              <FaChevronDown className="dropdown-icon" />
            </>
          )}
        </div>
        {staticOpen && !collapsed && (
          <div className="submenu">
            <NavLink
              to="/static-content"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaFolder className="submenu-icon" />
              Static Content
            </NavLink>
            <NavLink
              to="/faq"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaQuestion className="submenu-icon" />
              Faq
            </NavLink>
          </div>
        )}
        {/* ORDER MANAGEMENT DROPDOWN */}
        <div
          className={`menu-item dropdown ${orderOpen ? "open" : ""}`}
          onClick={() => !collapsed && setOrderOpen(!orderOpen)}
        >
          <FaShoppingCart />
          {!collapsed && (
            <>
              <span>Order Management</span>
              <FaChevronDown className="dropdown-icon" />
            </>
          )}
        </div>

        {orderOpen && !collapsed && (
          <div className="submenu">
            <NavLink
              to="/order-management"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaClipboardList className="submenu-icon" />
              Orders Management
            </NavLink>

            {/* <NavLink
              to="/listing-orders"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaHourglassHalf className="submenu-icon" />
              Listing Orders
            </NavLink> */}
          </div>
        )}
        {/* REQUEST MANAGEMENT DROPDOWN */}
        <div
          className={`menu-item dropdown ${requestOpen ? "open" : ""}`}
          onClick={() => !collapsed && setRequestOpen(!requestOpen)}
        >
          <FaTools />
          {!collapsed && (
            <>
              <span>Request Management</span>
              <FaChevronDown className="dropdown-icon" />
            </>
          )}
        </div>

        {requestOpen && !collapsed && (
          <div className="submenu">
            <NavLink
              to="/request-management"
              className="submenu-item"
              onClick={handleNavClick}
            >
              <FaClipboardList className="submenu-icon" />
              Request Management
            </NavLink>
          </div>
        )}
      </nav>

      {/* BOTTOM */}
      <div className="sidebar-bottom">
        <div className="menu-item">
          <FaCog />
          {!collapsed && <span>Settings</span>}
        </div>

        {!collapsed && (
          <button className="impressum-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
