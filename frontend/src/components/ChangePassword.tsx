import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const handleReset = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await authApi.ChangePassword(email, oldPassword, newPassword);
    localStorage.setItem("userEmail", email);
    toast.success(res.data.message || "Password updated successfully!");
    navigate("/login");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Error updating password");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-container">
      <form onSubmit={handleReset}>
        <h2>Change Password</h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Old Password"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>

        <div className="input-text">
          <span onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
            Back to Login
          </span>
        </div>
      </form>
    </div>
  );
}

