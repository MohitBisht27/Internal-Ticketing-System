import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTicketMutation } from "../features/ticketSlice/ticketApi";
import CreateTicketHeader from "../components/createTicketUi/CreateTicketHeader";
import TicketAlerts from "../components/createTicketUi/TicketAlerts";
import TicketInputs from "../components/createTicketUi/TicketInputs";
import TicketAttachment from "../components/createTicketUi/TicketAttachment";
import TicketFormActions from "../components/createTicketUi/TicketFormActions";

const CreateTicket = () => {
  const navigate = useNavigate();
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    tags: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = ["Software", "Hardware", "Network", "Access", "Other"];
  const priorities = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "critical", label: "Critical", color: "text-red-600" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      submitData.append("priority", formData.priority);

      if (formData.tags) {
        const tagsArray = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        tagsArray.forEach((tag) => submitData.append("tags[]", tag));
      }

      attachments.forEach((file) => {
        submitData.append("attachments", file);
      });

      await createTicket(submitData).unwrap();
      setSuccess("Ticket created successfully!");
      setTimeout(() => navigate("/tickets"), 1500);
    } catch (err) {
      setError(
        err.data?.message || "Failed to create ticket. Please try again.",
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <CreateTicketHeader onBack={() => navigate(-1)} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <TicketAlerts error={error} success={success} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <TicketInputs
            formData={formData}
            handleChange={handleChange}
            categories={categories}
            priorities={priorities}
          />

          <TicketAttachment
            attachments={attachments}
            handleFileChange={handleFileChange}
            removeAttachment={removeAttachment}
          />

          <TicketFormActions
            isLoading={isLoading}
            onCancel={() => navigate(-1)}
          />
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
