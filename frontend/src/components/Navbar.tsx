import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const goToProfile = () => {
    setOpen(false);
    navigate("/settings?tab=profile");
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
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <span className="navbar-brand">RBAC</span>
      </div>

      {user && (
        <div className="profile-container" ref={dropdownRef}>
          <button className="profile-trigger" onClick={() => setOpen(!open)}>
            <span className="profile-logo">
              <img src="/users-icon.jpg" alt="Profile" />
            </span>
            <ChevronDown size={20} className={`profile-chevron ${open ? "open" : ""}`} />
          </button>

          {open && (
            <div className="dropdown">
              <div className="dropdown-head">
                <strong>{user.name || user.email}</strong>
                <span>{user.email}</span>
                <span className="dropdown-role">{user.role}</span>
              </div>
              <button className="dropdown-action" onClick={goToProfile}>
                <UserRound size={16} /> Profile
              </button>
              <button className="dropdown-logout" onClick={logout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
