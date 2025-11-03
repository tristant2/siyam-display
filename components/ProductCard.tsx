"use client";

import Image from "next/image";
import Link from "next/link";
import { IPart } from "@/models/part";
import { getPublicUrlFromKey } from "@/lib/cloudflare";
import { useState, useEffect, useRef } from "react";

interface ProductCardProps {
  product: IPart & { _id?: string };
  category?: string;
}

const extensions = ["png", "jpg", "jpeg"];

export default function ProductCard({ product, category }: ProductCardProps) {
  const [imageUrl, setImageUrl] = useState<string>("/placeholder.jpeg");
  const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0);
  const siyamRefRef = useRef<string | undefined>(product.siyam_ref);

  // Normalize category for URL - use provided category or fallback to product.category
  const normalizedCategory = (category || product.category || "").toLowerCase();
  const productUrl = product.siyam_ref
    ? `/products/${normalizedCategory}/${product.siyam_ref}`
    : "#";
  
  // Determine if product is automotive (same logic as product detail page)
  const isAutomotive = product.category?.toLowerCase().includes("automotive") || false;
  
  // Get product title (same logic as product detail page)
  const productTitle = isAutomotive
    ? product.siyam_ref
    : product.model || product.siyam_ref;
  
  // Get product subtitle (same logic as product detail page)
  const productSubtitle = isAutomotive ? product.model : product.siyam_ref;

  useEffect(() => {
    // Reset when siyam_ref changes - this is intentional to reset state when product changes
    if (siyamRefRef.current !== product.siyam_ref) {
      siyamRefRef.current = product.siyam_ref;
      // Using setTimeout to defer state updates and avoid cascading renders
      setTimeout(() => {
        setCurrentExtensionIndex(0);
        setImageUrl("/placeholder.jpeg");
      }, 0);
    }

    if (!product.siyam_ref || currentExtensionIndex >= extensions.length) {
      return;
    }

    let isMounted = true;

    const tryLoadImage = (extension: string) => {
      const url = getPublicUrlFromKey(`${product.siyam_ref}.${extension}`);
      const img = document.createElement("img");

      img.onload = () => {
        if (isMounted) {
          setImageUrl(url);
        }
      };

      img.onerror = () => {
        if (isMounted) {
          const nextIndex = extensions.indexOf(extension) + 1;
          if (nextIndex < extensions.length) {
            setCurrentExtensionIndex(nextIndex);
          } else {
            setImageUrl("/placeholder.jpeg");
          }
        }
      };

      img.src = url;
    };

    tryLoadImage(extensions[currentExtensionIndex]);

    return () => {
      isMounted = false;
    };
  }, [product.siyam_ref, currentExtensionIndex]);

  return (
    <Link 
      href={productUrl} 
      className="group relative block rounded-lg bg-white p-4 shadow-sm ring-1 ring-inset ring-gray-900/5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75">
        <Image
          src={imageUrl}
          alt={product.siyam_ref || "Product image"}
          width={400}
          height={400}
          className="h-full w-full object-contain"
          unoptimized
        />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {productTitle}
        </h3>
        {productSubtitle && (
          <p className="mt-1 text-sm text-gray-500">
            {productSubtitle}
          </p>
        )}
        {product.make && (
          <p className="mt-1 text-sm text-gray-600">
            Make: {product.make}
          </p>
        )}
        {product.radiator_type && (
          <p className="mt-1 text-sm text-gray-500">
            Type: {product.radiator_type}
          </p>
        )}
        {product.oem && product.oem.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            OEM: {product.oem.slice(0, 3).join(", ")}
            {product.oem.length > 3 && ` +${product.oem.length - 3} more`}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-500">
            View Details →
          </span>
          {product.amazon_url && (
            <a
              href={product.amazon_url}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Amazon →
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
