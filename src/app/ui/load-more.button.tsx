"use client";

import { useEffect, useRef } from "react";

export function ButtonLoadMore({
  onClick,
  isLoading,
}: {
  isLoading: boolean;
  onClick: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoading) onClick();
        });
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    const currentButton = buttonRef.current;
    if (currentButton) observer.observe(currentButton);

    return () => {
      if (currentButton) observer.unobserve(currentButton);
    };
  }, [onClick, isLoading]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={isLoading}
      className="text-background col-span-6 flex cursor-pointer flex-row items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-2.5 font-sans text-sm font-semibold shadow-lg transition-all duration-300 hover:bg-emerald-500 hover:shadow-2xl hover:shadow-blue-950/40 active:scale-95"
    >
      {isLoading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin text-white"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
          >
            <path
              d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-70"
            />
            <path
              d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-100"
            />
          </svg>
          Memuat
        </>
      ) : (
        "Muat Lebih Banyak"
      )}
    </button>
  );
}
