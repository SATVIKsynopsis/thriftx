"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";
import { SiPaypal, SiVisa, SiGooglepay, SiApplepay, SiMastercard } from "react-icons/si";
import { color, motion } from 'framer-motion';

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

const socialmediaLink = [
  { icon: Twitter, link: "#" },
  { icon: Facebook, link: "#" },
  { icon: Instagram, link: "#" },
];

const paymentType = [
  { icon: SiPaypal, color: "text-blue-600" },
  { icon: SiMastercard, color: "text-orange-500" },
  { icon: SiApplepay, color: "text-white" },
  { icon: SiGooglepay, color: "text-green-600" },
  { icon: SiVisa, color: "text-blue-800" },
];

const FooterComponent = () => {

  // Variants for staggered children animation
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer
      className="w-full bg-black text-neutral-700 py-5 border-t"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <motion.div className="grid grid-col-1 lg:grid-cols-2 xl:grid-cols-3 my-10" variants={containerVariants}>

          {/* Brand Section */}
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl md:text-3xl font-bold mb-3 text-neutral-800">
              <Link href={'/'} className="text-lime-500">Thrift<span className="text-rose-500">X</span></Link>
            </h1>
            <p className="text-neutral-600 mb-5 text-lg leading-relaxed md:pr-24">
              We have clothes that suit your style and make you proud to wear.
              From women to men, find sustainable and stylish fashion here.
            </p>
            <div className="flex space-x-5 lg:mt-10">
              {/* Twitter */}
              <Link
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-110 duration-300 bg-white"
              >
                <Twitter size={20} fill="black" />
              </Link>

              {/* Facebook */}
              <Link
                href="#"
                className="w-10 h-10 flex items-center border-white border justify-center rounded-full transition-transform hover:scale-110 duration-300 bg-black"
              >
                <Facebook size={20} fill="white" className="" />
              </Link>

              {/* Instagram */}
              <Link
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-110 duration-300 fill-black bg-white"
              >
                <Instagram size={20} />
              </Link>
            </div>

          </motion.div>

          {/* Footer Links Sections */}
          <motion.div className="grid grid-cols-2 md:grid-cols-2 mt-10" variants={itemVariants}>
            {footerItems.map((section, index) => (
              <motion.div key={index} variants={itemVariants}>
                <h3 className="text-lg font-semibold fontAnton tracking-widest text-neutral-400 mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.link}
                        className="text-neutral-600 hover:underline hover:text-neutral-500 transition"
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
            <h3 className="text-lg font-semibold fontAnton tracking-widest text-neutral-400 mb-3">
              Contact Info
            </h3>
            <ul className="space-y-3 text-neutral-600">
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
          </motion.div>
        </motion.div>

        {/* FOOTER BOTTOM */}
        <motion.div
          className="border-t border-gray-300 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-600 text-center md:text-left"
          variants={itemVariants}
        >
          <p>ThriftX &copy; 2025&coma; All Rights Reserved. Made with 💖 in Mumbai</p>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {paymentType.map(({ icon: Icon, color }, index) => (
              <span className="p-2 shadow-lg shadow-neutral-700 rounded-2xl" key={index}>
                <Icon className={`text-3xl ${color} hover:opacity-80 transition`} />
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

const Footer = () => {
  return (
    <FooterComponent />
  );
};


export default Footer;
