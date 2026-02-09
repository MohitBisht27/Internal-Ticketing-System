import { Users } from "lucide-react";

const AgentWorkloadSidebar = ({ agents = [], maxLoad = 5 }) => {
  const getLoadColor = (count) => {
    if (count >= maxLoad) return "bg-red-100 text-red-700 ring-red-600/20";
    if (count >= maxLoad - 2)
      return "bg-yellow-100 text-yellow-700 ring-yellow-600/20";
    return "bg-green-100 text-green-700 ring-green-600/20";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" /> Agent Workload
      </h2>

      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
        {agents.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No agents found.</p>
        ) : (
          agents.map((agent) => (
            <div
              key={agent._id}
              className="group flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                  {agent.fullName?.charAt(0).toUpperCase()}
                </div>
                {/* Status Dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    agent.activeTicketsCount >= maxLoad
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                ></span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {agent.fullName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ring-1 ring-inset ${getLoadColor(
                      agent.activeTicketsCount,
                    )}`}
                  >
                    {agent.activeTicketsCount} / {maxLoad} Active
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentWorkloadSidebar;
