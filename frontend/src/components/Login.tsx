import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.login(email, password);

      const { token, role, name } = res.data;
      if (!token || !role) throw new Error("Invalid response");

      const user = { name, email, role}; 

      // ✅ Save in context
      login({ token, user });
      toast.success("Login successful");

      if (user.role === "SUPERADMIN" || user.role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Login..." : "Login"}
        </button>

        <div className="input-text">
          <span
            onClick={() => navigate("/change-password")}
            style={{ cursor: "pointer" }}
          >
            Change Password
          </span>
        </div>
      </form>
    </div>
  );
}

