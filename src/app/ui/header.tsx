"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [scrollY, setScrollY] = useState(0);

  useEffect((): (() => void) => {
    const handleScroll = (): void => setScrollY(window.scrollY);

    window.addEventListener("scroll", handleScroll);
    return (): void => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerOnTop = scrollY == 0;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex w-full items-center justify-center">
      <div className="bg-background absolute top-0 h-6 w-full md:h-10" />
      <div
        className={`absolute inset-x-0 top-0 h-18 bg-black/10 lg:h-28 ${headerOnTop ? "opacity-0" : "opacity-100"} transition-opacity`}
        style={{
          maskImage:
            "linear-gradient(to bottom,rgb(0, 0, 0),rgb(0, 0, 0) 0%,rgb(0, 0, 0) 40%,rgba(0, 0, 0, 0))",
        }}
      />
      <div className="z-50 flex w-full max-w-7xl px-2 pt-2.5 md:pt-6">
        <div
          className={`w-full rounded-md border px-4 py-2.5 md:rounded-xl lg:px-8 lg:py-4 ${headerOnTop ? "border-transparent bg-transparent" : "border-white bg-white shadow-2xl/20"} transition-colors`}
        >
          <Link
            href="/"
            className="font-sans text-xl font-semibold text-emerald-500 md:text-2xl"
          >
            Tokopaedi
          </Link>
        </div>
      </div>
    </header>
  );
}
