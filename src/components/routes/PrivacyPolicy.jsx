import React from "react";

const PrivacyPolicyComponent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {/* Hero Section */}
      <section className="text-center py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-lime-400/10 to-lime-600/10 dark:from-lime-500/10 dark:to-lime-700/10 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-lime-600">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your privacy matters to us. Learn how ThriftX Clothing collects, uses, and safeguards your data.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">
            Last updated: October 26, 2025
          </p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-[#101010]/70 shadow-lg rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-800 transition-all">
          <section className="space-y-10 leading-relaxed">
            {[
              {
                title: "1. Introduction",
                text: `Welcome to ThriftX Clothing. This Privacy Policy explains how we collect, use, and protect your information when you visit or purchase from our website.`,
              },
              {
                title: "2. Information We Collect",
                text: `We collect data you provide (such as your name, email, address, and payment info) and data automatically gathered (like IP address, browser type, and device).`,
              },
              {
                title: "3. How We Use Your Data",
                text: `We use your information to process orders, enhance user experience, provide customer support, and send updates or promotional materials.`,
              },
              {
                title: "4. Data Security",
                text: `Your security is our priority. We implement industry-standard encryption and secure servers, but no online platform is 100% risk-free.`,
              },
              {
                title: "5. Cookies & Tracking",
                text: `We use cookies to personalize content, analyze traffic, and improve functionality. You may disable cookies in your browser settings.`,
              },
              {
                title: "6. Third-Party Services",
                text: `We may share minimal data with trusted partners like payment gateways and delivery providers, strictly to fulfill your orders.`,
              },
              {
                title: "7. Your Rights",
                text: `You can access, update, or delete your data anytime by contacting us. We respect your privacy and will handle all requests promptly.`,
              },
              {
                title: "8. Changes to This Policy",
                text: `We may update this Privacy Policy periodically. Updates will be reflected on this page, with the latest date shown at the top.`,
              },
              {
                title: "9. Contact Us",
                text: `Have questions? Reach out to us at support@thriftxclothing.com for privacy-related inquiries.`,
              },
            ].map((section, index) => (
              <div key={index} className="group">
                <h2 className="text-2xl font-semibold mb-3 text-lime-600 dark:text-lime-400 group-hover:text-lime-500 transition-colors">
                  {section.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{section.text}</p>
              </div>
            ))}
          </section>

          {/* Contact Button */}
          <div className="text-center mt-14">
            <a
              href="mailto:support@thriftxclothing.com"
              className="inline-block px-6 py-3 rounded-full font-medium bg-gradient-to-r from-lime-500 to-lime-600 text-white hover:from-lime-600 hover:to-lime-700 transition-all shadow-md hover:shadow-lime-400/20"
            >
              Contact Privacy Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyComponent;
