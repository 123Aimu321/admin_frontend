// app/principal/events/loading.tsx
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles["events-loading"]}>
      {/* Stats Skeleton */}
      <div className={styles["stats-skeleton"]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`${styles["skeleton"]} ${styles["stat"]}`}
          />
        ))}
      </div>

      {/* Calendar Skeleton */}
      <div className={styles["calendar-skeleton"]}>
        <div className={`${styles["skeleton"]} ${styles["header"]}`} />

        <div className={styles["grid"]}>
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className={`${styles["skeleton"]} ${styles["day"]}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
