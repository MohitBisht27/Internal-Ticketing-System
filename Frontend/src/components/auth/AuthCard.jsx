const AuthCard = ({ icon: Icon, title, subtitle, children, maxWidth }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
      <div
        className={`w-full ${maxWidth} bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden`}
      >
        <div className="bg-emerald-600 px-8 py-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 mb-3 shadow-inner">
            <Icon className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {title}
          </h2>
          <p className="text-emerald-100 text-sm mt-1">{subtitle}</p>
        </div>

        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export default AuthCard;
