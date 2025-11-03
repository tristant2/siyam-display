"use client";

import { useState } from "react";

interface PartNumbersProps {
  oem: string[];
}

export default function PartNumbers({ oem }: PartNumbersProps) {
  const [showAll, setShowAll] = useState(false);
  const displayCount = 5;
  const hasMore = oem.length > displayCount;
  const displayedOem = showAll ? oem : oem.slice(0, displayCount);

  if (!oem || oem.length === 0) {
    return <p className="text-gray-500">None</p>;
  }

  return (
    <div>
      <ul role="list" className="space-y-1">
        {displayedOem.map((text, index) => (
          <li key={index} className="text-gray-500">
            {text}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
        >
          {showAll ? "Show Less" : `Show All (${oem.length - displayCount} more)`}
        </button>
      )}
    </div>
  );
}

