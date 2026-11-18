import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { userApi, PAGE_SIZE_OPTIONS } from "../api/userApi";
import type { IUser, Role, Status } from "../types";
import { Upload, Plus, Filter, Download, Search } from "lucide-react";
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

  // Pagination (server-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  // Filters / search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"" | Role>("");
  const [filterStatus, setFilterStatus] = useState<"" | Status>("");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Wait until the user stops typing before hitting the API
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const requestId = useRef(0);

  const fetchUsers = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const res = await userApi.getPaginated({
        page: currentPage,
        limit: usersPerPage,
        search: debouncedSearch || undefined,
        role: filterRole || undefined,
        status: filterStatus || undefined,
        fromDate: filterFromDate && filterToDate ? filterFromDate : undefined,
        toDate: filterFromDate && filterToDate ? filterToDate : undefined,
      });
      if (id !== requestId.current) return; // a newer request is in flight
      const { data, total, totalPages: pages } = res.data;

      // e.g. last user on the last page was deleted → step back a page
      if (data.length === 0 && total > 0 && currentPage > pages) {
        setCurrentPage(pages);
        return;
      }

      setUsers(data);
      setTotalPages(pages);
    } catch (err: any) {
      if (id === requestId.current) toast.error(err?.response?.data?.message || "Failed to load users");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [currentPage, usersPerPage, debouncedSearch, filterRole, filterStatus, filterFromDate, filterToDate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshKey]);

  // Back to page 1 whenever the result set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterRole, filterStatus, filterFromDate, filterToDate, usersPerPage]);

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
      refresh();
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

  const role = user?.role?.toUpperCase();
  const activeFilters = [filterRole, filterStatus, filterFromDate && filterToDate].filter(Boolean).length;

  return (
    <div className="um">
      <div className="um-card">
        {/* Toolbar */}
        <div className="um-toolbar">
          <div className="um-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name or email"
              maxLength={100}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="um-header-actions">
            <Tooltip title="Filter by role, status or date">
              <button className={`um-btn ${activeFilters ? "filtered" : ""}`} onClick={() => setShowFilterModal(true)}>
                <Filter size={18} /> Filters{activeFilters ? ` (${activeFilters})` : ""}
              </button>
            </Tooltip>
            {role === "SUPERADMIN" && (
              <button className="um-btn" onClick={() => setShowUploadModal(true)}>
                <Upload size={18} /> Import
              </button>
            )}
            {role !== "USER" && (
              <button className="um-btn" onClick={handleDownload}>
                <Download size={18} /> Export
              </button>
            )}
            {role === "SUPERADMIN" && (
              <button className="um-btn primary" onClick={() => setShowModal(true)}>
                <Plus size={18} /> Add user
              </button>
            )}
          </div>
        </div>

        <UserTable
          users={users}
          loading={loading}
          currentPage={currentPage}
          usersPerPage={usersPerPage}
          totalPages={totalPages}
          pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
          onPageSizeChange={setUsersPerPage}
          userRole={user?.role}
          toggleStatus={toggleStatus}
          setEditingUser={(u) => setEditingUser(u)}
          setDeleteId={(id) => setDeleteId(id)}
          setCurrentPage={(p) => setCurrentPage(p)}
          showActions={true}
        />
      </div>

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
          onSuccess={() => refresh()}
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
        className="app-modal"
        title="Delete User"
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        width={480}
        centered
        footer={[
          <Button key="cancel" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={() => deleteUser(deleteId!)}
          >
            Delete
          </Button>,
        ]}
      >
        <p className="app-modal-help">
          Are you sure you want to delete this user?
        </p>
      </Modal>

      {/* Upload Modal */}
      <UploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => refresh()}
      />
    </div>
  );
}
