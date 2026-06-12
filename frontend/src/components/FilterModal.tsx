// // src/components/FilterModal.tsx
// import { useState, useEffect } from "react";
// import type { Role, Status } from "../types";

// interface FilterModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onApply: (filters: {
//     role: Role | "";
//     status: Status | "";
//     month: number | "";
//   }) => void;
//   initialFilters: {
//     role: Role | "";
//     status: Status | "";
//     month: number | "";
//   };
// }

// export default function FilterModal({
//   visible,
//   onClose,
//   onApply,
//   initialFilters,
// }: FilterModalProps) {
//   const [role, setRole] = useState<Role | "">(initialFilters.role);
//   const [status, setStatus] = useState<Status | "">(initialFilters.status);
//   const [month, setMonth] = useState<number | "">(initialFilters.month);

//   useEffect(() => {
//     // when modal opens, sync state with current filters
//     if (visible) {
//       setRole(initialFilters.role);
//       setStatus(initialFilters.status);
//       setMonth(initialFilters.month);
//     }
//   }, [visible, initialFilters]);

//   if (!visible) return null;

//   const handleReset = () => {
//     setRole("");
//     setStatus("");
//     setMonth("");
//   };

//   const handleApply = () => {
//     onApply({ role, status, month });
//     onClose();
//   };

//   return (
//     <div className="modal-backdrop">
//       <div className="modal-card">
//         <h3 className="modal-title">Filters</h3>

//         <label>Roles</label>
//         <select
//           className="modal-input"
//           value={role}
//           onChange={(e) => setRole(e.target.value as Role)}
//         >
//           <option value="">All Roles</option>
//           <option value="ADMIN">Admin</option>
//           <option value="USER">User</option>
//         </select>
        

//         <label>Status</label>
//         <select
//           className="modal-input"
//           value={status}
//           onChange={(e) => setStatus(e.target.value as Status | "")}
//         >
//           <option value="">All Status</option>
//           <option value="active">Active</option>
//           <option value="Inactive">Inactive</option>
//         </select>
        

//         <label>Month</label>
//         <select
//           className="modal-input"
//           value={month}
//           onChange={(e) =>
//             setMonth(e.target.value ? Number(e.target.value) : "")
//           }
//         >
//           <option value="">All Months</option>
//           {Array.from({ length: 12 }, (_, i) => (
//             <option key={i + 1} value={i + 1}>
//               {new Date(0, i).toLocaleString("default", { month: "long" })}
//             </option>
//           ))}
//         </select>

//         <div className="modal-actions">
//           <button className="btn-secondary" onClick={handleReset}>
//             Reset
//           </button>
//           <button className="btn-primary" onClick={handleApply}>
//             Apply
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/components/FilterModal.tsx
import { useState, useEffect } from "react";
import { Modal, Select, Button, Form, DatePicker } from "antd";
import type { Role, Status } from "../types";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    role: Role | "";
    status: Status | "";
    fromDate: string | "";
    toDate: string | "";
  }) => void;
  initialFilters: {
    role: Role | "";
    status: Status | "";
    fromDate: string | "";
    toDate: string | "";
  };
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) {
  const [role, setRole] = useState<Role | "">(initialFilters.role);
  const [status, setStatus] = useState<Status | "">(initialFilters.status);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setRole(initialFilters.role);
      setStatus(initialFilters.status);
      setDateRange(
        initialFilters.fromDate && initialFilters.toDate
          ? [dayjs(initialFilters.fromDate), dayjs(initialFilters.toDate)]
          : null
      );
    }
  }, [visible, initialFilters]);

  const handleApply = async () => {
    setLoading(true);
    try {
      onApply({
        role,
        status,
        fromDate: dateRange ? dateRange[0].format("YYYY-MM-DD") : "",
        toDate: dateRange ? dateRange[1].format("YYYY-MM-DD") : "",
      });
      onClose();
    } finally {
      setTimeout(() => setLoading(false), 500);
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
      title="Filters"
      open={visible}
      onCancel={onClose}
      closable={false}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
        Cancel
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={handleApply}
          loading={loading}
        >
          Apply
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Roles" style={{ marginBottom: "8px" }}>
          <Select
            value={role || undefined}
            onChange={(value) => setRole(value as Role)}
            allowClear
            placeholder="All Roles"
          >
            <Select.Option value="ADMIN">Admin</Select.Option>
            <Select.Option value="USER">User</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Status" style={{ marginBottom: "8px" }}>
          <Select
            value={status || undefined}
            onChange={(value) => setStatus(value as Status)}
            allowClear
            placeholder="All Status"
          >
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        {/* ✅ Replace Month filter with Date Range Picker */}
        <Form.Item label="Date Range" style={{ marginBottom: "30px" }}>
          <RangePicker
            value={dateRange || null}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            format="YYYY-MM-DD"
            style={{ width: "100%" }}
            allowClear
            dropdownClassName="custom-range-picker"
          />
        </Form.Item>
      </Form>
    </Modal>
    </>
  );
}

