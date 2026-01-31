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
