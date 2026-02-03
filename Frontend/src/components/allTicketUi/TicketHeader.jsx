function TicketHeader({ heading, detail }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
      <p className="text-gray-600 mt-1">{detail}</p>
    </div>
  );
}

export default TicketHeader;
