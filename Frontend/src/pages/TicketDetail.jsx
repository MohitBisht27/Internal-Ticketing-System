import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
} from "../features/ticketSlice/ticketApi";
import { useGetCurrentUserQuery } from "../features/authSlice/authApiSlice";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
  // New State for toggling comments
  const [showComments, setShowComments] = useState(true);

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
      month: "short",
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Ticket not found</h3>
          <p className="text-gray-500 mt-2 mb-6">
            The ticket you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => navigate("/tickets")}
            className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Permissions & Transitions
  const canChangeStatus = ["agent", "admin"].includes(user?.role);
  const availableStatuses = validTransitions[ticket.status] || [];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-sm">Back to Tickets</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Header (Title & Actions) */}
        <div className="mb-8">
          <TicketHeader
            ticket={ticket}
            statusColors={statusColors}
            priorityColors={priorityColors}
            canChangeStatus={canChangeStatus}
            availableStatuses={availableStatuses}
            onOpenModal={() => setShowStatusModal(true)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* --- LEFT COLUMN (Content & Conversation) --- */}
          <div className="lg:col-span-8 space-y-6">
            {/* Ticket Context Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Description & Attachments
                </h2>
              </div>
              <div className="p-6">
                <TicketDescription description={ticket.description} />
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <TicketAttachments attachments={ticket.attachments} />
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Divider with Toggle Button */}
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-200"></div>

              <button
                onClick={() => setShowComments(!showComments)}
                className="group flex-shrink-0 mx-4 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex items-center gap-2 text-slate-500 hover:text-blue-600 z-10"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-semibold">Activity</span>
                {showComments ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                )}
              </button>

              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Comments Section (Collapsible) */}
            <div
              className={`transition-all duration-300 ease-in-out ${showComments ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 h-0 overflow-hidden"}`}
            >
              <TicketComments ticketId={ticketId} />
            </div>

            {!showComments && (
              <div className="text-center">
                <button
                  onClick={() => setShowComments(true)}
                  className="text-sm text-slate-400 hover:text-blue-600 font-medium"
                >
                  Show comments to reply...
                </button>
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN (Sticky Sidebar) --- */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Meta Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
                  Ticket Info
                </h3>
                <TicketMeta ticket={ticket} formatDate={formatDate} />
              </div>

              {/* Tags Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
                  Tags
                </h3>
                <TicketTags tags={ticket.tags} />
              </div>
            </div>
          </div>
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
