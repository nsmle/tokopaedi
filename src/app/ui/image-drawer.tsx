import Image from "next/image";
import { useRef } from "react";

export function ImageDrawer({
  images,
  selectedImageIndex,
  setSelectedImage,
}: {
  images: { id: string; url: string }[];
  selectedImageIndex: number;
  setSelectedImage: (index: number) => void;
}) {
  const imagesContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollClick = (type: "prev" | "next"): void => {
    imagesContainerRef.current?.scrollBy({
      left: type === "next" ? 200 : -200,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative z-10 w-full lg:mt-4">
      <div
        ref={imagesContainerRef}
        className="horizontal-scrollbar flex w-full gap-x-1.5 overflow-x-auto px-1 pt-3.5 pb-2"
      >
        {images.map((image, index) => (
          <button
            key={`drawer-${image.id}-${image.url}`}
            type="button"
            className={`relative isolate size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-slate-300/80 transition-all duration-300 md:size-20 ${
              selectedImageIndex === index
                ? "border-2 border-emerald-400 shadow-xs brightness-125"
                : "border border-gray-400 brightness-70 hover:border-blue-500 hover:shadow-2xl"
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={`/images/${image.url}`}
              alt=""
              className={`size-full rounded-lg object-cover`}
              width={80}
              height={80}
              placeholder="blur"
              blurDataURL={`/_next/image?url=${encodeURIComponent(`/images/${image.url}`)}&w=32&q=5`}
            />
          </button>
        ))}
      </div>

      {images.length > 4 && (
        <>
          {/* Drawer prev  */}

          <button
            type="button"
            className="absolute top-1/2 left-1 z-30 flex -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-md bg-emerald-300/40 p-1.5 text-white shadow-lg backdrop-blur-xs hover:bg-emerald-400/50"
            onClick={(): void => handleScrollClick("prev")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={4}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          {/* Drawer next */}

          <button
            type="button"
            className="absolute top-1/2 right-1 z-30 flex -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-md bg-emerald-300/40 p-1.5 text-white shadow-lg backdrop-blur-xs hover:bg-emerald-400/50"
            onClick={(): void => handleScrollClick("next")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={4}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
