import React from "react";

const AvatarUpload = ({ avatar, avatarPreview, onChange, onRemove, error }) => {
  return (
    <div className="flex flex-col items-center mb-2">
      <div className="mb-3 relative">
        {avatarPreview ? (
          <>
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors shadow-sm"
            >
              ×
            </button>
          </>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
      </div>
      <label
        htmlFor="avatar-upload"
        className="cursor-pointer bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors shadow-sm"
      >
        {avatar ? "Change Avatar" : "Upload Profile Picture"}
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={onChange}
          className="sr-only"
        />
      </label>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default AvatarUpload;
