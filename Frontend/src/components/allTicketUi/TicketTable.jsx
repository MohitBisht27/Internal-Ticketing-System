import { Link } from "react-router-dom";
import {
  Loader2,
  Ticket as TicketIcon,
  AlertTriangle,
  CheckCircle,
  UserX,
} from "lucide-react";

const TicketsTable = ({
  tickets,
  isLoading,
  statusColors,
  priorityColors,
  onAssignClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <TicketIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ticket
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Created By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Assignment Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <Link
                  to={`/tickets/${ticket._id}`}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {ticket.title}
                  {ticket.isOverdue && (
                    <AlertTriangle className="inline w-4 h-4 text-red-500 ml-2" />
                  )}
                </Link>
                <p className="text-sm text-gray-500">{ticket.ticketId}</p>
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {ticket.createdBy?.fullName}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    statusColors[ticket.status]
                  }`}
                >
                  {ticket.status.replace("-", " ")}
                </span>
              </td>

              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    priorityColors[ticket.priority]
                  }`}
                >
                  {ticket.priority}
                </span>
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {ticket.assignedTo?.fullName || (
                  <span className="text-gray-400 italic">—</span>
                )}
              </td>

              <td className="px-6 py-4">
                {ticket.assignedTo ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Assigned
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-red-100 text-red-700"
                    onClick={() => onAssignClick && onAssignClick(ticket._id)}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Not Assigned
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsTable;
