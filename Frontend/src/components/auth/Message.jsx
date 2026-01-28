const Message = ({ icon: Icon, text, type }) => {
  const styles =
    type === "error"
      ? "bg-red-50 border-red-100 text-red-600"
      : "bg-emerald-50 border-emerald-100 text-emerald-600";

  return (
    <div className={`flex gap-2 p-3 rounded-lg border text-sm ${styles}`}>
      <Icon size={16} />
      <p>{text}</p>
    </div>
  );
};

export default Message;
