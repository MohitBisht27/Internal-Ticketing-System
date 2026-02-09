import { ChevronLeft, ChevronRight } from "lucide-react";

const TicketListPagination = ({ pagination, onPageChange, limit }) => {
  if (pagination.pages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        Showing {(pagination.page - 1) * limit + 1} to{" "}
        {Math.min(pagination.page * limit, pagination.total)} of{" "}
        {pagination.total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPrevPage}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-600">
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TicketListPagination;
