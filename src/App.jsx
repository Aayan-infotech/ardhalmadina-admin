import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import UserList from "./pages/UserManagement/UserList/UserList";
import AddMaterial from "./pages/Configuration/AddMaterial/AddMaterial.jsx";
import Category from "./pages/Configuration/Category/ListingCategory.jsx";
import SubcategoryManagement from "./pages/Configuration/Subcategory/SubcategoryManagement.jsx";
import MaterialCategory from "./pages/Configuration/AddMaterial/MaterialCategory.jsx";

import Vechicles from "./pages/Configuration/Vechicles/Vechicles.jsx";
import StaticContent from "./pages/StaticContent/StaticContent.jsx";
import Faq from "./pages/Faq/Faq.jsx";
import Requirements from "./pages/Requirements/Requirements.jsx";
import OrderManagement from "./pages/Orders/OrderManagement.jsx";
// import ListingOrders from "./pages/Orders/ListingOrders.jsx";
import PaymentFailedPage from "./pages/Payment/PaymentFailedPage.jsx";
import PaymentSuccessPage from "./pages/Payment/PaymentSuccessPage.jsx";
import ProductBooking from "./pages/ProductBooking/ProductBooking.jsx";
import AdvertisementManagement from "./pages/Advertisements/AdvertisementManagement.jsx";
import PublicStaticPage from "./pages/StaticContent/PublicStaticPages.jsx";
import DeleteAccount from "./pages/DeleteAccount/DeleteAccount.jsx";
import RequestManagement from "./pages/RequestManagement/RequestManagement.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/payment-failed" element={<PaymentFailedPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/about" element={<PublicStaticPage pageType="about" />} />
        <Route path="/privacy" element={<PublicStaticPage pageType="privacy" />} />
        <Route path="/terms" element={<PublicStaticPage pageType="terms" />} />
        <Route path="/delete-account" element={<DeleteAccount />} />

        {/* PROTECTED */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users/list" element={<UserList />} />
            <Route
              path="/configuration/add-material"
              element={<AddMaterial />}
            />
            <Route path="/configuration/category" element={<Category />} />
            <Route
              path="/configuration/subcategory-management"
              element={<SubcategoryManagement />}
            />
            <Route
              path="/configuration/material-category"
              element={<MaterialCategory />}
            />
            <Route path="/configuration/vechicles" element={<Vechicles />} />
            <Route path="/static-content" element={<StaticContent />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/requirements" element={<Requirements />} />
            <Route path="/order-management" element={<OrderManagement />} />
            <Route path="/request-management" element={<RequestManagement />} />
            <Route path="/advertisement" element={<AdvertisementManagement />} />
            <Route path="/product-booking" element={<ProductBooking />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
