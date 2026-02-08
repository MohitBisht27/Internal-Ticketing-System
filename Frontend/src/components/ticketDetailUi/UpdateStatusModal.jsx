import { useState } from "react";
import { X } from "lucide-react";

const UpdateStatusModal = ({
  isOpen,
  onClose,
  onUpdate,
  availableStatuses,
  isUpdating,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedStatus) {
      onUpdate(selectedStatus);
      setSelectedStatus("");
    }
  };

  const handleClose = () => {
    setSelectedStatus("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Update Status
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block text-sm text-gray-600 mb-1.5">New Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-5"
        >
          <option value="">Select status</option>
          {availableStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replace(/-/g, " ")}
            </option>
          ))}
        </select>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedStatus || isUpdating}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
