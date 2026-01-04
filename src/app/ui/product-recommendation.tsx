import { ButtonLoadMore } from "@src/app/ui/load-more.button";
import { ProductCard } from "@src/app/ui/product-card";
import { getProductRecommendations } from "@src/app/ui/recommendations";
import { getProductsCount, type ProductWithRelations } from "@src/lib/data";
import { useEffect, useState } from "react";

export function ProductRecommendation({ product }: { product: ProductWithRelations }) {
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadMore, setHasLoadMore] = useState<boolean>(true);
  const [cursorIndex, setCursorIndex] = useState<number>(Number(0));
  const [recommendations, setRecommendations] = useState<ProductWithRelations[]>([]);

  const handleLoadMore = async () => {
    setIsLoading(true);

    const moreRecommendations = await getProductRecommendations(Number(product.id), {
      cursorIndex: cursorIndex,
      limit: 24,
    });

    const recommendationProducts = recommendations
      .concat(moreRecommendations as unknown as ProductWithRelations[])
      .filter((prod, index, self) => index === self.findIndex((p) => p.id === prod.id));

    const total = await getProductsCount();
    if (recommendationProducts.length >= total) setHasLoadMore(false);

    setCursorIndex(recommendationProducts.length);
    setRecommendations(recommendationProducts);
    setIsLoading(false);
  };

  useEffect(() => {
    (async () => {
      if (!firstLoad || recommendations.length) return;
      setFirstLoad(false);
      setIsLoading(true);

      const initialRecommendations = await getProductRecommendations(Number(product.id), {
        cursorIndex: cursorIndex,
        limit: 24,
      });

      setCursorIndex(initialRecommendations.length);
      setRecommendations(initialRecommendations);
      setIsLoading(false);
    })();
  }, [product, isLoading, recommendations.length, cursorIndex, firstLoad]);

  return (
    <div className="flex size-full flex-col">
      <div className="grid w-full grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-3 md:grid-cols-4 md:gap-x-2 md:gap-y-6 lg:grid-cols-5 lg:gap-x-3 xl:grid-cols-6">
        {recommendations.map((product) => (
          <ProductCard key={`product-card-${product.id}-${product.slug}`} product={product} />
        ))}
      </div>

      {hasLoadMore && (
        <div className="mt-12 flex w-full flex-col items-center justify-center">
          <ButtonLoadMore isLoading={isLoading} onClick={(): Promise<void> => handleLoadMore()} />
        </div>
      )}
    </div>
  );
}
