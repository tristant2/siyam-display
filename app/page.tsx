import NavLayout from "@/components/NavLayout";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/20/solid";
import ProductCategories from "@/components/ProductCategories";
import ProductsInfo from "@/components/ProductsInfo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Siyam - All Products",
  description:
    "Discover a wide range of high-quality radiators for Heavy Duty, Automotive, Industrial, and Agricultural applications at Siyam. Explore our product categories and find the perfect radiator for your needs.",
  openGraph: {
    title: "Siyam - All Products",
    url: "https://siyam.com",
    siteName: "Siyam",
    images: [
      {
        url: "https://siyam.com/siyam-dark.png",
      },
    ],
    type: "website",
    description:
      "Discover a wide range of high-quality radiators for Heavy Duty, Automotive, Industrial, and Agricultural applications at Siyam. Explore our product categories and find the perfect radiator for your needs.",
  },
};

export default function Products() {
  const pages = [{ name: "Products", href: "/", current: true }];

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
          <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Shop by Category
            </h2>
          </div>

          <ProductCategories />
        </div>

        <ProductsInfo />

        <div className="mx-auto max-w-3xl text-center py-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Can&apos;t find what you are looking for?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Siyam has a comprehensive product line to meet all your needs. Reach
            out and we will provide you with more information.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/contact"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </NavLayout>
  );
}
