const TicketDescription = ({ description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
      <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
    </div>
  );
};

export default TicketDescription;
