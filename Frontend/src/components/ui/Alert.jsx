import React from "react";

const Alert = ({ type, message }) => {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-md ${isSuccess ? "bg-green-50" : "bg-red-50"} p-3 border ${isSuccess ? "border-green-200" : "border-red-200"}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${isSuccess ? "text-green-400" : "text-red-400"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {isSuccess ? (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </div>
        <div className="ml-3">
          <p
            className={`text-sm ${isSuccess ? "text-green-800" : "text-red-800"}`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
