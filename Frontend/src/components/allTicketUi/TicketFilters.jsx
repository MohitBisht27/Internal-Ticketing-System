import { Filter } from "lucide-react";

export default function TicketFilters({
  showFilters,
  setShowFilters,
  filters,
  onFilterChange,
  totalTickets,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>

        <p className="text-sm text-gray-600">Total: {totalTickets} tickets</p>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => onFilterChange("priority", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => onFilterChange("category", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
            <option value="Network">Network</option>
            <option value="Access">Access</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filters.isOverdue}
            onChange={(e) => onFilterChange("isOverdue", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Tickets</option>
            <option value="true">Overdue Only</option>
            <option value="false">Not Overdue</option>
          </select>
        </div>
      )}
    </div>
  );
}
