const TicketListHeader = ({ total }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-600 mt-1">
          {total} ticket{total !== 1 ? "s" : ""} found
        </p>
      </div>
    </div>
  );
};

export default TicketListHeader;
