
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { WifiOff } from "lucide-react";

export default function InternetStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const lastPage = localStorage.getItem("lastPage");
      if (lastPage) {
        navigate(lastPage, { replace: true });
        localStorage.removeItem("lastPage");
      } else {
        navigate("/dashboard", { replace: true }); // default page
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      localStorage.setItem("lastPage", location.pathname);
      navigate("/no-internet", { replace: true });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [location.pathname, navigate]);

  if (isOnline && location.pathname === "/no-internet") return null;

  // Only render UI on `/no-internet`
  if (location.pathname !== "/no-internet") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
      }}
    >
      <WifiOff size={80} color="red" />
      <h1 style={{ marginTop: "20px", fontSize: "28px", color: "#333" }}>
        No Internet Connection
      </h1>
      <p style={{ marginTop: "8px", fontSize: "16px", color: "#666" }}>
        Please check your network and try again.
      </p>
    </div>
  );
}


