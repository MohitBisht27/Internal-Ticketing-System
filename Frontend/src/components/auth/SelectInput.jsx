import { ChevronDown } from "lucide-react";

const SelectInput = ({ icon: Icon, children, ...props }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Icon size={18} />
      </div>

      <select
        {...props}
        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-600 text-sm appearance-none cursor-pointer"
      >
        {children}
      </select>

      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
        <ChevronDown size={16} />
      </div>
    </div>
  );
};

export default SelectInput;
