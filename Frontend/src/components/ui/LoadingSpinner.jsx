import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = "default", text = "Loading..." }) => {
  const sizeClasses = {
    small: "h-32",
    default: "h-64",
    large: "h-96",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${sizeClasses[size]}`}
    >
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
      <p className="text-gray-500 font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
