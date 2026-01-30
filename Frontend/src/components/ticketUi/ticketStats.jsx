import React from "react";
import { useGetTicketStatsQuery } from "../../features/ticketSlice/ticketApi";
import {
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  TrendingUp,
} from "lucide-react";

const TicketStats = () => {
  const { data: response, isLoading, isError } = useGetTicketStatsQuery();
  const stats = response?.data || {};

  // Extract Overview Data (Accessing the first element of the array from $facet)
  const overview = stats.overview?.[0] || { total: 0, overdue: 0, resolved: 0 };
  const byStatus = stats.byStatus || [];
  const byPriority = stats.byPriority || [];

  // Helper to calculate percentage for progress bars
  const getPercentage = (count) => {
    if (!overview.total) return 0;
    return Math.round((count / overview.total) * 100);
  };

  // Helper for Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "in-progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      case "on-hold":
        return "bg-purple-500";
      default:
        return "bg-gray-300";
    }
  };

  // Helper for Priority Colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-blue-500";
      case "low":
        return "bg-gray-400";
      default:
        return "bg-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (isError)
    return <div className="text-red-500">Failed to load statistics.</div>;

  return (
    <div className="space-y-6">
      {/* 1. Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Tickets */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Tickets</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {overview.total}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Layers size={24} />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Resolved</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {overview.resolved}
            </h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Overdue</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {overview.overdue}
            </h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* 2. Detailed Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={18} /> Status Distribution
          </h4>

          <div className="space-y-4">
            {byStatus.length > 0 ? (
              byStatus.map((item) => (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-gray-700">
                      {item.status}
                    </span>
                    <span className="text-gray-500">
                      {item.count} ({getPercentage(item.count)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getStatusColor(item.status)}`}
                      style={{ width: `${getPercentage(item.count)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                No data available
              </p>
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <AlertCircle size={18} /> Priority Breakdown
          </h4>

          <div className="space-y-4">
            {byPriority.length > 0 ? (
              byPriority.map((item) => (
                <div key={item.priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-gray-700">
                      {item.priority}
                    </span>
                    <span className="text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getPriorityColor(item.priority)}`}
                      style={{ width: `${getPercentage(item.count)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                No data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketStats;
