export default function LogoHeader() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo — replace the <img> src with your real logo asset when available */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xl tracking-tight">G</span>
      </div>
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Gingr Compliance Hub
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Choose what you want to do next.
        </p>
      </div>
    </div>
  );
}