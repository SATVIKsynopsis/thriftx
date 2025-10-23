"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Details = () => {
  return (
    <div className="bg-white dark:bg-black pb-10 sm:pb-20 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
        <h2 className="text-3xl pb-2 md:pb-10 text-gray-900 dark:text-white md:text-7xl font-bold fontAnton gap-2">
          THE <span className="text-lime-500">THRIFT</span>{" "}
          <span className="text-rose-500">BREAKDOWN</span>
        </h2>

        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1"
        >
          <AccordionItem value="item-1" className="border-b border-gray-300 dark:border-gray-700">
            <AccordionTrigger className="text-lg md:text-xl font-semibold text-left py-4 hover:no-underline focus:outline-none">
              Product Details & Care
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-gray-600 dark:text-gray-300 py-4">
              <p>
                Every ThriftX piece is handpicked from premium thrift collections —
                bringing you *top-brand quality* at *student-friendly prices*.  
                Made with a soft blend of **organic cotton** and **recycled fabrics**, our
                clothes ensure comfort, breathability, and durability for daily campus wear.
              </p>
              <p>
                <strong>Care Instructions:</strong>  
                Machine wash cold with similar colors. Avoid bleach.  
                Tumble dry low or hang dry to retain shape. Iron lightly if needed.  
                Wash responsibly — the planet (and your clothes) will thank you.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-b border-gray-300 dark:border-gray-700">
            <AccordionTrigger className="text-lg md:text-xl font-semibold text-left py-4 hover:no-underline focus:outline-none">
              Sizing & Fit Guide
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-gray-600 dark:text-gray-300 py-4">
              <p>
                Our pieces follow **modern, unisex fits** — perfect for college life.
                If you like a slightly oversized, casual streetwear look, go one size up.
                Prefer a snug fit? Stick to your regular size.
              </p>
              <p>
                Check our detailed size chart before checkout.  
                Still unsure? DM our team on Instagram — we’ll help you find your perfect fit!
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-b border-gray-300 dark:border-gray-700">
            <AccordionTrigger className="text-lg md:text-xl font-semibold text-left py-4 hover:no-underline focus:outline-none">
              Shipping & Delivery
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-gray-600 dark:text-gray-300 py-4">
              <p>
                We deliver pan-India 🌍 — from metros to campus towns.  
                Standard delivery takes **5–7 working days**, while **Express Delivery**
                reaches you in **2–3 days** for an extra fee.
              </p>
              <p>
                Once your order ships, you’ll receive a tracking link via email or WhatsApp.
                Every order is packed with love (and a little bit of thrift magic).
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-b border-gray-300 dark:border-gray-700">
            <AccordionTrigger className="text-lg md:text-xl font-semibold text-left py-4 hover:no-underline focus:outline-none">
              Returns & Exchanges
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-gray-600 dark:text-gray-300 py-4">
              <p>
                Not vibing with your pick? No worries — we got you.  
                You can **return or exchange** any ThriftX item within **7 days** of delivery,
                as long as it’s unworn, unwashed, and has the original tags.
              </p>
              <p>
                Refunds or replacements are processed within **3–5 business days**
                after we receive your item.  
                We want you to love your fit — no stress, no hassle.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-b border-gray-300 dark:border-gray-700">
            <AccordionTrigger className="text-lg md:text-xl font-semibold text-left py-4 hover:no-underline focus:outline-none">
              Sustainability Promise ♻️
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-gray-600 dark:text-gray-300 py-4">
              <p>
                At ThriftX, we believe in **style with purpose**.  
                Every product you buy gives a second life to quality fashion — reducing waste
                and supporting a circular economy.
              </p>
              <p>
                You’re not just shopping; you’re joining a movement for conscious college fashion.  
                Wear it proud. Wear it smart. 🌱
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Details;
