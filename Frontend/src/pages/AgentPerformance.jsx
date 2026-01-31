// src/pages/AgentPerformance.jsx
import { useGetAgentPerformanceQuery } from "../features/ticketSlice/ticketApi";
import {
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Award,
  BarChart3,
} from "lucide-react";

const AgentPerformance = () => {
  const { data, isLoading, error } = useGetAgentPerformanceQuery();

  const performance = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Failed to load performance data
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Performance</h1>
        <p className="text-gray-600 mt-1">
          Monitor and analyze support agent performance metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance.reduce((sum, p) => sum + p.metrics.resolved, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance.length > 0
                  ? (
                      performance.reduce(
                        (sum, p) => sum + p.metrics.resolutionRate,
                        0,
                      ) / performance.length
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance.reduce((sum, p) => sum + p.metrics.overdue, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {performance.map((agent, index) => (
          <div
            key={agent.agentId}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {agent.agentName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {agent.agentName}
                  </h3>
                  <p className="text-sm text-gray-500">{agent.agentEmail}</p>
                </div>
              </div>
              {index === 0 && (
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {agent.metrics.totalAssigned}
                </p>
                <p className="text-xs text-gray-500">Assigned</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {agent.metrics.resolved}
                </p>
                <p className="text-xs text-gray-500">Resolved</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {agent.metrics.closed}
                </p>
                <p className="text-xs text-gray-500">Closed</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {agent.metrics.overdue}
                </p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Resolution Rate</span>
                <span className="font-medium text-gray-900">
                  {agent.metrics.resolutionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(agent.metrics.resolutionRate, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {performance.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No performance data
          </h3>
          <p className="text-gray-500 mt-1">
            Agent performance data will appear here once tickets are assigned
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentPerformance;
