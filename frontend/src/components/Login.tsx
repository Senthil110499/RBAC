import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import AuthLayout, { BrandMark } from "./AuthLayout";
import { loginSchema, type LoginValues } from "../validation/schemas";
import { applyServerErrors, serverMessage } from "../validation/serverErrors";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }: LoginValues) => {
    try {
      const res = await authApi.login(email, password);

      const { token, role, name } = res.data;
      if (!token || !role) throw new Error("Invalid response");

      login({ token, user: { name, email, role } });
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      if (!applyServerErrors(err, setError, ["email", "password"])) {
        toast.error(serverMessage(err, "Invalid credentials"));
      }
    }
  };

  return (
    <AuthLayout>
      <div className="login-card auth-card">
        <div className="login-emblem">
          <BrandMark large />
        </div>

        <h2>Welcome Back</h2>
        <p className="login-subtitle auth-sub">Sign in to continue to RBAC Console</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label htmlFor="email">Email Address</label>
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

          <label htmlFor="password">Password</label>
          <div className={`input-wrap auth-input ${errors.password ? "error" : ""}`}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="auth-field-error" role="alert">
              {errors.password.message}
            </p>
          )}

          <div className="form-options">
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/change-password")}
            >
              Forgot password?
            </button>
          </div>

          <button className="login-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              "Logging in..."
            ) : (
              <>
                Login <span>→</span>
              </>
            )}
          </button>
        </form>

        <div className="access-note auth-note">
          <span className="info-icon">i</span>
          <p>Your access is role-based. Contact your administrator if you need more access.</p>
        </div>
      </div>
    </AuthLayout>
  );
}
