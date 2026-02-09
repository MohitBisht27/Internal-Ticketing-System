import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { statusColors, priorityColors, formatDate } from "./utils";

const TicketListMobile = ({ tickets }) => {
  return (
    <div className="md:hidden divide-y divide-gray-200">
      {tickets.map((ticket) => (
        <Link
          key={ticket._id}
          to={`/tickets/${ticket._id}`}
          className="block p-4 hover:bg-gray-50"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {ticket.title}
                </h3>
                {ticket.isOverdue && (
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{ticket.ticketId}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    statusColors[ticket.status]
                  }`}
                >
                  {ticket.status.replace("-", " ")}
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    priorityColors[ticket.priority]
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {formatDate(ticket.createdAt)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TicketListMobile;
