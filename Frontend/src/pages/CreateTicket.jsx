import React, { useState } from "react";
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useCreateTicketMutation } from "../features/ticketSlice/ticketApi";

const CreateTicket = () => {
  const CATEGORIES = ["Software", "Hardware", "Network", "Access", "Other"];
  const PRIORITIES = ["low", "medium", "high", "critical"];
  const [createTicket] = useCreateTicketMutation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    tags: "",
  });

  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });

  // Handle Text Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Remove a selected file from the list
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });

    if (!formData.title || !formData.description || !formData.category) {
      setStatus({
        loading: false,
        error: "Title, description, and category are required.",
        success: null,
      });
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("priority", formData.priority);

    if (formData.tags) {
      formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .forEach((tag) => data.append("tags[]", tag));
    }

    files.forEach((file) => {
      data.append("attachments", file);
    });

    try {
      await createTicket(data).unwrap();

      setStatus({
        loading: false,
        error: null,
        success: "Ticket raised successfully!",
      });

      // reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        tags: "",
      });
      setFiles([]);
    } catch (err) {
      setStatus({
        loading: false,
        error: err?.data?.message || "Failed to create ticket",
        success: null,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-100 mt-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Raise New Ticket</h2>
        <p className="text-gray-500 text-sm">
          Please provide detailed information about your issue.
        </p>
      </div>

      {status.error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{status.error}</span>
        </div>
      )}

      {status.success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{status.success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., VPN Connection Failed"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Category & Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="" disabled>
                Select Category
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white capitalize"
            >
              {PRIORITIES.map((prio) => (
                <option key={prio} value={prio}>
                  {prio}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the issue in detail..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (Comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., vpn, network, urgent"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Upload className="mb-2" size={24} />
              <p className="text-sm">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">Images, PDF, or Logs</p>
            </div>
          </div>

          {/* File Preview List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                >
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status.loading}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition
            ${status.loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"}`}
        >
          {status.loading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Submitting...
            </>
          ) : (
            "Submit Ticket"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateTicket;
