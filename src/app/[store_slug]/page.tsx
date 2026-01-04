import {
  ProductList,
  type ProductWithRelations,
} from "@src/app/ui/product-list";
import { getStoreBySlug } from "@src/lib/data";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ store_slug: string }>;
}) {
  const { store_slug } = await params;
  const store = await getStoreBySlug(store_slug);

  return (
    <div className="flex w-full flex-col justify-center">
      <div className="flex w-full flex-col items-center rounded-md bg-white px-4 py-2.5 shadow-2xl/10 transition-all duration-300 hover:shadow-2xl/30 sm:flex-row md:px-6 md:py-4">
        <div className="flex w-full flex-col">
          <p className="font-sans text-[16px] font-semibold text-wrap wrap-anywhere whitespace-pre-line text-gray-700/90">
            {store?.name}{" "}
            <span className="ml-0.5 text-xs text-gray-500/80">
              @{store?.slug}
            </span>
          </p>
          <p className="font-sans text-sm font-medium text-wrap wrap-anywhere whitespace-pre-line text-gray-600">
            {store?.city}
          </p>
        </div>

        <Link
          href={store?.url || ""}
          target="_blank"
          className="hidden w-auto cursor-pointer items-center gap-1.5 rounded-md border border-gray-400/80 bg-transparent py-1.5 text-center font-sans text-sm font-semibold text-gray-600 shadow-2xl hover:border-emerald-600/80 hover:bg-emerald-50 hover:text-emerald-700 sm:flex lg:px-4 lg:text-sm lg:text-nowrap"
        >
          Detail Toko
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="h-4 w-4 text-gray-500/80"
            fill="currentColor"
          >
            <path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z" />
          </svg>
        </Link>
      </div>

      <hr className="my-6 border-gray-300" />

      <ProductList
        initialProducts={(store?.products || []) as ProductWithRelations[]}
        storeSlug={store_slug}
      />
    </div>
  );
}
