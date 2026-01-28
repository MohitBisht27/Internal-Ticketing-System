import { Loader2 } from "lucide-react";

const SubmitButton = ({ loading, text, loadingText }) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm tracking-wide shadow-lg
                 hover:bg-slate-800 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default SubmitButton;
