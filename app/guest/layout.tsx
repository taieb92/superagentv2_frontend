export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#111827] font-sans">
      {children}
    </div>
  );
}
