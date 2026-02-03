const AssignTicketModal = ({
  show,
  agents,
  selectedAgent,
  setSelectedAgent,
  onClose,
  onAssign,
  isAssigning,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Assign Ticket
        </h3>

        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
        >
          <option value="">Select an agent</option>
          {agents.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.fullName}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onAssign}
            disabled={!selectedAgent || isAssigning}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAssigning ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTicketModal;
