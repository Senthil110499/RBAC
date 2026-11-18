import { useEffect } from "react";
import { Modal, Form, Input, Select, Empty, Tooltip, Row, Col } from "antd";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userApi } from "../api/userApi";
import type { IUser } from "../types";
import { userFormSchema, type UserFormValues } from "../validation/schemas";
import { applyServerErrors, serverMessage } from "../validation/serverErrors";

// UserTable

const AVATAR_COLORS = [
  { bg: "#e0f2fe", fg: "#0369a1" },
  { bg: "#fce7f3", fg: "#be185d" },
  { bg: "#ede9fe", fg: "#6d28d9" },
  { bg: "#dcfce7", fg: "#15803d" },
  { bg: "#fef3c7", fg: "#b45309" },
];

const initials = (u: IUser) => {
  const parts = (u.name || u.email || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0] || "").slice(0, 2).toUpperCase();
};

interface UserTableProps {
  users: IUser[];
  loading?: boolean;
  currentPage: number;
  usersPerPage: number;
  totalPages: number;
  userRole?: string | undefined;
  toggleStatus?: (id: number) => void;
  setEditingUser?: (u: IUser | null) => void;
  setDeleteId?: (id: number | null) => void;
  setCurrentPage: (page: number) => void;
  showActions?: boolean;
  className?: string;
  // Server-side pagination: `users` is already the current page
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export function UserTable({
  users,
  loading = false,
  currentPage,
  usersPerPage,
  totalPages,
  userRole,
  toggleStatus,
  setEditingUser,
  setDeleteId,
  setCurrentPage,
  showActions = true,
  className,
  pageSizeOptions,
  onPageSizeChange,
}: UserTableProps) {
  const indexOfFirstUser = (currentPage - 1) * usersPerPage;
  const currentUsers = pageSizeOptions ? users : users.slice(indexOfFirstUser, indexOfFirstUser + usersPerPage);
  const pages = Math.max(1, totalPages);

  const role = (userRole || "").toUpperCase();
  const canManage = showActions && ["SUPERADMIN", "ADMIN"].includes(role);
  const canDelete = role === "SUPERADMIN";
  const colspan = 4 + (canManage ? 2 : 0);

  return (
    <div className={className}>
      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              <th className="um-col-index">S.No</th>
              <th className="um-col-user">
                <span className="um-user-head">User</span>
              </th>
              <th>Role</th>
              <th>Status</th>
              {canManage && <th>Access</th>}
              {canManage && <th className="um-col-actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colspan} className="um-empty">Loading...</td>
              </tr>
            ) : currentUsers.length === 0 ? (
              <tr>
                <td colSpan={colspan} className="um-empty">
                  <Empty description="No users found" />
                </td>
              </tr>
            ) : (
              currentUsers.map((u, idx) => {
                const isActive = (u.status || "").toLowerCase() === "active";
                const avatar = AVATAR_COLORS[(indexOfFirstUser + idx) % AVATAR_COLORS.length];
                return (
                  <tr key={u.id}>
                    <td className="um-col-index">{indexOfFirstUser + idx + 1}</td>
                    <td className="um-col-user">
                      <div className="um-user">
                        <span className="um-avatar" style={{ background: avatar.bg, color: avatar.fg }}>
                          {initials(u)}
                        </span>
                        <div>
                          <div className="um-user-name">{u.name || "-"}</div>
                          <div className="um-user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`um-pill role-${String(u.role).toLowerCase()}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`um-status ${isActive ? "active" : "inactive"}`}>
                        <span className="um-status-dot" />
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {canManage && (
                      <td>
                        <Tooltip title={isActive ? "Click to deactivate user" : "Click to activate user"}>
                          <label className="um-switch">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => toggleStatus && toggleStatus(u.id!)}
                            />
                            <span className="um-switch-track" />
                          </label>
                        </Tooltip>
                      </td>
                    )}
                    {canManage && (
                      <td className="um-col-actions">
                        <div className="um-actions">
                          <Tooltip title="Edit">
                            <button
                              className="um-icon-btn"
                              onClick={() => setEditingUser && setEditingUser(u)}
                              aria-label={`Edit ${u.name || u.email}`}
                            >
                              <Pencil size={16} />
                            </button>
                          </Tooltip>
                          {canDelete && (
                            <Tooltip title="Delete">
                              <button
                                className="um-icon-btn danger"
                                onClick={() => setDeleteId && setDeleteId(u.id!)}
                                aria-label={`Delete ${u.name || u.email}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="um-footer">
        <div className="um-footer-left">
          <span>Page {currentPage} of {pages}</span>
          {pageSizeOptions && onPageSizeChange && (
            <label className="um-page-size">
              Rows per page
              <select value={usersPerPage} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="um-pager">
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
            Previous
          </button>
          <button disabled={currentPage >= pages} onClick={() => setCurrentPage(Math.min(pages, currentPage + 1))}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// UserModal

// Shared modal form label: "Label *" (asterisk after the text, like the design)
const appRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <>
    {label}
    {required && <span className="app-modal-req">*</span>}
  </>
);

interface UserModalProps {
  mode: "add" | "edit";
  user?: IUser;
  close: () => void;
  onSuccess: (user?: IUser) => void;
}

export function UserModal({ mode, user, close, onSuccess }: UserModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", role: "USER" },
  });

  useEffect(() => {
    if (mode === "edit" && user) {
      reset({
        name: user.name || "",
        email: user.email,
        role: user.role === "ADMIN" ? "ADMIN" : "USER",
      });
    } else {
      reset({ name: "", email: "", role: "USER" });
    }
  }, [mode, user, reset]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (mode === "add") {
        const res = await userApi.create(values);
        toast.success("User created successfully!");
        onSuccess(res.data);
      } else if (mode === "edit" && user) {
        await userApi.update(user.id!, values);
        toast.success("User updated successfully!");
        onSuccess({ ...user, ...values });
      }
      close();
    } catch (err) {
      if (!applyServerErrors(err, setError, ["name", "email", "role"])) {
        toast.error(serverMessage(err, "Something went wrong"));
      }
    }
  };

  // antd Form.Item is used for layout/label only; values & rules live in React Hook Form
  const fieldStatus = (name: keyof UserFormValues) => ({
    validateStatus: errors[name] ? ("error" as const) : undefined,
    help: errors[name]?.message,
  });

  return (
    <>
      {isSubmitting && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}
      <Modal
        className="app-modal"
        title={mode === "add" ? "Add User" : "Edit User"}
        open={true}
        onCancel={close}
        onOk={handleSubmit(onSubmit)}
        confirmLoading={isSubmitting}
        okText={mode === "add" ? "Create" : "Save"}
        cancelText="Cancel"
        width={720}
        centered
        destroyOnHidden
      >
        <Form layout="vertical" requiredMark={appRequiredMark} onFinish={() => handleSubmit(onSubmit)()}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Name" htmlFor="user-name" required {...fieldStatus("name")}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input id="user-name" placeholder="Enter full name" {...field} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Email" htmlFor="user-email" required {...fieldStatus("email")}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Input id="user-email" placeholder="Enter email" {...field} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Role" htmlFor="user-role" required {...fieldStatus("role")}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="user-role"
                      placeholder="Select role"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    >
                      <Select.Option value="ADMIN">Admin</Select.Option>
                      <Select.Option value="USER">User</Select.Option>
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
