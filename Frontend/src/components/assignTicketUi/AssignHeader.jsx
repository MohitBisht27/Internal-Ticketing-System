import React from "react";
import { UserPlus } from "lucide-react";

const AssignHeader = ({ selectedCount, onBulkAssignClick }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ticket Assignment</h1>
        <p className="text-sm text-gray-500 mt-1">
          Distribute incoming tickets to available agents
        </p>
      </div>

      {selectedCount > 0 && (
        <button
          onClick={onBulkAssignClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Assign Selected ({selectedCount})
        </button>
      )}
    </div>
  );
};

export default AssignHeader;
