export default function AdminLoading() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-28 animate-pulse rounded-[36px] bg-white/60" />
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <div className="h-96 animate-pulse rounded-[34px] bg-white/60" />
          <div className="space-y-6">
            <div className="h-48 animate-pulse rounded-[30px] bg-white/60" />
            <div className="h-80 animate-pulse rounded-[30px] bg-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
