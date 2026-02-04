import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
} from "../features/ticketSlice/ticketApi";
import { useGetCurrentUserQuery } from "../features/authSlice/authApiSlice";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

// Components
import TicketHeader from "../components/ticketDetailUi/TicketHeader";
import TicketDescription from "../components/ticketDetailUi/TicketDescription";
import TicketAttachments from "../components/ticketDetailUi/TicketAttachments";
import TicketComments from "../components/ticketDetailUi/TicketComments";
import TicketMeta from "../components/ticketDetailUi/TicketMeta";
import TicketTags from "../components/ticketDetailUi/TicketTags";
import UpdateStatusModal from "../components/ticketDetailUi/UpdateStatusModal";

const TicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  // Get User Data
  const { data: userData } = useGetCurrentUserQuery();
  const user = userData?.data || userData || {};

  const { data, isLoading, error } = useGetTicketByIdQuery(ticketId);
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateTicketStatusMutation();

  const [showStatusModal, setShowStatusModal] = useState(false);

  const ticket = data?.data;

  // Configuration Constants
  const statusColors = {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "on-hold": "bg-purple-100 text-purple-800 border-purple-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    critical: "bg-red-100 text-red-800 border-red-200",
  };

  const validTransitions = {
    open: ["in-progress"],
    "in-progress": ["on-hold", "resolved"],
    "on-hold": ["in-progress", "resolved"],
    resolved: ["closed"],
    closed: [],
  };

  // Helper Functions
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = async (selectedStatus) => {
    try {
      await updateStatus({ ticketId, status: selectedStatus }).unwrap();
      setShowStatusModal(false);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Ticket not found</h3>
        <p className="text-gray-500 mt-1">
          The ticket you're looking for doesn't exist or you don't have access.
        </p>
        <button
          onClick={() => navigate("/tickets")}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Go back to tickets
        </button>
      </div>
    );
  }

  // Permissions & Transitions
  const canChangeStatus = ["agent", "admin"].includes(user?.role);
  const availableStatuses = validTransitions[ticket.status] || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </button>

      {/* Header */}
      <TicketHeader
        ticket={ticket}
        statusColors={statusColors}
        priorityColors={priorityColors}
        canChangeStatus={canChangeStatus}
        availableStatuses={availableStatuses}
        onOpenModal={() => setShowStatusModal(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <TicketDescription description={ticket.description} />
          <TicketAttachments attachments={ticket.attachments} />
          <TicketComments comments={ticket.comments} formatDate={formatDate} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TicketMeta ticket={ticket} formatDate={formatDate} />
          <TicketTags tags={ticket.tags} />
        </div>
      </div>

      {/* Modals */}
      <UpdateStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onUpdate={handleStatusUpdate}
        availableStatuses={availableStatuses}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default TicketDetail;
