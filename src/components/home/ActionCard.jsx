import { motion } from "framer-motion";

export default function ActionCard({ icon: Icon, iconBg, iconColor, title, description, buttonLabel, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, boxShadow: "0 20px 40px -8px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex flex-col gap-5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      {/* Text */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>

      {/* CTA Button */}
      <div
        className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold transition-colors"
      >
        {buttonLabel}
      </div>
    </motion.button>
  );
}