import React from "react";

const TermServiceComponent = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 transition-colors duration-300 bg-white text-gray-800 dark:bg-[#0f0f0f] dark:text-gray-200">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-lime-500">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: October 26, 2025
        </p>
      </div>

      {/* Content */}
      <section className="space-y-8 leading-relaxed">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            1. Introduction
          </h2>
          <p>
            Welcome to <strong>ThriftX Clothing</strong>. By accessing or using
            our website, you agree to comply with and be bound by these Terms of
            Service. Please read them carefully before using our site.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            2. Use of Our Website
          </h2>
          <p>
            You agree to use our website only for lawful purposes and in a way
            that does not infringe on the rights of others. You must not engage
            in any activity that could harm, disable, or impair the website.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            3. Account Responsibilities
          </h2>
          <p>
            If you create an account with ThriftX Clothing, you are responsible
            for maintaining the confidentiality of your login credentials and
            for all activities under your account. Notify us immediately of any
            unauthorized access or security breach.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            4. Product Information
          </h2>
          <p>
            We strive to display accurate product details, but we cannot
            guarantee that all product descriptions, images, or pricing are
            error-free. We reserve the right to correct any inaccuracies at any
            time without notice.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            5. Orders and Payments
          </h2>
          <p>
            By placing an order, you agree to provide accurate billing and
            shipping information. We reserve the right to refuse or cancel any
            order at our discretion. Payments are processed securely through our
            trusted partners.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            6. Returns and Refunds
          </h2>
          <p>
            Please review our{" "}
            <strong>Return & Refund Policy</strong> for detailed information
            about returning items and receiving refunds.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            7. Intellectual Property
          </h2>
          <p>
            All content, including images, logos, designs, and text, is the
            property of ThriftX Clothing. You may not reproduce, distribute, or
            exploit any content without our written permission.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            8. Limitation of Liability
          </h2>
          <p>
            ThriftX Clothing is not liable for any damages arising from the use
            or inability to use our website, including indirect or incidental
            damages.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            9. Changes to These Terms
          </h2>
          <p>
            We may update these Terms of Service from time to time. Any changes
            will be posted on this page, and the updated date will be reflected
            at the top. Your continued use of the website constitutes acceptance
            of the new terms.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-lime-600 dark:text-lime-400">
            10. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms of Service, please
            contact us at{" "}
            <a
              href="mailto:support@thriftxclothing.com"
              className="text-lime-600 dark:text-lime-400 underline hover:text-lime-700 dark:hover:text-lime-300 transition"
            >
              support@thriftxclothing.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermServiceComponent;
