import { Link } from "react-router-dom";
import { Ticket, ArrowRight, Plus, TrendingUp } from "lucide-react";

const QuickActions = ({ user }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/tickets"
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Ticket className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">View All Tickets</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        {user?.role === "employee" && (
          <Link
            to="/tickets/create"
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">
                Create New Ticket
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </Link>
        )}

        {user?.role === "admin" && (
          <>
            <Link
              to="/admin/tickets"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">
                  Manage All Tickets
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </Link>

            <Link
              to="/admin/performance"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">
                  Agent Performance
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickActions;
