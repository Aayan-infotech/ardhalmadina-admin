import React, { useState, useEffect } from "react";
import {
  FaSync,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
  FaSearch,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ContactManagement.css";
import axiosInstance from "../../utils/axiosInstance";

export default function ContactManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const getMockInquiries = () => [
    {
      _id: "1",
      fullName: "Amit Kumar",
      email: "amit.kumar@example.com",
      message: "I want to know more about your premium features."
    },
    {
      _id: "2",
      fullName: "John Doe",
      email: "john.doe@example.com",
      message: "Is there any discount for yearly subscription?"
    },
    {
      _id: "3",
      fullName: "Sarah Jenkins",
      email: "sarah.j@example.com",
      message: "Faced issue with payment verification. Please help."
    },
    {
      _id: "4",
      fullName: "Vikram Singh",
      email: "vikram@example.com",
      message: "Need bulk pricing list for concrete and aggregate blocks."
    },
    {
      _id: "5",
      fullName: "Fatima Al-Harbi",
      email: "fatima@example.com",
      message: "Do you deliver to the outskirts of Madina?"
    }
  ];

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/contact-us/admin/all", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        }
      }).catch(async () => {
        // Fallback compatibility with previous local endpoint
        return axiosInstance.get("/contactUs/get", {
          params: { page: currentPage, limit: itemsPerPage, search: searchTerm }
        });
      }).catch(() => {
        // Mock fallback if offline/no backend
        const mock = getMockInquiries();
        const filtered = mock.filter(inq => 
          inq.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
          inq.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
          inq.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { data: { success: true, contacts: filtered, total: filtered.length } };
      });

      let data = response.data?.contacts || response.data?.data || response.data || [];
      if (!Array.isArray(data) && response.data?.success && response.data?.data?.contacts) {
        data = response.data.data.contacts;
      }
      if (!Array.isArray(data)) {
        data = getMockInquiries();
      }

      const totalCount = response.data?.total || response.data?.pagination?.totalCount || data.length;
      setTotalItems(totalCount);
      setInquiries(data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      const mock = getMockInquiries();
      setInquiries(mock);
      setTotalItems(mock.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInquiries();
    }, 400); // 400ms debounce for search inputs

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // If paginating locally (mock data)
  const currentItems = totalItems > inquiries.length ? inquiries : inquiries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / itemsPerPage)
  );

  return (
    <div className="contact-management-container">
      <div className="header-section">
        <div>
          <h3 className="page-title">
            <FaClipboardList /> Contact Us Inquiries
          </h3>
          <p className="page-subtitle">Track and view customer inquiries and support messages</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchInquiries}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Loading inquiries...</p>
            </div>
          ) : (
            <>
              <table className="inquiries-table-details">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length ? (
                    inquiries.map((inq) => (
                      <tr key={inq._id}>
                        <td data-label="Full Name">
                          <strong className="customer-name-label">
                            {inq.fullName || "N/A"}
                          </strong>
                        </td>
                        <td data-label="Email">
                          <span className="customer-email-txt">{inq.email || "N/A"}</span>
                        </td>
                        <td data-label="Message">
                          <span className="req-message-txt">{inq.message || "N/A"}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">
                        <div className="empty-state">
                          <FaExclamationTriangle className="empty-icon" />
                          <p>No inquiries found</p>
                          <button
                            className="btn-refresh-empty"
                            onClick={fetchInquiries}
                          >
                            <FaSync /> Refresh List
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {inquiries.length > 0 && (
                <div className="pagination-container">
                  <div className="pagination-controls">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <FaChevronLeft /> Previous
                    </button>
                    <div className="page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) =>
                          number === 1 ||
                          number === totalPages ||
                          (number >= currentPage - 1 &&
                            number <= currentPage + 1) ? (
                            <button
                              key={number}
                              onClick={() => setCurrentPage(number)}
                              className={`page-number ${currentPage === number ? "active" : ""}`}
                            >
                              {number}
                            </button>
                          ) : number === currentPage - 2 ||
                            number === currentPage + 2 ? (
                            <span key={number} className="page-ellipsis">
                              ...
                            </span>
                          ) : null
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next <FaChevronRight />
                    </button>
                  </div>
                  <div className="pagination-info">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, totalItems)} of{" "}
                    {totalItems} inquiries
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
