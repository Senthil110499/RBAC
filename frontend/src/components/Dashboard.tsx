// Author: Senthil
// Changes: Week & Month toggle button working & Dashboard pie,bar chart outline removal & table only get all users


// import { useEffect, useState, memo } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
// import type { IUser } from "../types";
// import { useAuth } from "../context/AuthContext";
// import { userApi } from "../api/userApi";

// const COLORS = ["#0088FE", "#00C49F", "#82ca9d"];
// const USERS_PER_PAGE = 5;


// const UserRolesChart = memo(function UserRolesChart({
//   data,
// }: {
//   data: { name: string; value: number }[];
// }) {
//   return (
//     <ResponsiveContainer width="100%" height={180}>
//       <PieChart>
//         <Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value">
//           {data.map((_, i) => (
//             <Cell key={i} fill={COLORS[i % COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip />
//         <Legend />
//       </PieChart>
//     </ResponsiveContainer>
//   );
// });


// const UserStatusChart = memo(function UserStatusChart({
//   data,
// }: {
//   data: { name: string; count: number }[];
// }) {
//   return (
//     <ResponsiveContainer width="100%" height={180}>
//       <BarChart data={data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="name" />
//         <YAxis allowDecimals={false} />
//         <Tooltip />
//         <Legend />
//         <Bar dataKey="count" fill="#82ca9d" />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// });


// export default function CustomDashboard() {
//   useAuth();

//   // const fetchedUsersRef = useRef(false);

//   // --- Users table data (only from Role filter) ---
//   const [roleUsers, setRoleUsers] = useState<IUser[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);

//   // --- Chart filters ---
//   const [roleView, setRoleView] = useState<"week" | "month">("week");
//   const [statusView, setStatusView] = useState<"week" | "month">("week");

//   // --- Chart data ---
//   const [roleStats, setRoleStats] = useState<{ name: string; value: number }[]>([]);
//   const [statusStats, setStatusStats] = useState<{ name: string; count: number }[]>([]);

//   /// --- Fetch Roles Chart Data ---
// useEffect(() => {
//   userApi
//     .getRoleStats(roleView)
//     .then((res) => {
//       const formatted = Object.entries(res.data).map(([role, count]) => ({
//         name: role,
//         value: count as number,
//       }));
//       setRoleStats(formatted);
//     })
//     .catch(console.error);
// }, [roleView]);

// // --- Fetch Status Chart Data ---
// useEffect(() => {
//   userApi
//     .getStatusStats(statusView)
//     .then((res) => {
//       const formatted = Object.entries(res.data).map(([status, count]) => ({
//         name: status,
//         count: count as number,
//       }));
//       setStatusStats(formatted);
//     })
//     .catch(console.error);
// }, [statusView]);

// // --- Fetch ALL Users (only once for table) ---
//   useEffect(() => {
//   // if (fetchedUsersRef.current) return; // 👈 skip if already fetched
//   //   fetchedUsersRef.current = true;

//   userApi
//     .getAll()
//     .then((res) => {
//       const filtered = res.data.filter((u) => String(u.role) !== "SUPERADMIN");
//       setRoleUsers(filtered);
//       setCurrentPage(1);
//     })
//     .catch(console.error);
// }, []);



//   // --- Table Pagination ---
//   const totalPages = Math.ceil(roleUsers.length / USERS_PER_PAGE);
//   const startIndex = (currentPage - 1) * USERS_PER_PAGE;
//   const currentUsers = roleUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) setCurrentPage(page);
//   };

//   return (
//     <div className="container-dashboard">
//       {/* Charts */}
//       <div className="section-charts">
//         {/* User Roles */}
//         <div className="box-chart">
//           <div className="chart-header">
//             <h3 className="header-chart">User Roles</h3>
//             <div className="button-chart">
//               <button
//                 className={roleView === "week" ? "active" : ""}
//                 onClick={() => setRoleView("week")}
//               >
//                 Week
//               </button>
//               <button
//                 className={roleView === "month" ? "active" : ""}
//                 onClick={() => setRoleView("month")}
//               >
//                 Month
//               </button>
//             </div>
//           </div>

//           <UserRolesChart data={roleStats} />
//         </div>

//         {/* User Status */}
//         <div className="box-chart">
//           <div className="chart-header">
//             <h3 className="header-chart">User Status</h3>
//             <div className="button-chart">
//               <button
//                 className={statusView === "week" ? "active" : ""}
//                 onClick={() => setStatusView("week")}
//               >
//                 Week
//               </button>
//               <button
//                 className={statusView === "month" ? "active" : ""}
//                 onClick={() => setStatusView("month")}
//               >
//                 Month
//               </button>
//             </div>
//           </div>

//           <UserStatusChart data={statusStats} />
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="box-chart">
//       <h3 className="text">User Details</h3>
//       <table className="table-users">
//         <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Role</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentUsers.map((u, index) => (
//             <tr key={u.id}>
//               <td>{startIndex + index + 1}</td>
//               <td>{u.name}</td>
//               <td>{u.email}</td>
//               <td>{u.role}</td>
//               <td>{u.status}</td>
//             </tr>
//           ))}

//           {/* filler rows to keep table height fixed */}
//           {Array.from({ length: USERS_PER_PAGE - currentUsers.length }).map((_, i) => (
//             <tr key={`empty-${i}`} className="empty-row">
//               <td colSpan={5}>&nbsp;</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       </div>

//       {/* Pagination */}
//       <div className="pagination-text">
//         <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
//           Prev
//         </button>

//         <span>Page {currentPage} of {totalPages || 1}</span>

//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }









// import { useEffect, useState, memo } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
// import { Table, Card } from "antd";
// import type { IUser } from "../types";
// import { useAuth } from "../context/AuthContext";
// import { userApi } from "../api/userApi";

// const COLORS = ["#0088FE", "#00C49F", "#82ca9d"];
// const USERS_PER_PAGE = 5;

// const UserRolesChart = memo(function UserRolesChart({
//   data,
// }: {
//   data: { name: string; value: number }[];
// }) {
//   return (
//     <ResponsiveContainer width="100%" height={180} >
//       <PieChart>
//         <Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value">
//           {data.map((_, i) => (
//             <Cell key={i} fill={COLORS[i % COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip />
//         <Legend />
//       </PieChart>
//     </ResponsiveContainer>
//   );
// });

// const UserStatusChart = memo(function UserStatusChart({
//   data,
// }: {
//   data: { name: string; count: number }[];
// }) {
//   return (
//     <ResponsiveContainer width="100%" height={180}>
//       <BarChart data={data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="name" />
//         <YAxis allowDecimals={false} />
//         <Tooltip />
//         <Legend />
//         <Bar dataKey="count" fill="#82ca9d" />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// });

// export default function CustomDashboard() {
//   useAuth();

//   const [roleUsers, setRoleUsers] = useState<IUser[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);

//   const [roleView, setRoleView] = useState<"week" | "month">("week");
//   const [statusView, setStatusView] = useState<"week" | "month">("week");

//   const [roleStats, setRoleStats] = useState<{ name: string; value: number }[]>([]);
//   const [statusStats, setStatusStats] = useState<{ name: string; count: number }[]>([]);

//   // Fetch Roles Chart Data + Users
//   useEffect(() => {
//     userApi
//       .getRoleStats(roleView)
//       .then((res) => {
//         const formatted = Object.entries(res.data).map(([role, count]) => ({
//           name: role,
//           value: count as number,
//         }));
//         setRoleStats(formatted);
//       })
//       .catch(console.error);

//     userApi
//       .getAll()
//       .then((res) => {
//         const filtered = res.data.filter((u) => {
//           const created = new Date(u.createdAt);
//           const now = new Date();
//           if (roleView === "week") {
//             const startOfWeek = new Date(now);
//             startOfWeek.setDate(now.getDate() - now.getDay());
//             return created >= startOfWeek;
//           } else {
//             return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
//           }
//         });
//         setRoleUsers(filtered);
//         setCurrentPage(1);
//       })
//       .catch(console.error);
//   }, [roleView]);

//   // Fetch Status Chart Data + Users
//   useEffect(() => {
//     userApi
//       .getStatusStats(statusView)
//       .then((res) => {
//         const formatted = Object.entries(res.data).map(([status, count]) => ({
//           name: status,
//           count: count as number,
//         }));
//         setStatusStats(formatted);
//       })
//       .catch(console.error);

//     userApi
//       .getAll()
//       .then((res) => {
//         const filtered = res.data.filter((u) => {
//           const created = new Date(u.createdAt);
//           const now = new Date();
//           if (statusView === "week") {
//             const startOfWeek = new Date(now);
//             startOfWeek.setDate(now.getDate() - now.getDay());
//             return created >= startOfWeek;
//           } else {
//             return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
//           }
//         });
//         setRoleUsers(filtered);
//         setCurrentPage(1);
//       })
//       .catch(console.error);
//   }, [statusView]);

//   // Table Pagination
//   const startIndex = (currentPage - 1) * USERS_PER_PAGE;
//   const currentUsers = roleUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
//   // const totalPages = Math.ceil(roleUsers.length / USERS_PER_PAGE);

//   // Ant Design Table columns
//   const columns = [
//     {
//       title: "S.No",
//       key: "index",
//       render: (_: any, __: IUser, idx: number) => startIndex + idx + 1,
//       align: "center" as const,
//     },
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//       render: (text: string) => text || "-",
//       align: "center" as const,
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       key: "email",
//       align: "center" as const,
//     },
//     {
//       title: "Role",
//       dataIndex: "role",
//       key: "role",
//       align: "center" as const,
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       align: "center" as const,
//     },
//   ];

//   return (
//     <div className="container-dashboard">
//       {/* Charts */}
//       <div className="section-charts">
//         <div className="box-chart">
//           <div className="chart-header">
//             <h3 className="header-chart">User Roles</h3>
//             <div className="button-chart">
//               <button
//                 className={roleView === "week" ? "active" : ""}
//                 onClick={() => setRoleView("week")}
//               >
//                 Week
//               </button>
//               <button
//                 className={roleView === "month" ? "active" : ""}
//                 onClick={() => setRoleView("month")}
//               >
//                 Month
//               </button>
//             </div>
//           </div>
//           <UserRolesChart data={roleStats} />
//         </div>

//         <div className="box-chart">
//           <div className="chart-header">
//             <h3 className="header-chart">User Status</h3>
//             <div className="button-chart">
//               <button
//                 className={statusView === "week" ? "active" : ""}
//                 onClick={() => setStatusView("week")}
//               >
//                 Week
//               </button>
//               <button
//                 className={statusView === "month" ? "active" : ""}
//                 onClick={() => setStatusView("month")}
//               >
//                 Month
//               </button>
//             </div>
//           </div>
//           <UserStatusChart data={statusStats} />
//         </div>
//       </div>

//       {/* Ant Design Table */}
//       <Card size="small">
//         <h3 className="text">User Details</h3>
//         <Table
//           size="small"
//           columns={columns}
//           dataSource={currentUsers}
//           rowKey="id"
//           pagination={{
//             current: currentPage,
//             pageSize: USERS_PER_PAGE,
//             total: roleUsers.length,
//             onChange: (page) => setCurrentPage(page),
//             showSizeChanger: false,
//             position: ["bottomRight"],
//           }}
//           bordered={false}
//           className="antd-table"
//         />
//       </Card>
//     </div>
//   );
// }










// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Users, CheckCircle2, XCircle, Shield, ShieldCheck } from "lucide-react";
import type { IUser, Role } from "../types";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/userApi";

const DASHBOARD_USER_LIMIT = 5;

const ROLE_META: { key: Role; label: string; color: string }[] = [
  { key: "SUPERADMIN", label: "Super admin", color: "#6d28d9" },
  { key: "ADMIN", label: "Admin", color: "#4f46e5" },
  { key: "USER", label: "User", color: "#94a3b8" },
];

const AVATAR_COLORS = [
  { bg: "#e0f2fe", fg: "#0369a1" },
  { bg: "#fce7f3", fg: "#be185d" },
  { bg: "#ede9fe", fg: "#6d28d9" },
  { bg: "#dcfce7", fg: "#15803d" },
  { bg: "#fef3c7", fg: "#b45309" },
];

type Period = "week" | "month";

const isActive = (u: IUser) => String(u.status).toLowerCase() === "active";

const initials = (u: IUser) => {
  const source = (u.name || u.email || "").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
};

const formatDate = (value: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "-";

function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="db-toggle">
      <button className={value === "week" ? "active" : ""} onClick={() => onChange("week")}>Week</button>
      <button className={value === "month" ? "active" : ""} onClick={() => onChange("month")}>Month</button>
    </div>
  );
}

const RolesDonut = memo(function RolesDonut({
  data,
  total,
}: {
  data: { name: string; value: number; color: string }[];
  total: number;
}) {
  const hasData = total > 0;
  return (
    <div className="db-donut">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={hasData ? data : [{ name: "empty", value: 1, color: "#e5e7eb" }]}
            dataKey="value"
            innerRadius={50}
            outerRadius={72}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {(hasData ? data : [{ color: "#e5e7eb" }]).map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="db-donut-center">
        <strong>{total}</strong>
        <span>users</span>
      </div>
    </div>
  );
});

export default function CustomDashboard() {
  useAuth();

  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [roleView, setRoleView] = useState<Period>("month");
  const [statusView, setStatusView] = useState<Period>("month");

  const [roleStats, setRoleStats] = useState<Record<string, number>>({});
  const [statusStats, setStatusStats] = useState<{ Active: number; Inactive: number }>({ Active: 0, Inactive: 0 });

  useEffect(() => {
    userApi
      .getRoleStats(roleView)
      .then((res) => setRoleStats(res.data ?? {}))
      .catch(console.error);
  }, [roleView]);

  useEffect(() => {
    userApi
      .getStatusStats(statusView)
      .then((res) => setStatusStats({ Active: res.data?.Active ?? 0, Inactive: res.data?.Inactive ?? 0 }))
      .catch(console.error);
  }, [statusView]);

  useEffect(() => {
    userApi
      .getAll()
      .then((res) => {
        setAllUsers(res.data.filter((u: IUser) => String(u.role) !== "SUPERADMIN"));
      })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, []);

  // --- Summary cards ---
  const summary = useMemo(() => {
    const total = allUsers.length;
    const active = allUsers.filter(isActive).length;
    const admins = allUsers.filter((u) => u.role === "ADMIN").length;
    const roleCount = new Set(allUsers.map((u) => u.role)).size;
    return { total, active, inactive: total - active, admins, roleCount };
  }, [allUsers]);

  const activePct = summary.total ? Math.round((summary.active / summary.total) * 100) : 0;

  // --- Roles chart ---
  const roleData = ROLE_META.map((r) => ({ name: r.label, value: roleStats[r.key] ?? 0, color: r.color }));
  const roleTotal = roleData.reduce((sum, r) => sum + r.value, 0);

  // --- Status bars ---
  const statusTotal = statusStats.Active + statusStats.Inactive;
  const pct = (n: number) => (statusTotal ? Math.round((n / statusTotal) * 100) : 0);

  // --- Table: only the first few users, the rest are on the Users page ---
  const currentUsers = allUsers.slice(0, DASHBOARD_USER_LIMIT);

  const periodLabel = (p: Period) => (p === "week" ? "This week" : "This month");

  return (
    <div className="db">
      {/* Summary cards */}
      <div className="db-stats">
        <div className="db-stat cyan">
          <span className="db-stat-icon"><Users size={24} /></span>
          <div className="db-stat-body">
            <span className="db-stat-title">Total Users</span>
            <strong>{summary.total}</strong>
            <small>Across {summary.roleCount} {summary.roleCount === 1 ? "role" : "roles"}</small>
          </div>
        </div>
        <div className="db-stat green">
          <span className="db-stat-icon"><CheckCircle2 size={24} /></span>
          <div className="db-stat-body">
            <span className="db-stat-title">Active Users</span>
            <strong>{summary.active}</strong>
            <small>{activePct}% of users are active</small>
          </div>
        </div>
        <div className="db-stat red">
          <span className="db-stat-icon"><XCircle size={24} /></span>
          <div className="db-stat-body">
            <span className="db-stat-title">Inactive Users</span>
            <strong>{summary.inactive}</strong>
            <small>{summary.inactive ? `${summary.inactive} suspended accounts` : "No suspended accounts"}</small>
          </div>
        </div>
        <div className="db-stat violet">
          <span className="db-stat-icon"><Shield size={24} /></span>
          <div className="db-stat-body">
            <span className="db-stat-title">Admins</span>
            <strong>{summary.admins}</strong>
            <small>Can manage users</small>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="db-grid-2">
        {/* User Roles */}
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <h3>User roles</h3>
              <p>{periodLabel(roleView)}</p>
            </div>
            <PeriodToggle value={roleView} onChange={setRoleView} />
          </div>
          <div className="db-roles">
            <RolesDonut data={roleData} total={roleTotal} />
            <ul className="db-legend">
              {roleData.map((r) => (
                <li key={r.name}>
                  <span className="db-dot" style={{ background: r.color }} />
                  <span className="db-legend-label">{r.name}</span>
                  <strong>{r.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* User Status */}
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <h3>User status</h3>
              <p>{periodLabel(statusView)}</p>
            </div>
            <PeriodToggle value={statusView} onChange={setStatusView} />
          </div>
          <div className="db-bars">
            <div className="db-bar-row">
              <div className="db-bar-label">
                <span>Active</span>
                <span>{statusStats.Active} · {pct(statusStats.Active)}%</span>
              </div>
              <div className="db-bar-track">
                <div className="db-bar-fill green" style={{ width: `${pct(statusStats.Active)}%` }} />
              </div>
            </div>
            <div className="db-bar-row">
              <div className="db-bar-label">
                <span>Inactive</span>
                <span>{statusStats.Inactive} · {pct(statusStats.Inactive)}%</span>
              </div>
              <div className="db-bar-track">
                <div className="db-bar-fill amber" style={{ width: `${pct(statusStats.Inactive)}%` }} />
              </div>
            </div>
          </div>
          <div className="db-note">
            <ShieldCheck size={16} />
            {statusTotal === 0
              ? "No accounts in this period."
              : statusStats.Inactive === 0
              ? "Every account in this workspace is active."
              : `${statusStats.Inactive} ${statusStats.Inactive === 1 ? "account is" : "accounts are"} inactive.`}
          </div>
        </div>
      </div>

      {/* User Details (full width) */}
      <div className="db-card db-card-table">
        <div className="db-card-head">
          <h3>User details</h3>
          <Link to="/users" className="db-link">View all</Link>
        </div>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th className="db-col-index">S.No</th>
                <th className="db-col-user">
                  <span className="db-user-head">User</span>
                </th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr><td colSpan={5} className="db-empty">Loading users...</td></tr>
              ) : currentUsers.length === 0 ? (
                <tr><td colSpan={5} className="db-empty">No users found</td></tr>
              ) : (
                currentUsers.map((u, i) => {
                  const avatar = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  return (
                    <tr key={u.id ?? u.email}>
                      <td className="db-col-index">{i + 1}</td>
                      <td className="db-col-user">
                        <div className="db-user">
                          <span className="db-avatar" style={{ background: avatar.bg, color: avatar.fg }}>
                            {initials(u)}
                          </span>
                          <div>
                            <div className="db-user-name">{u.name || "-"}</div>
                            <div className="db-user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`db-pill role-${String(u.role).toLowerCase()}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className={`db-status ${isActive(u) ? "active" : "inactive"}`}>
                          <span className="db-status-dot" />
                          {isActive(u) ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="db-muted">{formatDate(u.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {allUsers.length > DASHBOARD_USER_LIMIT && (
          <div className="db-pagination">
            <span>Showing {DASHBOARD_USER_LIMIT} of {allUsers.length} users</span>
          </div>
        )}
      </div>
    </div>
  );
}
