import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../api/authApi";
import { toast } from "react-toastify";
import AuthLayout from "./AuthLayout";
import { changePasswordSchema, type ChangePasswordValues } from "../validation/schemas";
import { applyServerErrors, serverMessage } from "../validation/serverErrors";

export default function ResetPassword() {
  const [showPasswords, setShowPasswords] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async ({ email, oldPassword, newPassword }: ChangePasswordValues) => {
    try {
      const res = await authApi.ChangePassword(email, oldPassword, newPassword);
      localStorage.setItem("userEmail", email);
      toast.success(res.data.message || "Password updated successfully!");
      navigate("/login");
    } catch (err) {
      if (!applyServerErrors(err, setError, ["email", "oldPassword", "newPassword"])) {
        toast.error(serverMessage(err, "Error updating password"));
      }
    }
  };

  const passwordType = showPasswords ? "text" : "password";
  const eyeButton = (
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPasswords(!showPasswords)}
      aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
    >
      {showPasswords ? "Hide" : "Show"}
    </button>
  );

  return (
    <AuthLayout>
      <form className="login-card auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2>Change password</h2>
        <p className="login-subtitle auth-sub">Enter your current password and choose a new one.</p>

        <label htmlFor="email">Email</label>
        <div className={`input-wrap auth-input ${errors.email ? "error" : ""}`}>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="auth-field-error" role="alert">
            {errors.email.message}
          </p>
        )}

        <label htmlFor="oldPassword">Current password</label>
        <div className={`input-wrap auth-input ${errors.oldPassword ? "error" : ""}`}>
          <input
            id="oldPassword"
            type={passwordType}
            placeholder="Enter your current password"
            autoComplete="current-password"
            aria-invalid={!!errors.oldPassword}
            {...register("oldPassword")}
          />
          {eyeButton}
        </div>
        {errors.oldPassword && (
          <p className="auth-field-error" role="alert">
            {errors.oldPassword.message}
          </p>
        )}

        <label htmlFor="newPassword">New password</label>
        <div className={`input-wrap auth-input ${errors.newPassword ? "error" : ""}`}>
          <input
            id="newPassword"
            type={passwordType}
            placeholder="Enter a new password"
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
        </div>
        {errors.newPassword && (
          <p className="auth-field-error" role="alert">
            {errors.newPassword.message}
          </p>
        )}

        <label htmlFor="confirmPassword">Confirm new password</label>
        <div className={`input-wrap auth-input ${errors.confirmPassword ? "error" : ""}`}>
          <input
            id="confirmPassword"
            type={passwordType}
            placeholder="Re-enter the new password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="auth-field-error" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}

        <button type="submit" className="login-button auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update password"}
        </button>

        <button type="button" className="auth-back" onClick={() => navigate("/login")}>
          ← Back to login
        </button>

        <div className="access-note auth-note">
          <span className="info-icon">i</span>
          <p>After updating, sign in again with your new password.</p>
        </div>
      </form>
    </AuthLayout>
  );
}
