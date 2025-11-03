import NavLayout from "@/components/NavLayout";
import Link from "next/link";
import Image from "next/image";
import { HomeIcon } from "@heroicons/react/20/solid";
import { IPart, Part } from "@/models/part";
import connectDB from "@/lib/ConnectDB";
import type { Metadata } from "next";
import { getPublicUrlFromKey } from "@/lib/cloudflare";
import PartNumbers from "@/components/PartNumbers";
import RegisterInterestButton from "@/components/RegisterInterestButton";

const categoryMap: Record<string, { displayName: string; dbName: string }> = {
  ptr: { displayName: "PTR", dbName: "ptr" },
  bt: { displayName: "BT", dbName: "bt" },
  cac: { displayName: "CAC", dbName: "cac" },
  automotive_cb: { displayName: "Automotive CB", dbName: "automotive_cb" },
  automotive_pa: { displayName: "Automotive PA", dbName: "automotive_pa" },
};

// Convert snake_case to natural English
function toNaturalEnglish(text: string): string {
  if (!text) return "";

  // Normalize to lowercase for comparison
  const normalized = text.toLowerCase().trim();

  if (normalized === "eoc") {
    return "EOC";
  }

  if (normalized === "toc") {
    return "TOC";
  }

  if (normalized === "siyam_ref" || normalized === "siyam ref") {
    return "Siyam Ref";
  }

  // Split by underscore or space, then capitalize each word
  return text
    .split(/[_\s]+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

async function getProduct(categoryName: string, siyamRef: string) {
  const category = categoryMap[categoryName.toLowerCase()];
  if (!category) {
    return null;
  }

  try {
    await connectDB();

    const query: { category?: { $regex: RegExp }; siyam_ref?: string } = {};
    query.category = { $regex: new RegExp(`^${category.dbName}$`, "i") };
    query.siyam_ref = siyamRef;

    const product = await Part.findOne(query).lean() as (IPart & { _id: any; __v?: number }) | null;

    if (!product) {
      return null;
    }

    return {
      ...product,
      _id: product._id?.toString() || "",
    } as IPart & { _id: string };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

function getImageUrl(product: IPart | null): string {
  if (!product) return "/placeholder.jpeg";

  // Use image_url from database if available
  if (product.image_url) {
    return product.image_url;
  }

  // Otherwise, try to generate from siyam_ref
  if (!product.siyam_ref) return "/placeholder.jpeg";

  const extensions = ["png", "jpg", "jpeg"];
  // Try the first extension as a default
  return getPublicUrlFromKey(`${product.siyam_ref}.${extensions[0]}`);
}

export async function generateMetadata({
  params,
}: {
  params:
    | { categoryName: string; siyam_ref: string }
    | Promise<{ categoryName: string; siyam_ref: string }>;
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const categoryName = resolvedParams?.categoryName || "";
  const siyamRef = resolvedParams?.siyam_ref || "";

  const category = categoryMap[categoryName.toLowerCase()];
  const displayName = category?.displayName || categoryName;

  return {
    title: `Siyam - ${siyamRef} | ${displayName}`,
    description: `Product details for ${siyamRef} in ${displayName} category.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params:
    | { categoryName: string; siyam_ref: string }
    | Promise<{ categoryName: string; siyam_ref: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);

  if (!resolvedParams?.categoryName || !resolvedParams?.siyam_ref) {
    return (
      <NavLayout>
        <div className="bg-white min-h-screen py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Product Not Found
            </h1>
            <Link href="/" className="mt-4 text-blue-600 hover:text-blue-500">
              ← Back to Products
            </Link>
          </div>
        </div>
      </NavLayout>
    );
  }

  const categoryName = resolvedParams.categoryName.toLowerCase();
  const siyamRef = resolvedParams.siyam_ref;
  const category = categoryMap[categoryName];

  if (!category) {
    return (
      <NavLayout>
        <div className="bg-white min-h-screen py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Category Not Found
            </h1>
            <Link href="/" className="mt-4 text-blue-600 hover:text-blue-500">
              ← Back to Products
            </Link>
          </div>
        </div>
      </NavLayout>
    );
  }

  const product = await getProduct(categoryName, siyamRef);

  if (!product) {
    return (
      <NavLayout>
        <div className="bg-white min-h-screen py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Product Not Found
            </h1>
            <p className="mt-2 text-gray-600">
              Product with reference {siyamRef} not found in{" "}
              {category.displayName} category.
            </p>
            <Link
              href={`/category/${categoryName}`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-500"
            >
              ← Back to {category.displayName} Products
            </Link>
          </div>
        </div>
      </NavLayout>
    );
  }

  // Build breadcrumb pages
  const pages = [
    { name: "Products", href: "/", current: false },
    {
      name: category.displayName,
      href: `/category/${categoryName}`,
      current: false,
    },
    {
      name: product.model || product.siyam_ref,
      href: `/products/${categoryName}/${siyamRef}`,
      current: true,
    },
  ];

  const imageUrl = getImageUrl(product);
  const isAutomotive =
    product.category?.toLowerCase().includes("automotive") || false;

  // Get category display name from categoryMap
  const getCategoryDisplayName = (category: string): string => {
    const normalizedCategory = category?.toLowerCase() || "";
    const mappedCategory = categoryMap[normalizedCategory];
    if (mappedCategory) {
      return mappedCategory.displayName;
    }
    // Fallback to natural English if not in map
    return toNaturalEnglish(category || "");
  };

  // Filter details for display (excluding fields shown elsewhere)
  const filteredDetails =
    product.details?.filter(() => {
      // Exclude year and construction if they're charge_air_coolers (not applicable here, but keeping pattern)
      return true;
    }) || [];

  return (
    <NavLayout>
      <main className="isolate bg-white">
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

          <div className="mx-auto px-4 pt-4 pb-16 sm:px-6 sm:pt-8 sm:pb-24 lg:max-w-7xl lg:px-8">
            {/* Product */}
            <div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
              {/* Product image */}
              <div className="lg:col-span-4 lg:row-end-1">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-white">
                  <Image
                    src={imageUrl}
                    alt={product.siyam_ref || "Product image"}
                    width={800}
                    height={600}
                    className="h-full w-full object-contain object-center"
                    unoptimized
                  />
                </div>
              </div>

              {/* Product details */}
              <div className="w-full mx-auto mt-14 max-w-2xl sm:mt-16 lg:col-span-3 lg:row-span-2 lg:row-end-2 lg:mt-0 lg:max-w-none">
                <div className="flex flex-col-reverse">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {isAutomotive
                        ? product.siyam_ref
                        : product.model || product.siyam_ref}
                    </h1>

                    <h2 id="information-heading" className="sr-only">
                      Product information
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      {isAutomotive ? product.model : product.siyam_ref}
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4">
                  <RegisterInterestButton siyamRef={product.siyam_ref || ""} />
                  {product.amazon_url && (
                    <Link
                      href={product.amazon_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-md bg-blue-50 px-2.5 py-1.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
                    >
                      Buy on Amazon
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 mt-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Make</h3>
                    <div className="prose prose-sm text-gray-500">
                      <p className="text-gray-500">
                        {product.make || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Radiator Type
                    </h3>
                    <div className="prose prose-sm text-gray-500">
                      <p className="text-gray-500">
                        {product.radiator_type || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6 grid grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Part Numbers #
                    </h3>
                    <div className="prose prose-sm text-gray-500">
                      <PartNumbers oem={product.oem || []} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Category
                    </h3>
                    <div className="prose prose-sm text-gray-500">
                      <p className="text-gray-500">
                        {getCategoryDisplayName(product.category || "")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredDetails.length > 0 && (
          <>
            <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
              <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Technical Specifications
                </h2>
                <p className="mt-4 text-gray-500">
                  We work tirelessly to get the details right. We want you to
                  know what&apos;s inside every product.
                </p>
              </div>

              <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
                {filteredDetails.map((detail, index) => (
                  <div key={index} className="border-t border-gray-200 pt-4">
                    <dt className="font-medium text-gray-900">
                      {toNaturalEnglish(detail.name)}
                    </dt>
                    <dd className="mt-2 text-sm text-gray-500">
                      {detail.data || "Unknown"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </>
        )}
      </main>
    </NavLayout>
  );
}
