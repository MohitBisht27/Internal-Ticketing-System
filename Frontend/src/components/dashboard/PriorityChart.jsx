const PriorityChart = ({ priorityColors, getPriorityCount }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tickets by Priority
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {["critical", "high", "medium", "low"].map((priority) => (
          <div
            key={priority}
            className={`p-4 rounded-lg border ${priorityColors[priority]}`}
          >
            <p className="text-sm font-medium capitalize">{priority}</p>
            <p className="text-2xl font-bold mt-1">
              {getPriorityCount(priority)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityChart;
