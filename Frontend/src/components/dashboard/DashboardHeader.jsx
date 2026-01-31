import { Link } from "react-router-dom";
import { RefreshCw, Plus } from "lucide-react";

const DashboardHeader = ({ user, onUpdateOverdue, isUpdating }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.fullName ? user.fullName.split(" ")[0] : "User"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your ticket activity
        </p>
      </div>

      <div className="flex gap-3">
        {user?.role === "admin" && (
          <button
            onClick={onUpdateOverdue}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`}
            />
            Update Overdue
          </button>
        )}

        {user?.role === "employee" && (
          <Link
            to="/tickets/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </Link>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
