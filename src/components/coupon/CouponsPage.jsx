import React from "react";
import ApplyCoupon from "./components/ApplyCoupon";
import CouponList from "./components/CouponList";
import CreateCouponForm from "./components/CreateCouponForm";
import AdminLayout from "../admin/AdminLayout";

const CouponsPage = () => {
  return (
    <AdminLayout
      title="Coupons"
      description="Manage all discount coupons for your store"
      breadcrumb="Coupons"
    >
      <div className="space-y-10">
        <CouponList />
        <ApplyCoupon />
      </div>
    </AdminLayout>
  )
}

export default CouponsPage



