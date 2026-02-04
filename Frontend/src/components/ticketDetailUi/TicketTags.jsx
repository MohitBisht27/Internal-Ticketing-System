import { Tag } from "lucide-react";

const TicketTags = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5" />
        Tags
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TicketTags;
