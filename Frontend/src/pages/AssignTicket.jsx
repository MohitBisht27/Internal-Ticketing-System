import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useGetAllTicketsQuery,
  useAssignTicketMutation,
} from "../features/ticketSlice/ticketApi";
import { useGetAllAgentsQuery } from "../features/authSlice/authApiSlice";
import {
  UserPlus,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Briefcase,
  Activity,
  Clock,
  X,
} from "lucide-react";

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
  // ✅ FIX 1: Extract 'refetch' from ticket query
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    refetch: refetchTickets,
  } = useGetAllTicketsQuery(filters);

  // ✅ FIX 2: Extract 'refetch' from agents query
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

      // ✅ FIX 3: Manually refresh data after assignment
      await Promise.all([
        refetchTickets(), // Refreshes the ticket list
        refetchAgents(), // Refreshes the agent workload counts
      ]);

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

      // ✅ FIX 4: Refresh data after bulk assignment
      await Promise.all([refetchTickets(), refetchAgents()]);

      setToast({
        message: `${selectedTickets.length} tickets assigned successfully!`,
        type: "success",
      });
      setSelectedTickets([]);
      setSelectedAgent("");
      setShowBulkAssignModal(false);
    } catch (err) {
      // Even if some fail, we should refresh to show the current state
      refetchTickets();
      refetchAgents();

      setToast({
        message:
          err?.data?.message || "Assignment failed. Check agent workload.",
        type: "error",
      });
    }
  };

  // --- Helper: Get Load Color ---
  const getLoadColor = (count) => {
    if (count >= MAX_AGENT_LOAD)
      return "bg-red-100 text-red-700 ring-red-600/20";
    if (count >= MAX_AGENT_LOAD - 2)
      return "bg-yellow-100 text-yellow-700 ring-yellow-600/20";
    return "bg-green-100 text-green-700 ring-green-600/20";
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ticket Assignment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Distribute incoming tickets to available agents
          </p>
        </div>

        {selectedTickets.length > 0 && (
          <button
            onClick={() => setShowBulkAssignModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Assign Selected ({selectedTickets.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Agents Status */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Agent Workload
            </h2>

            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {agents.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No agents found.</p>
              ) : (
                agents.map((agent) => (
                  <div
                    key={agent._id}
                    className="group flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                        {agent.fullName?.charAt(0).toUpperCase()}
                      </div>
                      {/* Status Dot */}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          agent.activeTicketsCount >= MAX_AGENT_LOAD
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      ></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {agent.fullName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ring-1 ring-inset ${getLoadColor(agent.activeTicketsCount)}`}
                        >
                          {agent.activeTicketsCount} / {MAX_AGENT_LOAD} Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content: Tickets List */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
            {unassignedTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="bg-green-50 p-4 rounded-full mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  All caught up!
                </h3>
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
                    checked={
                      selectedTickets.length === unassignedTickets.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Select All
                  </span>
                  <span className="ml-auto text-xs text-gray-400 font-medium">
                    Showing {unassignedTickets.length} tickets
                  </span>
                </div>

                {/* Ticket Items */}
                {unassignedTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`group p-5 hover:bg-gray-50 transition-colors ${selectedTickets.includes(ticket._id) ? "bg-blue-50/40" : ""}`}
                  >
                    <div className="flex gap-4">
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket._id)}
                        onChange={() => handleSelectTicket(ticket._id)}
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
                                <Briefcase className="w-3 h-3" />{" "}
                                {ticket.category}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />{" "}
                                {new Date(
                                  ticket.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${getPriorityColor(ticket.priority)}`}
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
                                <Loader2 className="w-4 h-4 animate-spin" />{" "}
                                Assigning...
                              </div>
                            ) : (
                              <select
                                className="w-full text-sm py-1.5 pl-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
                                value=""
                                onChange={(e) =>
                                  handleSingleAssign(ticket._id, e.target.value)
                                }
                              >
                                <option value="" disabled>
                                  Assign to agent...
                                </option>
                                {agents.map((agent) => {
                                  const isFull =
                                    agent.activeTicketsCount >= MAX_AGENT_LOAD;
                                  return (
                                    <option
                                      key={agent._id}
                                      value={agent._id}
                                      disabled={isFull}
                                      className={
                                        isFull
                                          ? "text-gray-400 bg-gray-50"
                                          : "text-gray-900"
                                      }
                                    >
                                      {agent.fullName} •{" "}
                                      {agent.activeTicketsCount} active{" "}
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
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="py-2 px-4 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 shadow-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBulkAssignModal(false)}
          />

          <div className="relative bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Bulk Assignment</h3>
              <button
                onClick={() => setShowBulkAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-start gap-2">
                <Activity className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  You are about to assign{" "}
                  <strong>{selectedTickets.length}</strong> tickets. Agents with
                  insufficient capacity are disabled.
                </p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Choose an agent...</option>
                {agents.map((a) => {
                  const isFull = a.activeTicketsCount >= MAX_AGENT_LOAD;
                  return (
                    <option
                      key={a._id}
                      value={a._id}
                      disabled={isFull}
                      className={isFull ? "text-gray-400 bg-gray-50" : ""}
                    >
                      {a.fullName} — {a.activeTicketsCount} active tickets{" "}
                      {isFull ? "(Capacity Reached)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowBulkAssignModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={!selectedAgent || isAssigning}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex justify-center items-center gap-2 transition-colors"
              >
                {isAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignTickets;
