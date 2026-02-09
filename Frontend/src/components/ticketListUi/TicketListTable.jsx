import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { statusColors, priorityColors, formatDate } from "./utils";

const TicketListTable = ({ tickets }) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ticket
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <Link to={`/tickets/${ticket._id}`} className="block">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 hover:text-blue-600">
                      {ticket.title}
                    </p>
                    {ticket.isOverdue && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {ticket.ticketId}
                  </p>
                </Link>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                    statusColors[ticket.status]
                  }`}
                >
                  {ticket.status.replace("-", " ")}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                    priorityColors[ticket.priority]
                  }`}
                >
                  {ticket.priority}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {ticket.category}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(ticket.createdAt)}
              </td>
              <td className="px-6 py-4">
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {ticket.assignedTo.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {ticket.assignedTo.fullName}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketListTable;
