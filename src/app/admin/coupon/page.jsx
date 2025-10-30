"use client"

import React, { useEffect, useState } from 'react';
import CouponCreateForm from '@/components/admin/CouponCreateForm';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function CouponPage() {
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    const fetchSellers = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'seller'));
      const snap = await getDocs(q);
      setSellers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    };
    fetchSellers();
  }, []);

  return (
    <div>
      <CouponCreateForm sellers={sellers} />
      {/* Debug: Show fetched sellers */}
      <div style={{marginTop: 32, background: '#f8fafc', padding: 16, borderRadius: 8}}>
        <h3 style={{fontWeight: 'bold'}}>Debug: Sellers Fetched</h3>
        {sellers.length === 0 ? (
          <div style={{color: 'red'}}>No sellers found.</div>
        ) : (
          <ul style={{fontSize: 14}}>
            {sellers.map(s => (
              <li key={s.uid}>
                <b>{s.name}</b> ({s.uid}) {s.email ? `- ${s.email}` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
