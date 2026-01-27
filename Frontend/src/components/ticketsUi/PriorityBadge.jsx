import { AlertCircle, AlertTriangle, Minus, ArrowDown } from "lucide-react";

const priorityConfig = {
  critical: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    icon: AlertCircle,
  },
  high: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: AlertTriangle,
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
    icon: Minus,
  },
  low: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    icon: ArrowDown,
  },
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon size={12} />
      {priority}
    </span>
  );
};

export default PriorityBadge;
