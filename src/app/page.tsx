import {
  ProductList,
  type ProductWithRelations,
} from "@src/app/ui/product-list";
import { getProducts } from "@src/lib/data";

export default async function Home() {
  const products = await getProducts();

  return (
    <ProductList
      initialProducts={products as unknown as ProductWithRelations[]}
    />
  );
}
