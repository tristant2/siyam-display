import NavLayout from "@/components/NavLayout";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/20/solid";
import ProductCard from "@/components/ProductCard";
import { IPart, Part } from "@/models/part";
import connectDB from "@/lib/ConnectDB";
import type { Metadata } from "next";

const categoryMap: Record<string, { displayName: string; dbName: string }> = {
  ptr: { displayName: "PTR", dbName: "ptr" },
  bt: { displayName: "BT", dbName: "bt" },
  cac: { displayName: "CAC", dbName: "cac" },
  "automotive_cb": { displayName: "Automotive CB", dbName: "automotive_cb" },
  "automotive_pa": { displayName: "Automotive PA", dbName: "automotive_pa" },
};

async function getProducts(categoryName: string) {
  const category = categoryMap[categoryName.toLowerCase()];
  if (!category) {
    return { products: [], count: 0 };
  }

  try {
    await connectDB();
    
    // Match category case-insensitively
    const query: { category?: { $regex: RegExp } } = {};
    query.category = { $regex: new RegExp(`^${category.dbName}$`, "i") };

    const products = await Part.find(query).sort({ siyam_ref: 1 }).lean() as (IPart & { _id: any; __v?: number })[];
    
    return {
      products: products.map((product) => ({
        ...product,
        _id: product._id?.toString(),
      })) as (IPart & { _id: string })[],
      count: products.length,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], count: 0 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: { categoryName: string } | Promise<{ categoryName: string }>;
}): Promise<Metadata> {
  // Handle params being a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  const categoryName = resolvedParams?.categoryName || "";
  const category = categoryMap[categoryName.toLowerCase()];
  const displayName = category?.displayName || categoryName;

  return {
    title: `Siyam - ${displayName} Products`,
    description: `Browse our ${displayName} product category at Siyam. Find high-quality radiators for your needs.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { categoryName: string } | Promise<{ categoryName: string }>;
}) {
  // Handle params being a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  
  if (!resolvedParams?.categoryName) {
    return (
      <NavLayout>
        <div className="bg-white min-h-screen py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">Category Not Found</h1>
            <Link href="/" className="mt-4 text-blue-600 hover:text-blue-500">
              ← Back to Products
            </Link>
          </div>
        </div>
      </NavLayout>
    );
  }

  const categoryName = resolvedParams.categoryName.toLowerCase();
  const category = categoryMap[categoryName];
  
  if (!category) {
    return (
      <NavLayout>
        <div className="bg-white min-h-screen py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">Category Not Found</h1>
            <Link href="/" className="mt-4 text-blue-600 hover:text-blue-500">
              ← Back to Products
            </Link>
          </div>
        </div>
      </NavLayout>
    );
  }

  const { products, count } = await getProducts(categoryName);
  const pages = [
    { name: "Products", href: "/", current: false },
    { name: category.displayName, href: `/category/${categoryName}`, current: true },
  ];

  return (
    <NavLayout>
      <div className="bg-white">
        <nav
          className="flex mx-auto max-w-7xl px-6 lg:flex lg:px-8 mb-4 mt-4 sm:mt-8"
          aria-label="Breadcrumb"
        >
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <div>
                <Link href="/" className="text-gray-400 hover:text-gray-500">
                  <HomeIcon
                    className="h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Home</span>
                </Link>
              </div>
            </li>
            {pages.map((page) => (
              <li key={page.name}>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <Link
                    href={page.href}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    aria-current={page.current ? "page" : undefined}
                  >
                    {page.name}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        <div className="py-16 sm:py-24 xl:mx-auto xl:max-w-7xl xl:px-8">
          <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0 mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              {category.displayName} Products
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {count} {count === 1 ? "product" : "products"} found
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found in this category.</p>
              <Link
                href="/"
                className="mt-4 inline-block text-blue-600 hover:text-blue-500"
              >
                ← Back to all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: IPart & { _id: string }) => (
                <ProductCard key={product.siyam_ref || product._id?.toString()} product={product} category={categoryName} />
              ))}
            </div>
          )}
        </div>
      </div>
    </NavLayout>
  );
}

