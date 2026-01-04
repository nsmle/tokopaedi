"use client";

import { ImageDrawer } from "@src/app/ui/image-drawer";
import type { getProductBySlug } from "@src/lib/data";
import { discountedPrice, humanizeNumber } from "@src/util/format.util";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function ProductDetail({
  product,
}: {
  product: Awaited<ReturnType<typeof getProductBySlug>>;
}) {
  const [selectedPreviewImageIndex, setSelectedPreviewImageIndex] = useState(0);

  return (
    <div className="flex w-full flex-col justify-center">
      {/* Product Detail */}
      <div className="flex w-full flex-col gap-y-8 pb-12 lg:flex-row">
        {/* Product Image */}
        <div className="w-full self-start lg:sticky lg:top-32 lg:w-1/3">
          <div className="relative isolate w-full overflow-hidden rounded-xl bg-slate-200 shadow-2xl">
            <Image
              src={`/images/${product?.images?.[selectedPreviewImageIndex]?.url}`}
              alt=""
              className="size-full rounded-xl object-cover"
              width={4096}
              height={4096}
              placeholder="blur"
              blurDataURL={`/_next/image?url=${encodeURIComponent(`/images/${product?.images?.[selectedPreviewImageIndex]?.url}`)}&w=32&q=5`}
            />
          </div>

          <ImageDrawer
            images={product?.images || []}
            selectedImageIndex={selectedPreviewImageIndex}
            setSelectedImage={setSelectedPreviewImageIndex}
          />
        </div>

        {/* Product Title & Description */}
        <div className="w-full lg:w-2/3">
          <div className="h-full w-full lg:pl-12">
            <div className="sticky top-20 isolate w-full self-start md:top-32">
              <div className="bg-background absolute -top-6 h-14 w-full lg:-top-32 lg:h-32" />

              <div
                className="bg-background flex w-full flex-col pt-2 pb-16"
                style={{
                  maskImage:
                    "linear-gradient(to bottom,rgb(0, 0, 0),rgb(0, 0, 0) 0%,rgb(0, 0, 0) 70%,rgba(0, 0, 0, 0))",
                }}
              >
                <h1 className="font-sans text-lg leading-tight font-bold lg:text-xl">
                  {product?.name}
                </h1>
                <div className="my-0.5 flex w-full flex-row items-center gap-2 sm:gap-4">
                  <p className="inline-block text-sm font-medium text-nowrap text-gray-500">
                    <span className="text-gray-700">Terjual</span>{" "}
                    {humanizeNumber(product?.statistic?.sold)}
                  </p>
                  <span className="text-gray-400">•</span>
                  <div className="flex flex-row items-center gap-1">
                    <Image
                      src="/stars.svg"
                      alt=""
                      className="size-4"
                      width={192}
                      height={192}
                    />
                    <p className="inline-block text-sm font-medium text-nowrap text-gray-500">
                      {product?.statistic?.rating}{" "}
                      <span className="text-gray-700">Rating</span>
                    </p>
                  </div>
                  <span className="text-gray-400">•</span>
                  <p className="inline-block text-sm font-medium text-nowrap text-gray-500">
                    {humanizeNumber(product?.statistic?.review, 2)}{" "}
                    <span className="text-gray-700">Review</span>
                  </p>
                </div>
                <div className="mt-1 flex w-full flex-row items-center justify-between gap-1 lg:gap-8">
                  <div className="flex w-full flex-row items-center justify-between">
                    <h2 className="font-sans text-lg leading-tight font-bold lg:text-3xl">
                      {discountedPrice(
                        product?.price,
                        product?.discount?.percentage,
                      ).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      })}
                    </h2>

                    {product?.discount?.percentage && (
                      <div className="flex flex-row items-center gap-0.5 lg:gap-2">
                        <p className="inline items-center justify-center rounded-sm bg-rose-200 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-rose-600 sm:text-xs">
                          {`${product.discount.percentage}%`}
                        </p>
                        <h4 className="font-sans text-sm leading-tight font-semibold text-slate-500/90 line-through lg:text-xl">
                          {product?.price.toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          })}
                        </h4>
                      </div>
                    )}
                  </div>

                  <button className="w-auto cursor-pointer rounded-md bg-emerald-500 px-4 py-1.5 text-center font-sans text-xs font-semibold text-nowrap text-white shadow-md hover:bg-emerald-600 lg:text-base">
                    Beli<span className="hidden sm:inline">{" Sekarang"}</span>
                  </button>
                </div>
              </div>
            </div>

            <hr className="-mt-6 mb-6 border-gray-300 md:-mt-4" />

            <div className="flex w-full flex-col gap-0.5">
              <p className="inline-block text-sm font-medium text-nowrap text-gray-500">
                Kondisi:{" "}
                <span className="text-gray-700">
                  {product?.condition === "New" ? "Baru" : product?.condition}
                </span>
              </p>
              <p className="inline-block text-sm font-medium text-nowrap text-gray-500">
                Berat:{" "}
                <span className="text-gray-700">
                  {product?.weight} {product?.weightUnit}
                </span>
              </p>
              {product?.minOrder !== 1 && (
                <p className="inline-block text-sm font-medium text-nowrap text-gray-500">
                  Min. Pemesanan:{" "}
                  <span className="text-gray-700">{product?.minOrder}</span>
                </p>
              )}
              {product?.maxOrder !== 1 && (
                <p className="inline-block text-sm font-medium text-nowrap text-gray-500">
                  Max. Pemesanan:{" "}
                  <span className="text-gray-700">{product?.maxOrder}</span>
                </p>
              )}
              <p className="inline-block text-sm font-medium text-nowrap text-gray-500">
                Category:{" "}
                <Link
                  href={product?.category.url || "/"}
                  target="_blank"
                  className="text-emerald-600 hover:text-emerald-500"
                >
                  {product?.category.name}
                </Link>
              </p>
            </div>

            <hr className="my-6 border-gray-300" />

            <div className="flex w-full flex-row items-center rounded-md bg-white px-4 py-2.5 shadow-2xl/5 transition-all duration-300 hover:shadow-2xl/20">
              <div className="flex w-full flex-col">
                <p className="font-sans text-[16px] font-semibold text-wrap wrap-anywhere whitespace-pre-line text-gray-700/90">
                  {product?.store.name}{" "}
                  <span className="ml-0.5 text-xs text-gray-500/80">
                    @{product?.store.slug}
                  </span>
                </p>
                <p className="font-sans text-sm font-medium text-wrap wrap-anywhere whitespace-pre-line text-gray-600">
                  {product?.store.city}
                </p>
              </div>

              <Link
                href={`/${product?.store.slug}`}
                className="w-auto cursor-pointer rounded-md border border-gray-400/80 bg-transparent py-1.5 text-center font-sans text-xs font-semibold text-gray-600 shadow-2xl hover:border-emerald-600/80 hover:bg-emerald-50 hover:text-emerald-700 lg:px-4 lg:text-sm lg:text-nowrap"
              >
                Lihat Toko
              </Link>
            </div>

            {product?.description?.trim() && (
              <hr className="my-6 border-gray-300" />
            )}

            <p className="font-sans text-sm font-medium text-wrap wrap-anywhere whitespace-pre-line text-gray-700">
              {product?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Recomender */}
      <div className="sticky top-32 w-full self-start bg-orange-400 py-4">
        <div className="min-h-[5000px] w-full bg-yellow-400"></div>
      </div>
    </div>
  );
}
