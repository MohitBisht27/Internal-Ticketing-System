import { Image as ImageIcon, UploadCloud } from "lucide-react";

const FileUpload = ({ file, onChange, inputRef }) => {
  return (
    <div className="relative group">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
        id="avatar"
      />

      <label
        htmlFor="avatar"
        className={`flex items-center justify-center w-full px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all
        ${
          file
            ? "border-emerald-500 bg-emerald-50/50"
            : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
        }`}
      >
        {file ? (
          <div className="text-center">
            <ImageIcon className="mx-auto text-emerald-600" />
            <p className="text-sm text-emerald-700 truncate max-w-[200px]">
              {file.name}
            </p>
          </div>
        ) : (
          <div className="text-center text-slate-500">
            <UploadCloud className="mx-auto mb-1" />
            Click to upload profile picture{" "}
            <span className="text-red-500">*</span>
          </div>
        )}
      </label>
    </div>
  );
};

export default FileUpload;
