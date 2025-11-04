"use client";

import { useState } from "react";
import NavLayout from "@/components/NavLayout";
import Link from "next/link";
import {
  HomeIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/20/solid";

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Post to /api/contact with form data
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company || undefined,
          email: formData.email,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit contact information");
      }

      setSubmitStatus("success");
      setFormData({ name: "", company: "", email: "", phone: "" });

      // Close modal after 2 seconds on success
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", company: "", email: "", phone: "" });
    setSubmitStatus(null);
  };

  return (
    <NavLayout>
      <div className="bg-white min-h-screen">
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
            <li>
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500">
                  Contact
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="py-16 sm:py-24 xl:mx-auto xl:max-w-7xl xl:px-8">
          <div className="mx-auto max-w-3xl text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Have a question or need more information? We&apos;d love to hear
              from you. Reach out and we&apos;ll get back to you as soon as
              possible.
            </p>

            <div className="mt-10">
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Contact Us
              </button>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-50 p-3">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  Email
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Send us an email anytime
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-blue-50 p-3">
                  <PhoneIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  Phone
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Call us during business hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="relative z-50"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500/50 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            {/* Modal Panel */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  {/* Close Button */}
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={handleCloseModal}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="bg-white px-6 py-6">
                    <div className="sm:flex sm:items-start">
                      <div className="text-left w-full">
                        <h3
                          className="text-2xl font-semibold leading-6 text-gray-900 mb-6"
                          id="modal-title"
                        >
                          Contact Us
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Name
                            </label>
                            <div className="mt-2 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </div>
                              <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="John Doe"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Email
                            </label>
                            <div className="mt-2 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </div>
                              <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="john@example.com"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="company"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Company
                            </label>
                            <div className="mt-2 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BuildingOfficeIcon
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </div>
                              <input
                                type="text"
                                name="company"
                                id="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="Company Name"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="phone"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Phone
                            </label>
                            <div className="mt-2 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <PhoneIcon
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </div>
                              <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder="(555) 123-4567"
                              />
                            </div>
                          </div>

                          {submitStatus === "success" && (
                            <div className="rounded-md bg-green-50 p-4">
                              <p className="text-sm font-medium text-green-800">
                                Thank you! Your information has been submitted
                                successfully.
                              </p>
                            </div>
                          )}

                          {submitStatus === "error" && (
                            <div className="rounded-md bg-red-50 p-4">
                              <p className="text-sm font-medium text-red-800">
                                Something went wrong. Please try again.
                              </p>
                            </div>
                          )}

                          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCloseModal}
                              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </NavLayout>
  );
}
