export default function DashboardLoading() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-48 animate-pulse rounded-[36px] bg-white/60" />
        <div className="h-28 animate-pulse rounded-[30px] bg-white/60" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-96 animate-pulse rounded-[30px] bg-white/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
