"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import {
  MoreHorizontal,
  Plus,
  CheckCircle2,
  Ban,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CreateCouponForm from "./CreateCouponForm";
import Pagination from "@/components/common/Pagination";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


const getStatusStyle = (status) =>
({
  active: "bg-green-100 text-green-700 border border-green-300",
  expired: "bg-red-100 text-red-700 border border-red-300",
  disabled: "bg-gray-100 text-gray-700 border border-gray-300",
}[status] || "");


const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const q = query(collection(db, "coupons"), orderBy("createdDate", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setCoupons(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });
    return () => unsub();
  }, []);

  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCoupons = coupons.slice(startIndex, startIndex + itemsPerPage);

  const paginationInfo = {
    totalPages,
    currentPage,
  };

  const handleStatusChange = async (index, newStatus) => {
    const coupon = currentCoupons[index];
    if (!coupon?.id) return;
    await updateDoc(doc(db, "coupons", coupon.id), { status: newStatus });
  };

  const handleDelete = async (index) => {
    const coupon = currentCoupons[index];
    if (!coupon?.id) return;
    await deleteDoc(doc(db, "coupons", coupon.id));
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // reset to first page on change
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Coupons
        </h2>
        {/* Dialog for popup */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Coupon
            </Button>
          </DialogTrigger>

          <DialogContent
            className="max-w-2xl p-0 bg-transparent border-none shadow-none"
            // Custom backdrop color
            style={{
              backgroundColor: "rgba(0,0,0,0.85)", // black background with 85% opacity
              backdropFilter: "blur(4px)", // optional subtle blur
            }}
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  Create New Coupon
                </DialogTitle>
              </DialogHeader>
              <CreateCouponForm />
            </div>
          </DialogContent>
        </Dialog>
      </div>


      {/* Coupon Table */}
      {/* Coupon Table */}
      <Card className="p-4 border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left font-medium">#</th>
                <th className="px-4 py-2 text-left font-medium">Code</th>
                <th className="px-4 py-2 text-left font-medium">Description</th>
                <th className="px-4 py-2 text-left font-medium">Discount</th>
                <th className="px-4 py-2 text-left font-medium">Min Order</th>
                <th className="px-4 py-2 text-left font-medium">Created</th>
                <th className="px-4 py-2 text-left font-medium">Expires</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCoupons.map((coupon, i) => {
                const globalIndex = startIndex + i; // absolute index across pages
                const serialNumber = globalIndex + 1; // starts from 1

                return (
                  <tr
                    key={globalIndex}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    {/* Number Column */}
                    <td className="px-4 py-2 text-gray-600 font-medium">
                      {serialNumber}
                    </td>

                    <td className="px-4 py-2 font-medium">{coupon.code}</td>
                    <td className="px-4 py-2">{coupon.description}</td>
                    <td className="px-4 py-2">
                      {coupon.discountType === "percent"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </td>
                    <td className="px-4 py-2">₹{coupon.minOrderValue}</td>
                    <td className="px-4 py-2">{coupon.createdDate}</td>
                    <td className="px-4 py-2">{coupon.expiryDate}</td>
                    <td className="px-4 py-2">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full capitalize",
                          getStatusStyle(coupon.status)
                        )}
                      >
                        {coupon.status}
                      </span>
                    </td>

                    {/* Action Menu */}
                    <td className="px-4 py-2 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-100"
                          >
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {coupon.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(globalIndex, "disabled")
                              }
                              className="text-yellow-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Disable Coupon
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(globalIndex, "active")
                              }
                              className="text-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Enable Coupon
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(globalIndex)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Coupon
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (same as before) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Rows per page:</span>
            <Select
              defaultValue={String(itemsPerPage)}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalPages > 1 && (
            <Pagination
              paginationInfo={paginationInfo}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default CouponList;
