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
import { useEffect, useState, memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { IUser } from "../types";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/userApi";
import { UserTable } from "./CustomComponent";


const COLORS = ["#0088FE", "#00C49F", "#82ca9d"];
const USERS_PER_PAGE = 5;

const UserRolesChart = memo(function UserRolesChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
});

const UserStatusChart = memo(function UserStatusChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <RechartsTooltip />
        <Legend />
        <Bar dataKey="count" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
});

export default function CustomDashboard() {
  useAuth();

  const [roleUsers, setRoleUsers] = useState<IUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [roleView, setRoleView] = useState<"week" | "month">("week");
  const [statusView, setStatusView] = useState<"week" | "month">("week");

  const [roleStats, setRoleStats] = useState<{ name: string; value: number }[]>([]);
  const [statusStats, setStatusStats] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    userApi
      .getRoleStats(roleView)
      .then((res) => {
        const formatted = Object.entries(res.data).map(([role, count]) => ({
          name: role,
          value: count as number,
        }));
        setRoleStats(formatted);
      })
      .catch(console.error);
  }, [roleView]);

  useEffect(() => {
    userApi
      .getStatusStats(statusView)
      .then((res) => {
        const formatted = Object.entries(res.data).map(([status, count]) => ({
          name: status,
          count: count as number,
        }));
        setStatusStats(formatted);
      })
      .catch(console.error);
  }, [statusView]);

  useEffect(() => {
    userApi
      .getAll()
      .then((res) => {
        const filtered = res.data.filter((u: IUser) => String(u.role) !== "SUPERADMIN");
        setRoleUsers(filtered);
        setCurrentPage(1);
      })
      .catch(console.error);
  }, []);

  const totalPages = Math.ceil(roleUsers.length / USERS_PER_PAGE);

  return (
    <div className="container-dashboard">
      {/* Charts */}
      <div className="section-charts">
        {/* User Roles Chart */}
        <div className="box-chart">
          <div className="chart-header">
            <h3 className="header-chart">User Roles</h3>
            <div className="button-chart">
              <button className={roleView === "week" ? "active" : ""} onClick={() => setRoleView("week")}>Week</button>
              <button className={roleView === "month" ? "active" : ""} onClick={() => setRoleView("month")}>Month</button>
            </div>
          </div>
          <UserRolesChart data={roleStats} />
        </div>

        {/* User Status Chart */}
        <div className="box-chart">
          <div className="chart-header">
            <h3 className="header-chart">User Status</h3>
            <div className="button-chart">
              <button className={statusView === "week" ? "active" : ""} onClick={() => setStatusView("week")}>Week</button>
              <button className={statusView === "month" ? "active" : ""} onClick={() => setStatusView("month")}>Month</button>
            </div>
          </div>
          <UserStatusChart data={statusStats} />
        </div>
      </div>

      {/* Users Table (read-only) */}
      <div className="box-chart">
        <h3 className="text">User Details</h3>
        <UserTable
          users={roleUsers}
          loading={false}
          currentPage={currentPage}
          usersPerPage={USERS_PER_PAGE}
          totalPages={totalPages}
          userRole={undefined} // actions hidden
          setCurrentPage={(p) => setCurrentPage(p)}
          showActions={false}
          className="dashboard-table"
        />
      </div>
    </div>
  );
}

