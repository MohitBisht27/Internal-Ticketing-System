// src/pages/TicketDetail.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Removed 'useSelector' as it is not needed for RTK Query hooks
import {
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
} from "../features/ticketSlice/ticketApi";

import {
  useGetCurrentUserQuery,
  useGetAllAgentsQuery,
} from "../features/authSlice/authApiSlice";
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  Paperclip,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Calendar,
  Edit3,
  UserPlus,
} from "lucide-react";

const TicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  // --- FIX START ---
  // ERROR WAS HERE: const user = useSelector(useGetCurrentUserQuery);

  // CORRECT WAY: Call the hook directly
  const { data: userData } = useGetCurrentUserQuery();
  const user = userData?.data || userData || {};
  // --- FIX END ---

  const { data, isLoading, error } = useGetTicketByIdQuery(ticketId);

  // Use optional chaining for user.role to prevent crash if user isn't loaded yet
  const { data: agentsData } = useGetAllAgentsQuery(undefined, {
    skip: user?.role !== "admin",
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateTicketStatusMutation();
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");

  const ticket = data?.data;
  const agents = agentsData?.data || [];

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

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = async () => {
    try {
      await updateStatus({ ticketId, status: selectedStatus }).unwrap();
      setShowStatusModal(false);
      setSelectedStatus("");
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAssign = async () => {
    try {
      await assignTicket({ ticketId, agentId: selectedAgent }).unwrap();
      setShowAssignModal(false);
      setSelectedAgent("");
    } catch (err) {
      console.error("Failed to assign ticket:", err);
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

  const canChangeStatus = ["agent", "admin"].includes(user?.role);
  const canAssign = user?.role === "admin";
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

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-gray-500">
                {ticket.ticketId}
              </span>
              {ticket.isOverdue && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>

            <div className="flex flex-wrap gap-2 mt-4">
              <span
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                  statusColors[ticket.status]
                }`}
              >
                {ticket.status.replace("-", " ")}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                  priorityColors[ticket.priority]
                }`}
              >
                {ticket.priority}
              </span>
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200">
                {ticket.category}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {canChangeStatus && availableStatuses.length > 0 && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Update Status
              </button>
            )}
            {canAssign && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Assign
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Attachments */}
          {ticket.attachments?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Attachments ({ticket.attachments.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ticket.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                  >
                    <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">
                      Attachment {index + 1}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({ticket.commentCount || 0})
            </h2>
            {ticket.comments?.length > 0 ? (
              <div className="space-y-4">
                {ticket.comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {comment.author?.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {comment.author?.fullName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Created by</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.createdBy?.fullName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Assigned to</p>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.assignedTo?.fullName || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p
                    className={`text-sm font-medium ${ticket.isOverdue ? "text-red-600" : "text-gray-900"}`}
                  >
                    {formatDate(ticket.deadline)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {ticket.tags?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {ticket.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Status
            </h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="">Select new status</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("-", " ")}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || isUpdating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Ticket
            </h3>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.fullName} ({agent.email})
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedAgent || isAssigning}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isAssigning ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
