import { User, UserPlus, Calendar, Clock } from "lucide-react";

const TicketMeta = ({ ticket, formatDate }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Created by</p>
            <p className="text-sm font-medium text-gray-900">
              {ticket.createdBy?.fullName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserPlus className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Assigned to</p>
            <p className="text-sm font-medium text-gray-900">
              {ticket.assignedTo?.fullName || "Unassigned"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Deadline</p>
            <p
              className={`text-sm font-medium ${ticket.isOverdue ? "text-red-600" : "text-gray-900"}`}
            >
              {formatDate(ticket.deadline)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketMeta;
