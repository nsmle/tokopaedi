"use server";

import { getProducts, type ProductWithRelations } from "@src/lib/data";
import { recommender } from "@src/lib/recommender";

export type RecommendationProducts = (ProductWithRelations & {
  similarity: { score: number };
})[];

export async function getProductRecommendations(
  productId: number,
  { limit, cursorIndex }: { limit: number; cursorIndex?: number },
): Promise<any> {
  // Get recommendation products IDs
  let recommendationIds = await recommender.recommendations(productId);

  // Handle pagination
  recommendationIds = recommendationIds.slice(cursorIndex || 0, (cursorIndex || 0) + limit);

  // Get products data in db & map score
  let recommendations = await getProducts({ ids: recommendationIds.map((r): number => r.productId) });
  recommendations = recommendations.map((product): ProductWithRelations & { similarity: { score: number } } => {
    const rec = recommendationIds.find((r) => Number(r.productId) === Number(product.id));
    return { ...product, similarity: { score: rec?.score || 0 } };
  });

  return recommendations;
}
