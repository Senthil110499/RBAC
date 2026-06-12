import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <AlertTriangle size={80} color="#f39c12" style={{ marginBottom: "20px" }} />
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>404 - Page Not Found</h1>
      <Link
        to="/dashboard"
        style={{
          marginTop: "10px",
          textDecoration: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          backgroundColor: "#3498db",
          color: "#fff",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
