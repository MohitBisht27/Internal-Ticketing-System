import { useState } from "react";
import {
  useGetAllTicketsQuery,
  useAssignTicketMutation,
} from "../features/ticketSlice/ticketApi";
import { useGetAllAgentsQuery } from "../features/authSlice/authApiSlice";

import TicketHeader from "../components/allTicketUi/TicketHeader";
import TicketFilters from "../components/allTicketUi/TicketFilters";
import TicketsTable from "../components/allTicketUi/TicketTable";
import TicketsPagination from "../components/allTicketUi/TicketsPagination";
import AssignTicketModal from "../components/allTicketUi/AssignTicketModel";

const AllTickets = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    priority: "",
    category: "",
    isOverdue: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [assignModal, setAssignModal] = useState({
    show: false,
    ticketId: null,
  });
  const [selectedAgent, setSelectedAgent] = useState("");

  const { data, isLoading, refetch } = useGetAllTicketsQuery(filters);
  const { data: agentsData } = useGetAllAgentsQuery();
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();

  const tickets = data?.data?.tickets || [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, pages: 1 };
  const agents = agentsData?.data || [];

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleOpenAssignModal = (ticketId) => {
    setAssignModal({ show: true, ticketId });
  };

  const handleCloseAssignModal = () => {
    setAssignModal({ show: false, ticketId: null });
  };

  const handleAssign = async () => {
    try {
      await assignTicket({
        ticketId: assignModal.ticketId,
        agentId: selectedAgent,
      }).unwrap();

      // Refetch tickets to update the UI
      await refetch();

      setAssignModal({ show: false, ticketId: null });
      setSelectedAgent("");
    } catch (err) {
      console.error("Failed to assign ticket:", err);
    }
  };

  const statusColors = {
    open: "bg-blue-100 text-blue-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    "on-hold": "bg-purple-100 text-purple-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <TicketHeader
        heading="All Tickets"
        detail="Manage and assign all tickets in the system"
      />

      {/* Filters */}
      <TicketFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        totalTickets={pagination.total}
      />

      {/* Table + Pagination container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <TicketsTable
          tickets={tickets}
          isLoading={isLoading}
          statusColors={statusColors}
          priorityColors={priorityColors}
          onAssignClick={handleOpenAssignModal}
        />

        {pagination.pages > 1 && (
          <TicketsPagination pagination={pagination} setFilters={setFilters} />
        )}
      </div>

      {/* Assign Modal */}
      <AssignTicketModal
        show={assignModal.show}
        agents={agents}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        onClose={handleCloseAssignModal}
        onAssign={handleAssign}
        isAssigning={isAssigning}
      />
    </div>
  );
};

export default AllTickets;
