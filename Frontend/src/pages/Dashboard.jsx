// import { Link } from "react-router-dom"; // Removed unused useSelector
// import {
//   useGetTicketStatsQuery,
//   useUpdateOverdueTicketsMutation,
// } from "../features/ticketSlice/ticketApi";
// import { useGetCurrentUserQuery } from "../features/authSlice/authApiSlice";
// import {
//   Ticket,
//   Clock,
//   CheckCircle,
//   AlertTriangle,
//   TrendingUp,
//   Plus,
//   ArrowRight,
//   Loader2,
//   RefreshCw,
// } from "lucide-react";

// const Dashboard = () => {
//   // --- FIX START ---
//   // ERROR WAS HERE: const user = useSelector(useGetCurrentUserQuery);

//   // CORRECT WAY: Call the RTK Query hook directly
//   const { data: userData } = useGetCurrentUserQuery();

//   // Unwrap the data (assuming your API response format is { data: userObject })
//   // If your API returns the user object directly, just use 'userData'
//   const user = userData?.data || userData || {};
//   // --- FIX END ---

//   const { data: statsData, isLoading, refetch } = useGetTicketStatsQuery();
//   const [updateOverdue, { isLoading: isUpdating }] =
//     useUpdateOverdueTicketsMutation();

//   const stats = statsData?.data || {};
//   const overview = stats.overview?.[0] || { total: 0, overdue: 0, resolved: 0 };
//   const byStatus = stats.byStatus || [];
//   const byPriority = stats.byPriority || [];

//   const handleUpdateOverdue = async () => {
//     try {
//       await updateOverdue().unwrap();
//       refetch();
//     } catch (error) {
//       console.error("Failed to update overdue tickets:", error);
//     }
//   };

//   const getStatusCount = (status) => {
//     return byStatus.find((s) => s.status === status)?.count || 0;
//   };

//   const getPriorityCount = (priority) => {
//     return byPriority.find((p) => p.priority === priority)?.count || 0;
//   };

//   const statCards = [
//     {
//       title: "Total Tickets",
//       value: overview.total,
//       icon: Ticket,
//       color: "bg-blue-500",
//       bgColor: "bg-blue-50",
//       textColor: "text-blue-700",
//     },
//     {
//       title: "In Progress",
//       value: getStatusCount("in-progress"),
//       icon: Clock,
//       color: "bg-yellow-500",
//       bgColor: "bg-yellow-50",
//       textColor: "text-yellow-700",
//     },
//     {
//       title: "Resolved",
//       value: overview.resolved,
//       icon: CheckCircle,
//       color: "bg-green-500",
//       bgColor: "bg-green-50",
//       textColor: "text-green-700",
//     },
//     {
//       title: "Overdue",
//       value: overview.overdue,
//       icon: AlertTriangle,
//       color: "bg-red-500",
//       bgColor: "bg-red-50",
//       textColor: "text-red-700",
//     },
//   ];

//   const priorityColors = {
//     critical: "bg-red-100 text-red-800 border-red-200",
//     high: "bg-orange-100 text-orange-800 border-orange-200",
//     medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
//     low: "bg-green-100 text-green-800 border-green-200",
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {/* Added defensive check for fullName to prevent crash if data isn't loaded yet */}
//             Welcome back,{" "}
//             {user?.fullName ? user.fullName.split(" ")[0] : "User"}!
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Here's an overview of your ticket activity
//           </p>
//         </div>
//         <div className="flex gap-3">
//           {user?.role === "admin" && (
//             <button
//               onClick={handleUpdateOverdue}
//               disabled={isUpdating}
//               className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
//             >
//               <RefreshCw
//                 className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`}
//               />
//               Update Overdue
//             </button>
//           )}
//           {user?.role === "employee" && (
//             <Link
//               to="/tickets/create"
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <Plus className="w-4 h-4" />
//               New Ticket
//             </Link>
//           )}
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {statCards.map((stat) => (
//           <div
//             key={stat.title}
//             className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">
//                   {stat.title}
//                 </p>
//                 <p className="text-3xl font-bold text-gray-900 mt-2">
//                   {stat.value}
//                 </p>
//               </div>
//               <div className={`${stat.bgColor} p-3 rounded-lg`}>
//                 <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* By Status */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Tickets by Status
//           </h3>
//           <div className="space-y-4">
//             {["open", "in-progress", "on-hold", "resolved", "closed"].map(
//               (status) => {
//                 const count = getStatusCount(status);
//                 const percentage =
//                   overview.total > 0 ? (count / overview.total) * 100 : 0;
//                 const statusColors = {
//                   open: "bg-blue-500",
//                   "in-progress": "bg-yellow-500",
//                   "on-hold": "bg-purple-500",
//                   resolved: "bg-green-500",
//                   closed: "bg-gray-500",
//                 };
//                 return (
//                   <div key={status}>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-gray-600 capitalize">
//                         {status.replace("-", " ")}
//                       </span>
//                       <span className="font-medium text-gray-900">{count}</span>
//                     </div>
//                     <div className="w-full bg-gray-100 rounded-full h-2">
//                       <div
//                         className={`${statusColors[status]} h-2 rounded-full transition-all`}
//                         style={{ width: `${percentage}%` }}
//                       />
//                     </div>
//                   </div>
//                 );
//               },
//             )}
//           </div>
//         </div>

//         {/* By Priority */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Tickets by Priority
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             {["critical", "high", "medium", "low"].map((priority) => (
//               <div
//                 key={priority}
//                 className={`p-4 rounded-lg border ${priorityColors[priority]}`}
//               >
//                 <p className="text-sm font-medium capitalize">{priority}</p>
//                 <p className="text-2xl font-bold mt-1">
//                   {getPriorityCount(priority)}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">
//           Quick Actions
//         </h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           <Link
//             to="/tickets"
//             className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
//           >
//             <div className="flex items-center gap-3">
//               <Ticket className="w-5 h-5 text-blue-600" />
//               <span className="font-medium text-gray-900">
//                 View All Tickets
//               </span>
//             </div>
//             <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
//           </Link>

//           {user?.role === "employee" && (
//             <Link
//               to="/tickets/create"
//               className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
//             >
//               <div className="flex items-center gap-3">
//                 <Plus className="w-5 h-5 text-green-600" />
//                 <span className="font-medium text-gray-900">
//                   Create New Ticket
//                 </span>
//               </div>
//               <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
//             </Link>
//           )}

//           {user?.role === "admin" && (
//             <>
//               <Link
//                 to="/admin/tickets"
//                 className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
//               >
//                 <div className="flex items-center gap-3">
//                   <TrendingUp className="w-5 h-5 text-purple-600" />
//                   <span className="font-medium text-gray-900">
//                     Manage All Tickets
//                   </span>
//                 </div>
//                 <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
//               </Link>

//               <Link
//                 to="/admin/performance"
//                 className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
//               >
//                 <div className="flex items-center gap-3">
//                   <TrendingUp className="w-5 h-5 text-orange-600" />
//                   <span className="font-medium text-gray-900">
//                     Agent Performance
//                   </span>
//                 </div>
//                 <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import {
  useGetTicketStatsQuery,
  useUpdateOverdueTicketsMutation,
} from "../features/ticketSlice/ticketApi";
import { useGetCurrentUserQuery } from "../features/authSlice/authApiSlice";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCards from "../components/dashboard/StatsCard";
import StatusChart from "../components/dashboard/StatsChart";
import PriorityChart from "../components/dashboard/PriorityChart";
import QuickActions from "../components/dashboard/QuickActions";

const Dashboard = () => {
  const { data: userData } = useGetCurrentUserQuery();
  const user = userData?.data || userData || {};

  const { data: statsData, isLoading, refetch } = useGetTicketStatsQuery();
  const [updateOverdue, { isLoading: isUpdating }] =
    useUpdateOverdueTicketsMutation();

  const stats = statsData?.data || {};
  const overview = stats.overview?.[0] || { total: 0, overdue: 0, resolved: 0 };
  const byStatus = stats.byStatus || [];
  const byPriority = stats.byPriority || [];

  const handleUpdateOverdue = async () => {
    try {
      await updateOverdue().unwrap();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusCount = (status) =>
    byStatus.find((s) => s.status === status)?.count || 0;

  const getPriorityCount = (priority) =>
    byPriority.find((p) => p.priority === priority)?.count || 0;

  const statCards = [
    {
      title: "Total Tickets",
      value: overview.total,
      icon: Ticket,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "In Progress",
      value: getStatusCount("in-progress"),
      icon: Clock,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    {
      title: "Resolved",
      value: overview.resolved,
      icon: CheckCircle,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "Overdue",
      value: overview.overdue,
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
  ];

  const priorityColors = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={user}
        onUpdateOverdue={handleUpdateOverdue}
        isUpdating={isUpdating}
      />

      <StatsCards statCards={statCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusChart overview={overview} getStatusCount={getStatusCount} />
        <PriorityChart
          priorityColors={priorityColors}
          getPriorityCount={getPriorityCount}
        />
      </div>

      <QuickActions user={user} />
    </div>
  );
};

export default Dashboard;
