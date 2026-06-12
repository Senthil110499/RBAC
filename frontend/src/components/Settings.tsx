import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { toast } from "react-toastify";

export default function Settings() {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Change Password form states
  const [email, setEmail] = useState(user?.email || "");
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
    <div className="settings-wrapper">
      {/* 🔹 Tabs ku velila, card ku mela center la */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          Change Password
        </button>
      </div>

      <div className="settings-card">
        {/* Profile Section */}
        {activeTab === "profile" && (
          <div className="profile-section">
            <div className="profile-header"></div> {/* Blue background */}
            <div className="profile-photo">
              <img src="profile-logo.jpg" alt="Profile" />
            </div>
            <div className="profile-form">
              {/* <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Role:</strong> {user?.role}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p> */}
              
              <label>Name</label>
              <input type="text" value={user?.name || ""} readOnly />
              <label>Role</label>
              <input type="text" value={user?.role || ""} readOnly />
              <label>Email</label>
              <input type="email" value={user?.email || ""} readOnly />

              <button className="submit-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Change Password Section */}
        {activeTab === "password" && (
          <div className="reset-section">
            <div className="profile-header"></div> {/* 🔹 Blue background */}
            <div className="profile-photo">
              <img src="profile-logo.jpg" alt="Profile" />
            </div>
            <form onSubmit={handleReset}>
              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
              <label>Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

