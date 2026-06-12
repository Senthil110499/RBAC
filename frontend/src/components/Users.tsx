import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/userApi";
import type { IUser, Role, Status } from "../types";
import { Upload, Plus, Filter, Download } from "lucide-react";
import FilterModal from "../components/FilterModal";
import UploadModal from "../components/UploadModal";
import { Modal, Button, Tooltip } from "antd";
import { UserTable, UserModal } from "../components/CustomComponent";

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Filters / search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"" | Role>("");
  const [filterStatus, setFilterStatus] = useState<"" | Status>("");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      setUsers(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const res = await userApi.toggleStatus(id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: res.data.status as Status } : u
        )
      );
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await userApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteId(null);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await userApi.downloadExcel({
        role: filterRole || undefined,
        status: filterStatus || undefined,
        fromDate: filterFromDate || undefined,
        toDate: filterToDate || undefined,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_list.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply search & filters (client-side)
  const filteredUsers = users.filter((u) => {
    if (u.role === "SUPERADMIN") return false; // hide superadmin

    if (searchTerm.trim() === "") {
    return (
      (filterRole ? u.role === filterRole : true) &&
      (filterStatus ? u.status === filterStatus : true) &&
      (filterFromDate && filterToDate
        ? new Date(u.createdAt) >= new Date(filterFromDate) &&
          new Date(u.createdAt) <=
            new Date(new Date(filterToDate).setHours(23, 59, 59, 999))
        : true)
    );
  }

    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole ? u.role === filterRole : true;
    const matchesStatus = filterStatus ? u.status === filterStatus : true;

    const matchesDateRange =
      filterFromDate && filterToDate
        ? new Date(u.createdAt) >= new Date(filterFromDate) &&
          new Date(u.createdAt) <=
            new Date(new Date(filterToDate).setHours(23, 59, 59, 999))
        : true;

    return matchesSearch && matchesRole && matchesStatus && matchesDateRange;
  });

  // Pagination derived values (pass to UserTable)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, filterFromDate, filterToDate]);

  return (
    <div className="users-container">
      <div className="users-card">
        <div className="users-header">
          <div className="users-title">
            <h2>Users</h2>
            <p className="users-note">List of all users here</p>
          </div>

          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Tooltip title="Filter">
              <button
                onClick={() => setShowFilterModal(true)}
                className="btn-primary"
              >
                <Filter size={14} />
              </button>
            </Tooltip>

            {user?.role?.toUpperCase() === "SUPERADMIN" && (
              <Tooltip title="Add User">
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  <Plus size={14} />
                </button>
              </Tooltip>
            )}

            {user?.role?.toUpperCase() === "SUPERADMIN" && (
              <Tooltip title="Upload">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary"
                >
                  <Upload size={14} />
                </button>
              </Tooltip>
            )}

            {user?.role?.toUpperCase() !== "USER" && (
              <Tooltip title="Download">
                <button onClick={handleDownload} className="btn-primary">
                  <Download size={14} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <p></p>
      ) : (
        <>
          <UserTable
            users={filteredUsers}
            loading={loading}
            currentPage={currentPage}
            usersPerPage={usersPerPage}
            totalPages={totalPages}
            userRole={user?.role}
            toggleStatus={toggleStatus}
            setEditingUser={(u) => setEditingUser(u)}
            setDeleteId={(id) => setDeleteId(id)}
            setCurrentPage={(p) => setCurrentPage(p)}
            showActions={true}
          />
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserModal
          mode="edit"
          user={editingUser}
          close={() => setEditingUser(null)}
          onSuccess={(updated) =>
            setUsers((prev) =>
              prev.map((u) => (u.id === updated?.id ? updated! : u))
            )
          }
        />
      )}

      {/* Add User Modal */}
      {showModal && (
        <UserModal
          mode="add"
          close={() => setShowModal(false)}
          onSuccess={(newUser) => {
            setUsers((prev) => [...prev, newUser!]);
          }}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={({ role, status, fromDate, toDate }) => {
          setFilterRole(role);
          setFilterStatus(status);
          setFilterFromDate(fromDate);
          setFilterToDate(toDate);
        }}
        initialFilters={{
          role: filterRole,
          status: filterStatus,
          fromDate: filterFromDate,
          toDate: filterToDate,
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        footer={[
          <div
            style={{ display: "flex", justifyContent: "center", gap: "16px" }}
          >
            <Button key="cancel" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              key="delete"
              type="primary"
              danger
              onClick={() => deleteUser(deleteId!)}
            >
              Delete
            </Button>
          </div>,
        ]}
        closable={false}
        centered
      >
        <p style={{ textAlign: "center" }}>
          Are you sure you want to delete this user?
        </p>
      </Modal>

      {/* Upload Modal */}
      <UploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
}
