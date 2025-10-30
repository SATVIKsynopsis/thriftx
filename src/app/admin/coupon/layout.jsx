import AdminLayout from '@/components/admin/AdminLayout';

export default function CouponLayout({ children }) {
  return (
    <AdminLayout title="Create Coupon" breadcrumb="Coupons">
      {children}
    </AdminLayout>
  );
}
