import { ProductDetail } from "@src/app/ui/product-detail";
import { getProductBySlug } from "@src/lib/data";

export default async function Page({
  params,
}: {
  params: Promise<{ store_slug: string; product_slug: string }>;
}) {
  const { store_slug, product_slug } = await params;
  const product = await getProductBySlug(store_slug, product_slug);

  return <ProductDetail product={product} />;
}
