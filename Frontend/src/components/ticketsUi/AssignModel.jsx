import { useState } from "react";
import { X, UserPlus, Loader2, AlertCircle } from "lucide-react";
import {
  useGetAgentsQuery,
  useAssignTicketMutation,
} from "../../features/tickets/ticketApi";

const AssignModal = ({ ticket, onClose }) => {
  const [selectedAgent, setSelectedAgent] = useState(
    ticket.assignedTo?._id || "",
  );
  const [error, setError] = useState("");

  const { data: agents, isLoading: loadingAgents } = useGetAgentsQuery();
  const [assignTicket, { isLoading: assigning }] = useAssignTicketMutation();

  const handleAssign = async () => {
    if (!selectedAgent) {
      setError("Please select an agent");
      return;
    }

    try {
      await assignTicket({
        ticketId: ticket._id,
        agentId: selectedAgent,
      }).unwrap();
      onClose();
    } catch (err) {
      setError(err?.data?.message || "Failed to assign ticket");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserPlus size={20} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {ticket.assignedTo ? "Reassign Ticket" : "Assign Ticket"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">
              Ticket:{" "}
              <span className="font-mono font-medium">{ticket.ticketId}</span>
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {ticket.title}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {loadingAgents ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => {
                  setSelectedAgent(e.target.value);
                  setError("");
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">Choose an agent...</option>
                {agents?.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.fullName} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedAgent || assigning}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
          >
            {assigning ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Ticket"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;
