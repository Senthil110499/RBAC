import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Empty, Tooltip } from "antd";
import { toast } from "react-toastify";
import { Edit, Trash } from "lucide-react";
import { userApi } from "../api/userApi";
import type { IUser } from "../types";

// UserTable

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
}: UserTableProps) {
  const indexOfFirstUser = (currentPage - 1) * usersPerPage;
  const currentUsers = users.slice(
    indexOfFirstUser,
    indexOfFirstUser + usersPerPage
  );
  const actionColumnVisible =
    showActions &&
    ["SUPERADMIN", "ADMIN"].includes((userRole || "").toUpperCase());

  const colspan = 5 + (actionColumnVisible ? 1 : 0);

  return (
    <div>
      <table
        className={`users-table ${className || ""} ${
          (userRole || "").toUpperCase() === "USER" ? "dashboard-table" : ""}`}>
        <thead>
          <tr>
            <th className="users-cell">S.No</th>
            <th className="users-cell">Name</th>
            <th className="users-cell">Email</th>
            <th className="users-cell">Role</th>
            <th className="users-cell">Status</th>
            {actionColumnVisible && <th className="users-cell">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={colspan}
                style={{ textAlign: "center", padding: 28 }}
              >
                <div>Loading...</div>
              </td>
            </tr>
          ) : currentUsers.length === 0 ? (
            <tr>
              <td colSpan={colspan} style={{ padding: 28 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Empty style={{ fontSize: 10, color: "#999" }} />
                </div>
              </td>
            </tr>
          ) : (
            currentUsers.map((u, idx) => {
              const isActive = (u.status || "").toLowerCase() === "active";
              return (
                <tr key={u.id}>
                  <td className="users-cell">{indexOfFirstUser + idx + 1}</td>
                  <td className="users-cell">{u.name || "-"}</td>
                  <td className="users-cell">{u.email}</td>
                  <td className="users-cell">{u.role}</td>
                  <td className="users-cell">
                    <span
                      className={`status-badge ${
                        isActive ? "active" : "Inactive"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {actionColumnVisible && (
                    <td className="users-cell action-buttons">
                      <div
                        className="action-icons"
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <Tooltip
                          title={
                            isActive
                              ? "Click to deactivate user"
                              : "Click to activate user"
                          }
                        >
                          <label className="switch" style={{ margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() =>
                                toggleStatus && toggleStatus(u.id!)
                              }
                            />
                            <span className="slider round" />
                          </label>
                        </Tooltip>

                        <Tooltip title="Edit">
                          <span
                            className="icon-btn edit-icon"
                            onClick={() => setEditingUser && setEditingUser(u)}
                            style={{ cursor: "pointer" }}
                          >
                            <Edit size={18} color="blue" />
                          </span>
                        </Tooltip>

                        {(userRole || "").toUpperCase() === "SUPERADMIN" && (
                          <Tooltip title="Delete">
                            <span
                              className="icon-btn delete-icon"
                              onClick={() => setDeleteId && setDeleteId(u.id!)}
                              style={{ cursor: "pointer" }}
                            >
                              <Trash size={18} color="red" />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}

          {/* filler rows */}
          {!loading &&
            currentUsers.length > 0 &&
            currentUsers.length < usersPerPage &&
            Array.from({ length: usersPerPage - currentUsers.length }).map(
              (_, i) => (
                <tr key={`empty-${i}`} className="empty-row">
                  <td colSpan={colspan}>&nbsp;</td>
                </tr>
              )
            )}
        </tbody>
      </table>

      {users.length > usersPerPage && (
        <div className="users-controls" style={{ marginTop: 12 }}>
          <div
            className="pagination"
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// UserModal

interface UserModalProps {
  mode: "add" | "edit";
  user?: IUser;
  close: () => void;
  onSuccess: (user?: IUser) => void;
}

export function UserModal({ mode, user, close, onSuccess }: UserModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      form.resetFields();
    }
  }, [mode, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

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
    } catch (err: any) {
      if (!err?.errorFields) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}
      <Modal
        title={mode === "add" ? "Add User" : "Edit User"}
        open={true}
        onCancel={close}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText={mode === "add" ? "Create" : "Save"}
        cancelText="Cancel"
        destroyOnHidden
        closable={false}
      >
        <Form form={form} layout="vertical" initialValues={{ role: "USER" }}>
          <Form.Item
            label="Name"
            name="name"
            style={{ marginBottom: "8px" }}
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="Name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            style={{ marginBottom: "8px" }}
            rules={[
              { required: true, message: "Please enter an email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            style={{ marginBottom: "16px" }}
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select role">
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="USER">User</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
