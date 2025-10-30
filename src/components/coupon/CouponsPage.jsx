import React from "react";
import CouponList from "./components/CouponList";
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
      </div>
    </AdminLayout>
  )
}

export default CouponsPage



