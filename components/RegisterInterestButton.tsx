"use client";

import { useState } from "react";
import ContactModal, { type ContactFormData } from "@/components/ContactModal";

interface RegisterInterestButtonProps {
  siyamRef: string;
}

export default function RegisterInterestButton({
  siyamRef,
}: RegisterInterestButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (data: ContactFormData) => {
    // TODO: Implement actual API call to submit contact form
    // Data will be used when API endpoint is implemented
    console.log("Contact form data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 cursor-pointer"
      >
        Register Interest
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </button>
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        siyam_ref={siyamRef}
        onSubmit={handleSubmit}
      />
    </>
  );
}
