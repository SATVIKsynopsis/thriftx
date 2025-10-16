import React, { useState, useEffect, Fragment } from 'react';
import { 
  collection, query, where, getDocs, orderBy, doc, updateDoc 
} from 'firebase/firestore';
import { Package, Calendar, IndianRupee, User, Check, ChevronDown } from 'lucide-react';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Listbox, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';

const statusOptions = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('sellerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === activeFilter));
    }
  }, [activeFilter, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    try {
      await updateDoc(orderRef, { status: newStatus });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert('Order status updated!');
    } catch (error) {
      console.error("Error updating status: ", error);
      alert('Failed to update status.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
          <p className="text-gray-500 mt-1">View, track, and update the status of all your sales.</p>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-semibold transition ${
                activeFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching your orders..." />
        ) : filteredOrders.length > 0 ? (
          
          <div className="flex flex-col gap-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="block">
                <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
                  
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                <Link to={`/seller/orders/${order.id}`} className="hover:text-blue-600">
                  Order #{order.id.slice(-8)}
                </Link>
              </h3>
              <div className="flex flex-wrap gap-4 text-gray-500 text-sm items-center">
                <div className="flex items-center gap-1"><Calendar size={16} />{formatDate(order.createdAt)}</div>
                <div className="flex items-center gap-1"><IndianRupee size={16} />{formatPrice(order.total)}</div>
                <div className="flex flex-col text-gray-600 text-sm mt-1 md:mt-0">
                  <div className="flex items-center gap-1">
                    <User size={16} /> {order.buyerInfo?.firstName} {order.buyerInfo?.lastName || ''}
                  </div>
                </div>

              </div>
                    </div>

                    {/* Status Dropdown  */}
                    <div className="w-40">
                      <Listbox value={order.status} onChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                        <div className="relative mt-1">
                          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-100 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none sm:text-sm">
                            <span className="block truncate">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                              {statusOptions.slice(1).map((status) => (
                                <Listbox.Option
                                  key={status}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                    }`
                                  }
                                  value={status}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                          <Check className="h-5 w-5" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="text-gray-700 font-medium mb-2">Items:</h4>
                    <ul className="space-y-3 border-l-2 border-gray-200 pl-4">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex gap-4 items-center">
                          <img 
                            src={item.productImage} 
                            alt={item.productName} 
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{item.productName}</p>
                            <p className="text-gray-500 text-sm">{item.quantity} x ₹{item.price}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-700">
              No {activeFilter !== 'all' && activeFilter} orders found.
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
