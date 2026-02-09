import { Link } from "react-router-dom";
import { Briefcase, Clock, Loader2 } from "lucide-react";

const TicketAssignmentItem = ({
  ticket,
  isSelected,
  onSelect,
  agents,
  processingTicketId,
  onAssign,
  maxLoad = 5,
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  return (
    <div
      className={`group p-5 hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-blue-50/40" : ""
      }`}
    >
      <div className="flex gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(ticket._id)}
          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />

        <div className="flex-1 min-w-0">
          {/* Top Row: Title, ID, Priority */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <Link
                to={`/tickets/${ticket._id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
              >
                {ticket.title}
              </Link>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1.5 items-center">
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                  #{ticket.ticketId || ticket._id.slice(-6)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {ticket.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{" "}
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${getPriorityColor(
                ticket.priority,
              )}`}
            >
              {ticket.priority}
            </span>
          </div>

          {/* Bottom Row: Description & Assign Action */}
          <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <p className="text-sm text-gray-600 line-clamp-1 max-w-lg">
              {ticket.description}
            </p>

            <div className="relative min-w-[220px]">
              {processingTicketId === ticket._id ? (
                <div className="flex items-center justify-end gap-2 text-sm text-blue-600 font-medium py-1.5 px-3 bg-blue-50 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" /> Assigning...
                </div>
              ) : (
                <select
                  className="w-full text-sm py-1.5 pl-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
                  value=""
                  onChange={(e) => onAssign(ticket._id, e.target.value)}
                >
                  <option value="" disabled>
                    Assign to agent...
                  </option>
                  {agents.map((agent) => {
                    const isFull = agent.activeTicketsCount >= maxLoad;
                    return (
                      <option
                        key={agent._id}
                        value={agent._id}
                        disabled={isFull}
                        className={
                          isFull ? "text-gray-400 bg-gray-50" : "text-gray-900"
                        }
                      >
                        {agent.fullName} • {agent.activeTicketsCount} active{" "}
                        {isFull ? "(Full)" : ""}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketAssignmentItem;
