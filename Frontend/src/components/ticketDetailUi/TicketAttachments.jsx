import { Paperclip } from "lucide-react";

const TicketAttachments = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Paperclip className="w-5 h-5" />
        Attachments ({attachments.length})
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {attachments.map((attachment, index) => (
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
  );
};

export default TicketAttachments;
