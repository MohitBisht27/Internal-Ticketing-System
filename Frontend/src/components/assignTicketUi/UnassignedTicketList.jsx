import React from "react";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import TicketAssignmentItem from "./TicketAssignmentItem";

const UnassignedTicketList = ({
  tickets = [],
  selectedTickets = [],
  onSelectAll,
  onSelectTicket,
  agents = [],
  processingTicketId,
  onSingleAssign,
  pagination = { page: 1, pages: 1 },
  onPageChange,
  maxLoad = 5,
}) => {
  const isAllSelected =
    tickets.length > 0 && selectedTickets.length === tickets.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-20 text-center">
          <div className="bg-green-50 p-4 rounded-full mb-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1">
            No unassigned tickets pending in the queue.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {/* List Header */}
          <div className="px-5 py-3 bg-gray-50 flex items-center gap-3 border-b border-gray-200">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={onSelectAll}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Select All
            </span>
            <span className="ml-auto text-xs text-gray-400 font-medium">
              Showing {tickets.length} tickets
            </span>
          </div>

          {/* Ticket Items */}
          {tickets.map((ticket) => (
            <TicketAssignmentItem
              key={ticket._id}
              ticket={ticket}
              isSelected={selectedTickets.includes(ticket._id)}
              onSelect={onSelectTicket}
              agents={agents}
              processingTicketId={processingTicketId}
              onAssign={onSingleAssign}
              maxLoad={maxLoad}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 m-4">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="py-2 px-4 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 shadow-sm">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UnassignedTicketList;
