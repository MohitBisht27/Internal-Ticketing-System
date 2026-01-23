import React from "react";

const SubmitButton = ({ isLoading, isSuccess, children }) => {
  return (
    <button
      type="submit"
      disabled={isLoading || isSuccess}
      className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? "Processing..." : isSuccess ? "Registered" : children}
    </button>
  );
};

export default SubmitButton;
