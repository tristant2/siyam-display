import NavLayout from "@/components/NavLayout";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/20/solid";
import ProductCard from "@/components/ProductCard";
import { IPart } from "@/models/part";
import type { Metadata } from "next";

async function getSearchResults(searchQuery: string) {
  if (!searchQuery || searchQuery.trim() === "") {
    return { products: [], count: 0 };
  }

  try {
    // Use the new search API endpoint
    // For server components, construct the full URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    const response = await fetch(`${baseUrl}/api/search?query=${encodeURIComponent(searchQuery.trim())}`, {
      cache: 'no-store', // Ensure fresh results
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return {
        products: data.results as (IPart & { _id: string })[],
        count: data.count || 0,
      };
    } else {
      throw new Error(data.error || 'Search failed');
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    return { products: [], count: 0 };
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string } | Promise<{ q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = params?.q || "";
  
  return {
    title: query ? `Search: ${query} - Siyam` : "Search - Siyam",
    description: query
      ? `Search results for "${query}" at Siyam Radiators`
      : "Search for products at Siyam Radiators",
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string } | Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params?.q || "";
  const { products, count } = await getSearchResults(searchQuery);

  const pages = [
    { name: "Products", href: "/", current: false },
    { name: "Search", href: "#", current: true },
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
                  {page.current ? (
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      {page.name}
                    </span>
                  ) : (
                    <Link
                      href={page.href}
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {page.name}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>

        <div className="py-16 sm:py-24 xl:mx-auto xl:max-w-7xl xl:px-8">
          <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {searchQuery ? (
                  <>
                    Search results for &quot;{searchQuery}&quot;
                  </>
                ) : (
                  "Search Products"
                )}
              </h2>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-600">
                  {count} {count === 1 ? "product" : "products"} found
                </p>
              )}
            </div>
          </div>

          {!searchQuery ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Please enter a search query.</p>
              <Link
                href="/"
                className="mt-4 inline-block text-blue-600 hover:text-blue-500"
              >
                ← Back to all products
              </Link>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No products found matching &quot;{searchQuery}&quot;.
              </p>
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
                <ProductCard key={product.siyam_ref || product._id?.toString()} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </NavLayout>
  );
}

