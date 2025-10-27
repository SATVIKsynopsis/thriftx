import React from "react";
import { Leaf, Shirt, Rocket } from "lucide-react";

const AboutUsComponent = () => {
  return (
    <section className="bg-neutral-50 dark:bg-neutral-900 py-16 px-6 md:px-20 transition-colors duration-500">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-neutral-800 dark:text-white mb-6">
          About <span className="text-lime-500">ThriftX</span>
        </h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-10">
          Welcome to <strong>ThriftX</strong> — your destination for
          sustainable, stylish, and affordable fashion. We bring together
          top-quality brands and thrift finds to redefine how people shop
          responsibly.
        </p>

        <div className="grid md:grid-cols-3 gap-10 text-left">
          {/* Sustainable Fashion */}
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-md hover:shadow-xl transition-all">
            <Leaf className="w-10 h-10 text-lime-500 mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
              Sustainable Fashion
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              We believe in reusing and recycling quality pieces to reduce waste
              and make fashion eco-friendly for everyone.
            </p>
          </div>

          {/* Multi-Brand Collection */}
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-md hover:shadow-xl transition-all">
            <Shirt className="w-10 h-10 text-lime-500 mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
              Multi-Brand Collection
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Explore a curated mix of trending labels and unique thrift finds
              that fit every vibe, style, and budget.
            </p>
          </div>

          {/* Vision */}
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-md hover:shadow-xl transition-all">
            <Rocket className="w-10 h-10 text-lime-500 mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
              Our Vision
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              To make sustainable fashion mainstream through trust, transparency,
              and innovative shopping experiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsComponent;
