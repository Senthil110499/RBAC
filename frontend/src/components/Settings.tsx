import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User as UserIcon, Pencil, Lock, Shield, CheckCircle2, XCircle, LogOut, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { authApi } from "../api/authApi";
import { userApi } from "../api/userApi";
import type { IUser } from "../types";
import {
  profileNameSchema,
  passwordChangeFields,
  PASSWORD_RULES_HINT,
  type ProfileNameValues,
  type PasswordChangeValues,
} from "../validation/schemas";
import { applyServerErrors, serverMessage } from "../validation/serverErrors";

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function Settings() {
  const { logout, user, token, login } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "password" ? "password" : "profile";

  // Fresh profile (status etc.) from the server
  const [profile, setProfile] = useState<IUser | null>(null);

  // Edit profile (React Hook Form + Zod)
  const [editing, setEditing] = useState(false);
  const nameForm = useForm<ProfileNameValues>({
    resolver: zodResolver(profileNameSchema),
    mode: "onTouched",
    defaultValues: { name: "" },
  });

  // Change password (React Hook Form + Zod)
  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeFields),
    mode: "onTouched",
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });
  const pwErrors = passwordForm.formState.errors;

  // Show / hide each password field independently
  const [visible, setVisible] = useState({ oldPassword: false, newPassword: false, confirmPassword: false });
  const toggleVisible = (field: keyof typeof visible) => setVisible((v) => ({ ...v, [field]: !v[field] }));
  const eyeButton = (field: keyof typeof visible, label: string) => (
    <button
      type="button"
      className="st-eye"
      onClick={() => toggleVisible(field)}
      aria-label={visible[field] ? `Hide ${label}` : `Show ${label}`}
      title={visible[field] ? "Hide" : "Show"}
    >
      {visible[field] ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
    </button>
  );

  const passwordCardRef = useRef<HTMLDivElement>(null);

  // Reuse the existing users list API and pick out the logged-in user's record
  useEffect(() => {
    if (!user?.email) return;
    userApi
      .getAll()
      .then((res) => {
        const me = res.data.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
        if (me) setProfile(me);
      })
      .catch(console.error);
  }, [user?.email]);

  // ?tab=password → jump to the Change Password card
  useEffect(() => {
    if (tab === "password") {
      passwordCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      passwordForm.setFocus("oldPassword");
    }
  }, [tab, searchParams, passwordForm]);

  const displayName = profile?.name || user?.name || user?.email || "";
  const email = profile?.email || user?.email || "";
  const role = profile?.role || user?.role || "";
  const isActive = profile ? String(profile.status).toLowerCase() === "active" : true;
  // PUT /users/:id needs the "update" permission (SUPERADMIN & ADMIN only)
  const canEdit = (role === "SUPERADMIN" || role === "ADMIN") && profile?.id != null;

  const startEditing = () => {
    nameForm.reset({ name: displayName });
    setEditing(true);
  };

  const saveName = async ({ name }: ProfileNameValues) => {
    if (!profile?.id) return;
    try {
      const res = await userApi.update(profile.id, { name });
      setProfile({ ...profile, ...res.data });
      // keep navbar / welcome text in sync
      if (user && token) login({ token, user: { ...user, name: res.data.name } });
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      if (!applyServerErrors(err, nameForm.setError, ["name"])) {
        toast.error(serverMessage(err, "Failed to update profile"));
      }
    }
  };

  const changePassword = async ({ oldPassword, newPassword }: PasswordChangeValues) => {
    try {
      const res = await authApi.ChangePassword(email, oldPassword, newPassword);
      localStorage.setItem("userEmail", email);
      toast.success(res.data.message || "Password updated successfully!");
      logout(); // sign in again with the new password
    } catch (err) {
      if (!applyServerErrors(err, passwordForm.setError, ["oldPassword", "newPassword"])) {
        toast.error(serverMessage(err, "Error updating password"));
      }
    }
  };

  const savingName = nameForm.formState.isSubmitting;
  const savingPassword = passwordForm.formState.isSubmitting;

  return (
    <div className="st">
      <div className="st-head">
        <h1>My account</h1>
      </div>

      <div className="st-grid">
        {/* Left column */}
        <aside className="st-side">
          <div className="st-hero">
            <span className="st-avatar">{(displayName || "?").charAt(0).toUpperCase()}</span>
            <h2>{displayName}</h2>
            <p className="st-hero-role">{role}</p>
            <p className="st-hero-email">{email}</p>

            <span className="st-badge role">
              <Shield size={15} /> {role ? titleCase(role) : "-"}
            </span>
            <span className={`st-badge ${isActive ? "active" : "inactive"}`}>
              {isActive ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="st-card st-meta">
            <div className="st-meta-row">
              <span>Role</span>
              <strong>{role}</strong>
            </div>
            <div className="st-meta-row">
              <span>Status</span>
              <strong className={isActive ? "st-green" : "st-red"}>{isActive ? "Active" : "Inactive"}</strong>
            </div>
            <button className="st-logout" onClick={logout}>
              <LogOut size={17} /> Logout
            </button>
          </div>
        </aside>

        {/* Right column */}
        <section className="st-main">
          {/* Profile details */}
          <div className="st-card">
            <div className="st-card-head">
              <h3><UserIcon size={18} /> Profile Details</h3>
              {!canEdit ? null : !editing ? (
                <button className="st-btn-outline" onClick={startEditing}>
                  <Pencil size={14} /> Edit profile
                </button>
              ) : (
                <div className="st-edit-actions">
                  <button className="st-btn-ghost" onClick={() => setEditing(false)} disabled={savingName}>
                    Cancel
                  </button>
                  <button className="st-btn-solid" onClick={nameForm.handleSubmit(saveName)} disabled={savingName}>
                    {savingName ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            <div className="st-fields">
              <div className="st-field">
                <label htmlFor="st-name">Name</label>
                {editing ? (
                  <>
                    <input
                      id="st-name"
                      className={`st-input ${nameForm.formState.errors.name ? "error" : ""}`}
                      aria-invalid={!!nameForm.formState.errors.name}
                      onKeyDown={(e) => e.key === "Enter" && nameForm.handleSubmit(saveName)()}
                      autoFocus
                      {...nameForm.register("name")}
                    />
                    {nameForm.formState.errors.name && (
                      <p className="st-error" role="alert">{nameForm.formState.errors.name.message}</p>
                    )}
                  </>
                ) : (
                  <span>{displayName || "-"}</span>
                )}
              </div>
              <div className="st-field">
                <label>Role</label>
                <span>{role}</span>
              </div>
              <div className="st-field full">
                <label>Email</label>
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="st-card" ref={passwordCardRef}>
            <div className="st-card-head plain">
              <h3><Lock size={18} /> Change Password</h3>
            </div>

            <form className="st-password" onSubmit={passwordForm.handleSubmit(changePassword)} noValidate>
              <div className="st-password-fields">
                <div className="st-field">
                  <label htmlFor="st-old">Current password</label>
                  <div className="st-input-wrap">
                    <input
                      id="st-old"
                      className={`st-input ${pwErrors.oldPassword ? "error" : ""}`}
                      type={visible.oldPassword ? "text" : "password"}
                      autoComplete="current-password"
                      aria-invalid={!!pwErrors.oldPassword}
                      {...passwordForm.register("oldPassword")}
                    />
                    {eyeButton("oldPassword", "current password")}
                  </div>
                  {pwErrors.oldPassword && <p className="st-error" role="alert">{pwErrors.oldPassword.message}</p>}
                </div>
                <div className="st-field">
                  <label htmlFor="st-new">New password</label>
                  <div className="st-input-wrap">
                    <input
                      id="st-new"
                      className={`st-input ${pwErrors.newPassword ? "error" : ""}`}
                      type={visible.newPassword ? "text" : "password"}
                      autoComplete="new-password"
                      aria-invalid={!!pwErrors.newPassword}
                      {...passwordForm.register("newPassword")}
                    />
                    {eyeButton("newPassword", "new password")}
                  </div>
                  {pwErrors.newPassword && <p className="st-error" role="alert">{pwErrors.newPassword.message}</p>}
                </div>
                <div className="st-field">
                  <label htmlFor="st-confirm">Confirm password</label>
                  <div className="st-input-wrap">
                    <input
                      id="st-confirm"
                      className={`st-input ${pwErrors.confirmPassword ? "error" : ""}`}
                      type={visible.confirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      aria-invalid={!!pwErrors.confirmPassword}
                      {...passwordForm.register("confirmPassword")}
                    />
                    {eyeButton("confirmPassword", "confirm password")}
                  </div>
                  {pwErrors.confirmPassword && (
                    <p className="st-error" role="alert">{pwErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="st-password-foot">
                <span className="st-rules">{PASSWORD_RULES_HINT}</span>
                <button type="submit" className="st-btn-outline lg" disabled={savingPassword}>
                  <ShieldCheck size={16} /> {savingPassword ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
