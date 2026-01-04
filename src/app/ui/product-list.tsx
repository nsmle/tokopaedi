"use client";

import type { Prisma } from "@prisma/client";
import { ButtonLoadMore } from "@src/app/ui/load-more.button";
import { getProducts, getProductsCount } from "@src/lib/data";
import { discountedPrice, humanizeNumber } from "@src/util/format.util";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { store: true; discount: true; statistic: true };
}>;

export function ProductList({
  initialProducts,
  storeSlug,
}: {
  initialProducts: ProductWithRelations[];
  storeSlug?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadMore, setHasLoadMore] = useState<boolean>(true);
  const [products, setProducts] = useState(initialProducts);

  const handleLoadMore = async (): Promise<void> => {
    setIsLoading(true);

    const moreProducts = await getProducts(
      products[products.length - 1].slug,
      storeSlug,
    );

    const mergedProducts = products
      .concat(moreProducts as unknown as ProductWithRelations[])
      .filter(
        (product, index, self) =>
          index === self.findIndex((p) => p.id === product.id),
      );

    const total = await getProductsCount(storeSlug);
    if (mergedProducts.length >= total) {
      setHasLoadMore(false);
    }

    setProducts(mergedProducts);
    setIsLoading(false);
  };

  return (
    <div className="flex size-full flex-col">
      <div className="grid w-full grid-cols-2 gap-x-2 gap-y-8 md:grid-cols-3 md:gap-x-2 md:gap-y-6 lg:grid-cols-6 lg:gap-x-3">
        {products.map((product) => (
          <div
            key={`product-${product.id}-${product.slug}`}
            className="group/card overflow-hidden rounded-xl p-0.5 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-blue-950/40 md:p-1.5 lg:p-2.5"
          >
            <Link
              href={`/${product.store.slug}/${product.slug}`}
              className="w-full bg-red-400"
              shallow={true}
            >
              <div className="relative isolate mb-2 aspect-square w-full overflow-hidden rounded bg-slate-100">
                {product.discount?.percentage && (
                  <span className="rounded-tb absolute top-0 left-0 rounded-br-xl bg-rose-500 px-2.5 py-1 font-sans text-[10px] font-bold text-white shadow-2xl group-hover/card:bg-rose-600 md:text-xs">
                    Diskon {product.discount?.percentage}%
                  </span>
                )}
                <Image
                  src={`/thumbnails/${product.thumbnail}`}
                  alt=""
                  className="size-full rounded object-cover"
                  width={400}
                  height={400}
                  placeholder="blur"
                  blurDataURL={`/_next/image?url=${encodeURIComponent(`/thumbnails/${product.thumbnail}`)}&w=32&q=5`}
                />
              </div>
              <div className="pb-0.5 transition-all duration-300 md:pb-1.5">
                <h2 className="group-hover/card:text-foreground mb-0.5 truncate font-sans text-sm font-normal text-black/95">
                  {product.name}
                </h2>
                <h3 className="text-foreground/90 group-hover/card:text-foreground mb-0.5 font-sans text-sm font-bold lg:text-[15px]">
                  {discountedPrice(
                    product.price,
                    product.discount?.percentage,
                  ).toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  })}
                </h3>
                <div className="mb-0.5 flex w-full flex-row items-center gap-2">
                  <div className="flex flex-row items-center gap-1">
                    <Image
                      src="/stars.svg"
                      alt=""
                      priority={true}
                      className="size-4"
                      width={192}
                      height={192}
                    />
                    <span className="inline-block text-[12px] font-medium text-gray-500">
                      {product.statistic?.rating}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="inline-block text-[12px] font-medium text-nowrap text-gray-500">
                    {humanizeNumber(product.statistic?.sold)} terjual
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href={`/${product.store.slug}`}
              className="block truncate text-xs font-medium text-gray-600 transition-all duration-300 group-hover/card:text-gray-700"
            >
              <span className="hidden truncate text-emerald-600 transition-all duration-300 group-hover/card:block">
                {product.store.name}
              </span>
              <span className="block truncate transition-all duration-300 group-hover/card:hidden">
                {product.store.city}
              </span>
            </Link>
          </div>
        ))}
      </div>

      {hasLoadMore && (
        <div className="mt-12 flex w-full flex-col items-center justify-center">
          <ButtonLoadMore
            isLoading={isLoading}
            onClick={(): Promise<void> => handleLoadMore()}
          />
        </div>
      )}
    </div>
  );
}
