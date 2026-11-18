import { Link, useLocation } from "react-router-dom";
import { Home, Users, Settings } from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
}

export default function Sidebar({ sidebarOpen }: SidebarProps) {
  const { pathname } = useLocation();

  const item = (to: string, label: string, Icon: React.ElementType) => (
    <Link
      to={to}
      className={`sidebar-item ${pathname === to ? "active" : ""}`}
      title={sidebarOpen ? undefined : label}
    >
      <Icon className="icon" size={20} />
      {sidebarOpen && <span>{label}</span>}
    </Link>
  );

  return (
    <div className={`sidebar ${sidebarOpen ? "expanded" : "collapsed"}`}>
      {/* Menu Items  */}

      {item("/dashboard", "Dashboard", Home)}
      {item("/users", "Users", Users)}
      {item("/settings", "Settings", Settings)}
    </div>
  );
}
