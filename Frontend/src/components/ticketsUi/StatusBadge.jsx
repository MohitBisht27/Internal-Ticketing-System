const statusConfig = {
  open: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
  },
  "in-progress": {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  "on-hold": {
    bg: "bg-orange-100",
    text: "text-orange-800",
    dot: "bg-orange-500",
  },
  resolved: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  closed: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    dot: "bg-gray-500",
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {status.replace("-", " ")}
    </span>
  );
};

export default StatusBadge;
