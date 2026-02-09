import { useState, useEffect } from "react";
import {
  useGetAllTicketsQuery,
  useAssignTicketMutation,
} from "../features/ticketSlice/ticketApi";
import { useGetAllAgentsQuery } from "../features/authSlice/authApiSlice";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import AgentWorkloadSidebar from "../components/assignTicketUi/AgentWorkloadSidebar";
import AssignHeader from "../components/assignTicketUi/AssignHeader";
import UnassignedTicketList from "../components/assignTicketUi/UnassignedTicketList";
import BulkAssignModal from "../components/assignTicketUi/BulkAssignModal";

const AssignTickets = () => {
  // --- Constants ---
  const MAX_AGENT_LOAD = 5;

  // --- State ---
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "open",
    sort: "-createdAt",
  });

  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [processingTicketId, setProcessingTicketId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });

  // --- API Hooks ---
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    refetch: refetchTickets,
  } = useGetAllTicketsQuery(filters);

  const {
    data: agents = [],
    isLoading: agentsLoading,
    refetch: refetchAgents,
  } = useGetAllAgentsQuery();

  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();

  // --- Derived Data ---
  const tickets = ticketsData?.data?.tickets || [];
  const pagination = ticketsData?.data?.pagination || {
    total: 0,
    page: 1,
    pages: 1,
  };

  const unassignedTickets = tickets.filter((ticket) => !ticket.assignedTo);

  // --- Effects ---
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Handlers ---
  const handleSelectTicket = (ticketId) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId],
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === unassignedTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(unassignedTickets.map((t) => t._id));
    }
  };

  const handleSingleAssign = async (ticketId, agentId) => {
    if (!agentId || !ticketId) return;

    try {
      setProcessingTicketId(ticketId);
      await assignTicket({ ticketId, agentId }).unwrap();

      await Promise.all([refetchTickets(), refetchAgents()]);

      setToast({ message: "Ticket assigned successfully!", type: "success" });
      setProcessingTicketId(null);
    } catch (err) {
      setToast({
        message: err?.data?.message || "Failed to assign ticket",
        type: "error",
      });
      setProcessingTicketId(null);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedAgent || selectedTickets.length === 0) return;

    try {
      const promises = selectedTickets.map((ticketId) =>
        assignTicket({ ticketId, agentId: selectedAgent }).unwrap(),
      );

      await Promise.all(promises);

      await Promise.all([refetchTickets(), refetchAgents()]);

      setToast({
        message: `${selectedTickets.length} tickets assigned successfully!`,
        type: "success",
      });
      setSelectedTickets([]);
      setSelectedAgent("");
      setShowBulkAssignModal(false);
    } catch (err) {
      refetchTickets();
      refetchAgents();

      setToast({
        message:
          err?.data?.message || "Assignment failed. Check agent workload.",
        type: "error",
      });
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // --- Render ---
  if (ticketsLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}

      {/* Page Header */}
      <AssignHeader
        selectedCount={selectedTickets.length}
        onBulkAssignClick={() => setShowBulkAssignModal(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Agents Status */}
        <div className="lg:col-span-3">
          <AgentWorkloadSidebar agents={agents} maxLoad={MAX_AGENT_LOAD} />
        </div>

        {/* Main Content: Tickets List */}
        <div className="lg:col-span-9 space-y-4">
          <UnassignedTicketList
            tickets={unassignedTickets}
            selectedTickets={selectedTickets}
            onSelectAll={handleSelectAll}
            onSelectTicket={handleSelectTicket}
            agents={agents}
            processingTicketId={processingTicketId}
            onSingleAssign={handleSingleAssign}
            pagination={pagination}
            onPageChange={handlePageChange}
            maxLoad={MAX_AGENT_LOAD}
          />
        </div>
      </div>

      {/* Bulk Assign Modal */}
      <BulkAssignModal
        isOpen={showBulkAssignModal}
        onClose={() => setShowBulkAssignModal(false)}
        selectedCount={selectedTickets.length}
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
        onConfirm={handleBulkAssign}
        isAssigning={isAssigning}
        maxLoad={MAX_AGENT_LOAD}
      />
    </div>
  );
};

export default AssignTickets;
