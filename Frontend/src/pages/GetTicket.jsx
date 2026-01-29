import React, { useState } from "react";
import { useGetTicketsQuery } from "../features/ticketSlice/ticketApi";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  User,
  MoreHorizontal,
} from "lucide-react";

const TicketList = () => {
  const [filter, setFilter] = useState({
    page: 1,
    limit: 10,
    status: "",
    priority: "",
    category: "",
    isOverdue: "",
  });

  const {
    data: response,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetTicketsQuery(filter);

  const tickets = response?.data?.tickets || [];
  const pagination = response?.data?.pagination || {};

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilter((prev) => ({ ...prev, page: newPage }));
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Helper for Priority Badge Styling
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50 border border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border border-orange-200";
      case "medium":
        return "text-blue-600 bg-blue-50 border border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border border-gray-200";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
            <p className="text-gray-500 text-sm">
              Manage and track your support requests
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div className="relative">
            <label className="text-xs text-gray-500 font-medium ml-1">
              Status
            </label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <label className="text-xs text-gray-500 font-medium ml-1">
              Priority
            </label>
            <select
              name="priority"
              value={filter.priority}
              onChange={handleFilterChange}
              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <label className="text-xs text-gray-500 font-medium ml-1">
              Category
            </label>
            <select
              name="category"
              value={filter.category}
              onChange={handleFilterChange}
              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Software">Software</option>
              <option value="Hardware">Hardware</option>
              <option value="Network">Network</option>
              <option value="Access">Access</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Overdue Filter */}
          <div className="relative">
            <label className="text-xs text-gray-500 font-medium ml-1">
              Timeline
            </label>
            <select
              name="isOverdue"
              value={filter.isOverdue}
              onChange={handleFilterChange}
              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="true">Overdue Only</option>
              <option value="false">On Time</option>
            </select>
          </div>

          {/* Clear Filter Button */}
          <div className="flex items-end">
            <button
              onClick={() =>
                setFilter({
                  ...filter,
                  status: "",
                  priority: "",
                  category: "",
                  isOverdue: "",
                })
              }
              className="w-full py-2 px-4 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Filter size={16} /> Reset
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="p-10 text-center text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading tickets...
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-10 text-center text-red-500 bg-red-50">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p>
                Error fetching tickets:{" "}
                {error?.data?.message || "Something went wrong"}
              </p>
            </div>
          )}

          {/* Table Data */}
          {!isLoading && !isError && tickets.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No tickets found matching your filters.
            </div>
          )}

          {!isLoading && !isError && tickets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                    <th className="px-6 py-4">Issue</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className={`hover:bg-gray-50 transition ${isFetching ? "opacity-50" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {ticket.title}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">
                            {ticket.description}
                          </span>
                          {ticket.isOverdue && ticket.status !== "resolved" && (
                            <span className="text-[10px] text-red-600 font-bold mt-1">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getPriorityColor(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(ticket.status)}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ticket.category}
                      </td>
                      <td className="px-6 py-4">
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                              {ticket.assignedTo.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-900">
                                {ticket.assignedTo.fullName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {ticket.assignedTo.email}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar size={14} />
                          <span className="text-xs">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 mt-1">
                          <User size={14} />
                          <span className="text-xs">
                            {ticket.createdBy?.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoading && !isError && tickets.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-500">
                Page <span className="font-medium">{pagination.page}</span> of{" "}
                <span className="font-medium">{pagination.pages}</span>
                <span className="mx-1">·</span>
                Total <span className="font-medium">
                  {pagination.total}
                </span>{" "}
                results
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(filter.page - 1)}
                  disabled={filter.page === 1}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(filter.page + 1)}
                  disabled={filter.page === pagination.pages}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketList;
