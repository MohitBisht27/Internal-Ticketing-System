import { ChevronLeft, ChevronRight } from "lucide-react";

const TicketsPagination = ({ pagination, setFilters }) => {
  const handlePrev = () => {
    setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNext = () => {
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t">
      <p className="text-sm text-gray-600">
        Page {pagination.page} of {pagination.pages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={handlePrev}
          disabled={pagination.page === 1}
          className="p-2 border rounded-lg disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          disabled={pagination.page === pagination.pages}
          className="p-2 border rounded-lg disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TicketsPagination;
