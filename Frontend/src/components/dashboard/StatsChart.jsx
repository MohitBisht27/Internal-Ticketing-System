const StatusChart = ({ overview, getStatusCount }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tickets by Status
      </h3>

      <div className="space-y-4">
        {["open", "in-progress", "on-hold", "resolved", "closed"].map(
          (status) => {
            const count = getStatusCount(status);
            const percentage =
              overview.total > 0 ? (count / overview.total) * 100 : 0;

            const statusColors = {
              open: "bg-blue-500",
              "in-progress": "bg-yellow-500",
              "on-hold": "bg-purple-500",
              resolved: "bg-green-500",
              closed: "bg-gray-500",
            };

            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 capitalize">
                    {status.replace("-", " ")}
                  </span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${statusColors[status]} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};

export default StatusChart;
