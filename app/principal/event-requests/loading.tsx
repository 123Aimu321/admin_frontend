// app/principal/event-requests/loading.tsx
export default function Loading() {
  return (
    <div className="requests-loading">
      {/* Tabs Skeleton */}
      <div className="tabs-skeleton">
        <div className="skeleton tab" />
        <div className="skeleton tab" />
      </div>

      {/* Table Skeleton */}
      <div className="table-skeleton">
        <div className="skeleton header" />

        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton row" />
        ))}
      </div>
    </div>
  );
}
