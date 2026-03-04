export default function LogoHeader() {
  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/bab87dc6b_GingrLogo4x.png"
        alt="Gingr"
        className="h-14 object-contain"
      />
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