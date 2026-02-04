import { AlertTriangle } from "lucide-react";
import TicketActions from "./TicketActions";

const TicketHeader = ({
  ticket,
  statusColors,
  priorityColors,
  canChangeStatus,
  availableStatuses,
  onOpenModal,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-gray-500">
              {ticket.ticketId}
            </span>
            {ticket.isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>

          <div className="flex flex-wrap gap-2 mt-4">
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                statusColors[ticket.status]
              }`}
            >
              {ticket.status.replace("-", " ")}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                priorityColors[ticket.priority]
              }`}
            >
              {ticket.priority}
            </span>
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200">
              {ticket.category}
            </span>
          </div>
        </div>

        <TicketActions
          canChangeStatus={canChangeStatus}
          availableStatuses={availableStatuses}
          assignedTo={ticket.assignedTo}
          onOpenModal={onOpenModal}
        />
      </div>
    </div>
  );
};

export default TicketHeader;
