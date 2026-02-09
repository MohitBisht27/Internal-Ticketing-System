import React from "react";
import { X, Activity, Loader2 } from "lucide-react";

const BulkAssignModal = ({
  isOpen,
  onClose,
  selectedCount,
  agents = [],
  selectedAgent,
  onSelectAgent,
  onConfirm,
  isAssigning,
  maxLoad = 5,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Bulk Assignment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-start gap-2">
            <Activity className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              You are about to assign <strong>{selectedCount}</strong> tickets.
              Agents with insufficient capacity are disabled.
            </p>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Agent
          </label>
          <select
            value={selectedAgent}
            onChange={(e) => onSelectAgent(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Choose an agent...</option>
            {agents.map((a) => {
              const isFull = a.activeTicketsCount >= maxLoad;
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
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedAgent || isAssigning}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex justify-center items-center gap-2 transition-colors"
          >
            {isAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignModal;
