import { useEffect } from "react";
import { ServerCrash } from "lucide-react";

export default function Maintenance() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // 🔥 Backend health check API
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`);
        if (res.ok) {
          // ✅ Backend ok → redirect to dashboard (or home)
          window.location.href = "/dashboard";
        }
      } catch (err) {
        // backend still down → ignore
      }
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);

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
      <ServerCrash size={80} color="#e74c3c" style={{ marginBottom: "20px" }} />
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>
        503 - Service Unavailable
      </h1>
      <p style={{ fontSize: "1.2rem", color: "#555" }}>
        Server temporary down. Retrying...
      </p>
    </div>
  );
}
