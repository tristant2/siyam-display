import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    name: "PTR",
    href: "/category/ptr",
    description: "Browse PTR products",
    image: "/ptr.png",
  },
  {
    name: "BT",
    href: "/category/bt",
    description: "Browse BT products",
    image: "/bt.jpeg",
  },
  {
    name: "CAC",
    href: "/category/cac",
    description: "Browse CAC products",
    image: "/cac.png",
  },
  {
    name: "Automotive CB",
    href: "/category/automotive_cb",
    description: "Browse Automotive CB products",
    image: "/automotivecb.jpg",
  },
  {
    name: "Automotive PA",
    href: "/category/automotive_pa",
    description: "Browse Automotive PA products",
    image: "/automtivepa.jpg",
  },
];

export default function ProductCategories() {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm ring-1 ring-inset ring-gray-900/5 hover:shadow-md transition-shadow"
          >
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-white mb-4">
              <Image
                src={category.image}
                alt={category.name}
                width={300}
                height={300}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
