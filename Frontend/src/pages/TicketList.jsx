// src/pages/TicketList.jsx
import { useState } from "react";
import { useGetTicketsQuery } from "../features/ticketSlice/ticketApi";
import { Loader2, Ticket } from "lucide-react";

import TicketListHeader from "../components/ticketListUi/TicketListHeader";
import TicketListFilters from "../components/ticketListUi/TicketListFilters";
import TicketListTable from "../components/ticketListUi/TicketListTable";
import TicketListMobile from "../components/ticketListUi/TicketListMobile";
import TicketListPagination from "../components/ticketListUi/TicketListPagination";

const TicketList = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    priority: "",
    category: "",
    isOverdue: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useGetTicketsQuery(filters);

  const tickets = data?.data?.tickets || [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, pages: 1 };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      status: "",
      priority: "",
      category: "",
      isOverdue: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const hasActiveFilters =
    filters.status || filters.priority || filters.category || filters.isOverdue;

  return (
    <div className="space-y-6">
      <TicketListHeader total={pagination.total} />

      <TicketListFilters
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No tickets found
            </h3>
            <p className="text-gray-500 mt-1">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Create a new ticket to get started"}
            </p>
          </div>
        ) : (
          <>
            <TicketListTable tickets={tickets} />
            <TicketListMobile tickets={tickets} />
          </>
        )}

        <TicketListPagination
          pagination={pagination}
          limit={filters.limit}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default TicketList;
