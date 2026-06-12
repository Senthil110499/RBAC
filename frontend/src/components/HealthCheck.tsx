import { useEffect, useState } from "react";
import { http } from "../api/http"; // your axios instance

export default function HealthCheck() {
  const [status, setStatus] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // avoid setting state if unmounted

    const fetchHealth = async () => {
      try {
        const res = await http.get("/health");
        if (isMounted) {
          setStatus(res.data.status);
          setTime(res.data.time || null);
        }
      } catch (err) {
        // do nothing if backend is down
        if (isMounted) {
          setStatus(null);
          setTime(null);
        }
      }
    };

    fetchHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Do not render anything if backend is not reachable
  if (!status) return null;

  return (
    <div
      style={{
        padding: "0.5rem 1rem",
        backgroundColor: "#e0f7fa",
        borderRadius: 6,
        marginBottom: "1rem",
      }}
    >
      <strong>Backend Status:</strong> {status}
      {time && <span> | DB Time: {time}</span>}
    </div>
  );
}
