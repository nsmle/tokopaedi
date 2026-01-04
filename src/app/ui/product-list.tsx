"use client";

import { ButtonLoadMore } from "@src/app/ui/load-more.button";
import { ProductCard } from "@src/app/ui/product-card";
import { getProducts, getProductsCount, type ProductWithRelations } from "@src/lib/data";
import { useState } from "react";

export function ProductList({
  initialProducts,
  storeSlug,
  disableLoadMore,
}: {
  initialProducts: ProductWithRelations[];
  storeSlug?: string;
  disableLoadMore?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadMore, setHasLoadMore] = useState<boolean>(!disableLoadMore);
  const [products, setProducts] = useState(initialProducts);

  const handleLoadMore = async (): Promise<void> => {
    setIsLoading(true);

    const moreProducts = await getProducts({ cursor: products[products.length - 1].slug, store: storeSlug });

    const mergedProducts = products
      .concat(moreProducts as unknown as ProductWithRelations[])
      .filter((product, index, self) => index === self.findIndex((p) => p.id === product.id));

    const total = await getProductsCount(storeSlug);
    if (mergedProducts.length >= total) setHasLoadMore(false);

    setProducts(mergedProducts);
    setIsLoading(false);
  };

  return (
    <div className="flex size-full flex-col">
      <div className="grid w-full grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-5 md:grid-cols-4 md:gap-x-2 md:gap-y-6 lg:grid-cols-5 lg:gap-x-3 xl:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={`product-card-${product.id}-${product.slug}`} product={product} />
        ))}
      </div>

      {hasLoadMore && !disableLoadMore && (
        <div className="mt-12 flex w-full flex-col items-center justify-center">
          <ButtonLoadMore isLoading={isLoading} onClick={(): Promise<void> => handleLoadMore()} />
        </div>
      )}
    </div>
  );
}
