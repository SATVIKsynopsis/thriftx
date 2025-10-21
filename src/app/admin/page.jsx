"use client";

import React from 'react';
import AdminLayout from '../../pages/admin/AdminLayout';

const Admin = () => {
  return (
    <AdminLayout 
      title="Dashboard"
      description="Overview of platform performance"
      breadcrumb="Dashboard"
    >
      {/* ✅ Your actual content goes here */}
      <div className="p-4">
        <h2 className="text-lg font-semibold">Welcome to the Admin Panel 👋</h2>
        <p className="text-gray-600 mt-2">Use the sidebar to manage vendors, products, and more.</p>
      </div>
    </AdminLayout>
  );
};

export default Admin;
