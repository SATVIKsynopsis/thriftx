"use client"
import DashboardComponent from '@/components/seller/DashboardComponent';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const CouponApprovalList = dynamic(() => import('@/components/seller/CouponApprovalList'), { ssr: false });

const Dashboard = () => {
  const [showCoupons, setShowCoupons] = useState(false);

  return (
    <>
      <DashboardComponent onShowCoupons={() => setShowCoupons(true)} />
      {showCoupons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowCoupons(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <CouponApprovalList />
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
