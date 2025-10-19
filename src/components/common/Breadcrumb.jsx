"use client";

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { getBreadcrumbData } from '@/utils/navigationContextUtils';

const Breadcrumb = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Don't show breadcrumb on home page
  if (pathname === '/') {
    return null;
  }

  const generateBreadcrumbs = () => {
    const breadcrumbs = [];
    const pathSegments = pathname.split('/').filter(Boolean);

    // Add Home as the first breadcrumb
    breadcrumbs.push({
      name: 'Home',
      href: '/',
      icon: Home,
      isActive: false
    });

    // Generate breadcrumbs based on current route
    if (pathname.startsWith('/browse')) {
      breadcrumbs.push({
        name: 'Browse All Products',
        href: '/browse',
        isActive: pathname === '/browse'
      });
    }

    else if (pathname.startsWith('/search')) {
      const searchQuery = searchParams.get('q');
      breadcrumbs.push({
        name: searchQuery ? `Search: "${searchQuery}"` : 'Search Results',
        href: pathname,
        isActive: true
      });
    }

    else if (pathname.startsWith('/category')) {
      breadcrumbs.push({
        name: 'Category',
        href: '/category',
        isActive: pathname === '/category'
      });
    }

    else if (pathname.startsWith('/product/')) {
      // For product pages, use the new navigation context system
      const contextData = getBreadcrumbData();

      if (contextData) {
        breadcrumbs.push(contextData);
      }

      breadcrumbs.push({
        name: 'Product Details',
        href: pathname,
        isActive: true
      });
    }

    else if (pathname.startsWith('/wishlist')) {
      breadcrumbs.push({
        name: 'Wishlist',
        href: '/wishlist',
        isActive: pathname === '/wishlist'
      });
    }

    else if (pathname.startsWith('/cart')) {
      breadcrumbs.push({
        name: 'Cart',
        href: '/cart',
        isActive: pathname === '/cart'
      });
    }

    else if (pathname.startsWith('/profile')) {
      breadcrumbs.push({
        name: 'Profile',
        href: '/profile',
        isActive: pathname === '/profile'
      });
    }

    else if (pathname.startsWith('/orders')) {
      breadcrumbs.push({
        name: 'Orders',
        href: '/orders',
        isActive: pathname === '/orders'
      });
    }

    return breadcrumbs;
  };



  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = breadcrumb.icon;

        return (
          <React.Fragment key={`${breadcrumb.href}-${index}`}>
            {index > 0 && (
              <ChevronRight size={16} className="text-gray-500" />
            )}

            {isLast ? (
              <span className="font-medium text-gray-200 flex items-center gap-2">
                {Icon && <Icon size={16} />}
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                {Icon && <Icon size={16} />}
                {breadcrumb.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
