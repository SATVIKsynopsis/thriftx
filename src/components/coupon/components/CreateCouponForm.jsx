"use client";

import React, { useState } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CreateCouponForm = () => {
  const [coupon, setCoupon] = useState({
    code: "",
    description: "",
    discountType: "flat",
    discountValue: "",
    minOrderValue: "",
    expiryDate: "",
  });

  const handleChange = (e) => {
    setCoupon({ ...coupon, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setCoupon({ ...coupon, discountType: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "coupons"), {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderValue: Number(coupon.minOrderValue),
        createdDate: new Date().toISOString().slice(0, 10),
        status: "active",
        timestamp: serverTimestamp(),
      });
      alert(`Coupon "${coupon.code}" created successfully!`);
      setCoupon({
        code: "",
        description: "",
        discountType: "flat",
        discountValue: "",
        minOrderValue: "",
        expiryDate: "",
      });
    } catch (err) {
      console.error("Coupon creation error:", err);
      if (err && err.message) {
        alert("Failed to create coupon: " + err.message);
      } else {
        alert("Failed to create coupon. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-2 dark:text-white text-black ">
      {/* Coupon Code */}
      <div className="space-y-2">
        <Label htmlFor="code">Coupon Code</Label>
        <Input
          id="code"
          name="code"
          placeholder="e.g. SAVE10"
          value={coupon.code}
          onChange={handleChange}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Short description"
          value={coupon.description}
          onChange={handleChange}
          required
        />
      </div>

      {/* Discount Type */}
      <div className="space-y-2">
        <Label htmlFor="discountType">Discount Type</Label>
        <Select
          onValueChange={handleSelectChange}
          defaultValue={coupon.discountType}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat</SelectItem>
            <SelectItem value="percent">Percent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Discount Value */}
      <div className="space-y-2">
        <Label htmlFor="discountValue">Discount Value</Label>
        <Input
          type="number"
          id="discountValue"
          name="discountValue"
          placeholder="Enter value"
          value={coupon.discountValue}
          onChange={handleChange}
          required
        />
      </div>

      {/* Minimum Order Value */}
      <div className="space-y-2">
        <Label htmlFor="minOrderValue">Minimum Order Value</Label>
        <Input
          type="number"
          id="minOrderValue"
          name="minOrderValue"
          placeholder="e.g. 500"
          value={coupon.minOrderValue}
          onChange={handleChange}
          required
        />
      </div>

      {/* Expiry Date */}
      <div className="space-y-2">
        <Label htmlFor="expiryDate">Expiry Date</Label>
        <Input
          type="date"
          id="expiryDate"
          name="expiryDate"
          value={coupon.expiryDate}
          onChange={handleChange}
          required
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full mt-4">
        Create Coupon
      </Button>
    </form>
  );
};

export default CreateCouponForm;
