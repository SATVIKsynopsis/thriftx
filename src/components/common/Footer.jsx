"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail, User } from "lucide-react";
import { SiRazorpay } from "react-icons/si";
import { motion } from "framer-motion";

const footerItems = [
  {
    title: "MARKETPLACE",
    links: [
      { name: "Browse Products", link: "/search" },
      { name: "Sell on ThriftX", link: "/register" },
      { name: "About Us", link: "/about" },
      { name: "Help Center", link: "/help" },
      { name: "Terms of Service", link: "/terms" },
      { name: "Privacy Policy", link: "/privacy" },
    ],
  },
  {
    title: "HELP",
    links: [
      { name: "Customer Support", link: "#" },
      { name: "Delivery Details", link: "#" },
      { name: "Returns", link: "#" },
      { name: "Designer", link: "#" },
      { name: "Contact us", link: "#" },
    ],
  },
];

const FooterComponent = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.2, duration: 0.6 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer className="bg-gray-200 dark:bg-black text-gray-900 dark:text-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 my-10" variants={containerVariants}>
          {/* Brand Section */}
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl md:text-4xl font-bold mb-3 fontAnton text-gray-900 dark:text-white">
              <Link href="/" className="text-lime-500">
                Thrift<span className="text-rose-500">X</span>
              </Link>
            </h1>
            <p className="text-gray-600 dark:text-neutral-400 mb-5 text-lg leading-relaxed md:pr-24">
              We have clothes that suit your style and make you proud to wear. From women to men, find sustainable and stylish fashion here.
            </p>
            <div className="flex space-x-5 lg:mt-10">
              <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-110 duration-300 bg-gray-200 border border-neutral-400 dark:bg-white">
                <Twitter size={20} className="text-gray-900 dark:text-black" />
              </Link>
              <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-110 duration-300 bg-gray-900 dark:border dark:border-white dark:bg-black">
                <Facebook size={20} className="text-white" />
              </Link>
              <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-110 duration-300 bg-gray-200 border border-neutral-400 dark:bg-white">
                <Instagram size={20} className="text-gray-900 dark:text-black" />
              </Link>
            </div>
          </motion.div>

          {/* Footer Links Sections */}
          <motion.div className="grid grid-cols-2 md:grid-cols-2 mt-10" variants={itemVariants}>
            {footerItems.map((section, index) => (
              <motion.div key={index} variants={itemVariants}>
                <h3 className="text-lg font-semibold fontAnton tracking-widest text-gray-500 dark:text-neutral-400 mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.link}
                        className="text-gray-600 dark:text-neutral-600 hover:underline hover:text-gray-800 dark:hover:text-neutral-500 transition"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Info */}
          <motion.div className="mt-10 xl:pl-20" variants={itemVariants}>
            <h3 className="text-lg font-semibold fontAnton tracking-widest text-gray-500 dark:text-neutral-400 mb-3">
              Contact Info
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-neutral-600">
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-blue-600" />
                <span>support@thriftx.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="text-green-600" />
                <span>+91 (431) 250-3001</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={18} className="text-red-600" />
                <span>NIT Tiruchirappalli, Tamil Nadu, India</span>
              </li>
            </ul>
            <p className="mt-3 text-gray-700 dark:text-neutral-400 flex items-center gap-1">
              Want to become a{" "}
              <Link
                href="/register/seller"
                className="text-lime-600 dark:text-lime-400 hover:text-blue-600 font-semibold transition-colors flex items-center gap-1 hover:underline"
              >
                <User size={16} /> Seller?
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Footer Bottom */}
        <motion.div className="border-t border-neutral-700 dark:border-neutral-700 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600 dark:text-neutral-600 text-center md:text-left" variants={itemVariants}>
          <p>ThriftX &copy; 2025, All Rights Reserved. Made with 💖 in Mumbai</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="p-2 shadow-lg rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center">
              <SiRazorpay
                size={20}
                className="text-[#3B8EF3] dark:text-[#3B8EF3]" // Razorpay blue in both modes
              />
            </span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default FooterComponent;
