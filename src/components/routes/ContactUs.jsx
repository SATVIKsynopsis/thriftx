"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
  });

  const handleOnChange = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="w-full min-h-screen mb-10 transition-colors duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <div className="max-w-7xl mx-auto pt-10 pb-10 px-5 sm:px-8 md:px-12 lg:px-5">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-14 md:gap-20">
          {/* LEFT TEXT SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold leading-tight mb-6">
              <p>Join the thrift revolution.</p>
              <p>Contact ThriftX.</p>
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-neutral-400 w-full sm:w-4/5">
              Have a question about our wearable collection, a collaboration
              idea, or just want to say hi? Drop us a message — we’d love to
              connect!
            </p>
          </motion.div>

          {/* CONTACT FORM */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 w-full lg:w-[40%]"
          >
            <motion.input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleOnChange}
              placeholder="Your Name*"
              className="text-lg sm:text-xl bg-transparent border-b border-neutral-400 dark:border-neutral-600 py-3 focus:outline-none focus:border-lime-500"
              required
              whileFocus={{ scale: 1.02 }}
            />
            <motion.input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleOnChange}
              placeholder="Brand / Company"
              className="text-lg sm:text-xl bg-transparent border-b border-neutral-400 dark:border-neutral-600 py-3 focus:outline-none focus:border-lime-500"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleOnChange}
              placeholder="Email Address*"
              className="text-lg sm:text-xl bg-transparent border-b border-neutral-400 dark:border-neutral-600 py-3 focus:outline-none focus:border-lime-500"
              required
              whileFocus={{ scale: 1.02 }}
            />
            <motion.textarea
              name="message"
              value={formData.message}
              onChange={handleOnChange}
              placeholder="Message"
              className="text-lg sm:text-xl bg-transparent border-b border-neutral-400 dark:border-neutral-600 py-3 h-32 sm:h-40 resize-none focus:outline-none focus:border-lime-500"
              whileFocus={{ scale: 1.02 }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-neutral-500 dark:text-neutral-400 font-medium text-xs sm:text-sm"
            >
              By submitting, you agree to ThriftX’s{" "}
              <Link href="/privacy-policy" className="underline text-lime-500">
                Privacy Policy
              </Link>
              .
            </motion.p>

            <motion.button
              type="submit"
              className="text-lg sm:text-xl bg-lime-500 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full mt-3 font-semibold hover:bg-lime-600 transition-colors dark:hover:bg-lime-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send Message
            </motion.button>

            <motion.div
              className="mt-6 sm:mt-8 bg-lime-100 dark:bg-neutral-800 p-4 sm:p-5 rounded-2xl border border-lime-200 dark:border-neutral-700"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h1 className="text-xl sm:text-2xl font-bold mb-2 text-lime-600 dark:text-lime-400">
                ⚠ Important Notice
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-neutral-700 dark:text-neutral-300">
                Beware of fake ThriftX job offers or seller accounts. We only
                operate through our official website and verified social
                channels. Stay safe and shop sustainably!
              </p>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
