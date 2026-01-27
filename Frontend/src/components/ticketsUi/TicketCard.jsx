// src/components/tickets/TicketCard.jsx
import { Link } from "react-router-dom";
import { Clock, User, Calendar, ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

const TicketCard = ({ ticket }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = ticket.isOverdue;

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        isOverdue
          ? "border-red-200 bg-gradient-to-r from-red-50 to-white"
          : "border-gray-200"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {ticket.ticketId}
              </span>
              {isOverdue && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
                  OVERDUE
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors">
              {ticket.title}
            </h3>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {ticket.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {ticket.category}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span className="truncate max-w-[100px]">
                {ticket.createdBy?.fullName || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 ${
              isOverdue ? "text-red-600 font-medium" : ""
            }`}
          >
            <Clock size={14} />
            <span>{formatDate(ticket.deadline)}</span>
          </div>
        </div>
      </div>

      <Link
        to={`/tickets/${ticket._id}`}
        className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 text-indigo-600 font-medium text-sm rounded-b-xl hover:bg-indigo-50 transition-colors border-t border-gray-100"
      >
        View Details
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default TicketCard;
