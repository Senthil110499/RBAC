import { Link, useLocation } from "react-router-dom";
import { Home, Users, Settings, Menu } from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { pathname } = useLocation();

  const item = (to: string, label: string, Icon: React.ElementType) => (
    <Link
      to={to}
      className={`sidebar-item ${pathname === to ? "active" : ""}`}
    >
      <Icon className="icon" size={20} />
      {sidebarOpen && <span>{label}</span>}
    </Link>
  );

  return (

    <div className={`sidebar ${sidebarOpen ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        {sidebarOpen && (
          <>
            <img src="/R_logo.jpg" alt="Logo" className="sidebar-logo" />
            <span className="sidebar-title">RBAC</span>
          </>
        )}
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Menu Items  */}

      {item("/dashboard", "Dashboard", Home)}
      {item("/users", "Users", Users)}
      {item("/settings", "Settings", Settings)}
    </div>
  );
}
