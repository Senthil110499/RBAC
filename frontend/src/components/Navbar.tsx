import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function Navbar() {
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // function to map pathname → title
  const getPageTitle = () => {
    if (pathname.includes("dashboard")) return "Dashboard";
    if (pathname.includes("users")) return "Users";
    if (pathname.includes("settings")) return "Settings";
    return "Role Based Authentication"; // default
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <span>{getPageTitle()}</span>
      </div>
      {user && (
        <div className="profile-container" ref={dropdownRef}>
          <div className="profile-logo" onClick={() => setOpen(!open)}>
            <img src="/users-icon.jpg" alt="Profile" />
          </div>

          {open && (
            <div className="dropdown">
              <p className="dropdown-item">
                <strong>{user.name || user.email}</strong>
              </p>
              <p className="dropdown-item">Role: {user.role}</p>
              <button className="dropdown-item logout" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
