import { Edit3, CheckCircle, UserX } from "lucide-react";

const TicketActions = ({
  canChangeStatus,
  availableStatuses,
  assignedTo,
  onOpenModal,
}) => {
  return (
    <div className="flex flex-col sm:items-end gap-3">
      {/* Status Button (Visible to Agents & Admins) */}
      {canChangeStatus && availableStatuses.length > 0 && (
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Edit3 className="w-4 h-4" />
          Update Status
        </button>
      )}

      {/* Read-Only Assigned Status */}
      {assignedTo ? (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium whitespace-nowrap">
          <CheckCircle className="w-4 h-4" />
          Assigned: {assignedTo.fullName}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 text-sm font-medium whitespace-nowrap">
          <UserX className="w-4 h-4" />
          Not Assigned
        </div>
      )}
    </div>
  );
};

export default TicketActions;
