import React from "react";
import { ArrowLeft } from "lucide-react";

const CreateTicketHeader = ({ onBack }) => {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
      <p className="text-gray-600 mt-1">
        Fill out the form below to submit a support ticket
      </p>
    </div>
  );
};

export default CreateTicketHeader;
