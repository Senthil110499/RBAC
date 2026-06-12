import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Settings from "./components/Settings";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { ToastContainer } from "react-toastify";
import ChangePassword from "./components/ChangePassword";
import Footer from "./components/Footer";
import InternetStatus from "./components/InternetStatus";
import Maintenance from "./components/Maintenance";
import NotFound from "./components/NotFound";

const Spinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      backgroundColor: "#f9f9f9",
    }}
  >
    <div className="loader"></div>
    <p>Loading...</p>
    <style>{`
      .loader {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #3498db;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
    `}</style>
  </div>
);

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className={`layout ${
        sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
      }`}
    >
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Skip spinner for login & change-password
  if (
    loading &&
    location.pathname !== "/login" &&
    location.pathname !== "/change-password"
  ) {
    return <Spinner />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/maintenance" element={<Maintenance />} />
          
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} /> 
        </Routes>
        <InternetStatus />
      </BrowserRouter>
      <ToastContainer position="bottom-left" />
    </AuthProvider>
  );
}
