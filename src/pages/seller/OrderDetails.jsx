"use client";

import React, { useEffect, useState, Fragment } from 'react';
import Link from 'next/link';
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatPrice } from '@/utils/formatters';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown,  Calendar,Phone, Mail, MapPin } from 'lucide-react';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderDetailsComponent = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrder(orderSnap.data());
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);
   const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleStatusChange = async (newStatus) => {
    if (!order) return;
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
      alert('Order status updated!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading order..." />;
  if (!order) return <p className="text-center text-gray-500 mt-8">Order not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/seller/orders" className="text-blue-600 mb-4 inline-block">
          &larr; Back to Orders
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold mb-4">Order #{orderId.slice(-8)}</h1>

          <div className="flex flex-col md:flex-row md:justify-between gap-6">
            
            {/*Order Info & Items */}
            <div className="flex-1">
              {/* Status Dropdown */}
              <div className="w-48 mb-4">
                <Listbox value={order.status} onChange={handleStatusChange}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-100 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none sm:text-sm">
                      <span className="block truncate">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </span>
                    </Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                        {statusOptions.map(status => (
                          <Listbox.Option
                            key={status}
                            className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`}
                            value={status}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                                {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"><Check className="h-5 w-5" /></span>}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>

              {/* Total */}
              <p className="text-gray-700 mb-4"><strong>Total:</strong> {formatPrice(order.total)}</p>

              {/* Items */}
              <h2 className="text-xl font-semibold mb-2">Items</h2>
              <ul className="space-y-3 border-t border-gray-200 pt-3">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-center">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                    )}
                    <div>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-gray-500">{item.quantity} x {formatPrice(item.price)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4 space-y-2">
                <h2 className="text-xl font-semibold mb-2">Buyer Information</h2>
                {order.buyerInfo?.phone && (
                <div className="flex items-center gap-2 text-gray-700">
               <Phone size={16} className="text-gray-500" />
               <span>{order.buyerInfo.phone}</span>
            </div>
                )}
                {order.buyerInfo?.email && (
                <div className="flex items-center gap-2 text-gray-700">
                   <Mail size={16} className="text-gray-500" />
                   <span>{order.buyerInfo.email}</span>
                </div>
                )}
               {order.buyerInfo?.address && (
                <div className="flex items-start gap-2 text-gray-700">
                   <MapPin size={16} className="text-gray-500" />
                   <span>{order.buyerInfo.address}</span>
                </div>
                )}
                </div>
                </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsComponent;
