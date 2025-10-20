'use client';

import ProductDetailComponent from '@/pages/ProductDetailComponent'
import React from 'react'
import { useParams } from 'next/navigation'

const ProductDetail = () => {
  const params = useParams()
  const productId = params.id

  return (
    <div>
      <ProductDetailComponent productId={productId} />
    </div>
  )
}

export default ProductDetail
