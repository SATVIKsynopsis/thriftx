import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import ReviewForm from './ReviewForm';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const RatingSection = ({ product, className = "" }) => {
  const { currentUser } = useAuth();

  //States
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const faqs = [
    {
      question: "What are your shipping options?",
      answer: "We offer free standard shipping on all orders over ₹500. Standard shipping within Srinagar and other major cities in J&K typically takes 3-5 business days. Expedited shipping options are also available at checkout for an additional fee."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order has been shipped, you will receive an email with a tracking number and a link to the courier's website. You can use this information to track the status of your delivery."
    },
    {
      question: "What is your return policy?",
      answer: "We have a 30-day return policy. Items must be returned in their original condition, unworn and with all tags attached. To start a return, please visit our returns portal or contact customer service."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards, UPI, and other popular online payment methods available in India. All transactions are secure and encrypted."
    }
  ];

  // Fetch reviews 
  useEffect(() => {
    if (!product?.id) return;

    setLoading(true);
    const reviewsRef = collection(db, 'products', product.id, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      }));
      setReviews(reviewsData);
      setLoading(false);
    });


    return () => unsubscribe();
  }, [product?.id]);

  //Review Handler
  const handleReviewSubmit = async ({ rating, text }) => {
    if (!currentUser) return alert("Please log in to write a review.");
    if (!product?.id) return;

    setSubmitting(true);
    try {
      const reviewsRef = collection(db, 'products', product.id, 'reviews');
      await addDoc(reviewsRef, {
        rating,
        text,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || 'Anonymous',
        createdAt: serverTimestamp(),
      });
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error adding review: ", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Stars
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  if (!product) return null;

  return (
    <>
      {/* Review Form */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <ReviewForm
            submitting={submitting}
            onSubmit={handleReviewSubmit}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      <div className={className}>
        {/* Tab Navigation */}
        <div className="border-b border-gray-300 dark:border-gray-800 mb-6 lg:mb-8 transition-colors">
          <div className="flex gap-4 sm:gap-8 overflow-x-auto">
            {[
              { id: 'details', label: 'Product Details' },
              { id: 'reviews', label: `Rating & Reviews (${product.reviewCount || reviews.length})` },
              { id: 'faqs', label: 'FAQs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 sm:pb-4 px-1 whitespace-nowrap text-sm sm:text-base font-medium transition-all ${activeTab === tab.id
                  ? 'border-b-2 border-indigo-500 dark:border-white text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Customer Reviews
              </h2>
              {currentUser ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors dark:bg-lime-500 dark:text-black dark:hover:bg-lime-600"
                >
                  Write a Review
                </button>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Login</Link> to write a review.
                </p>
              )}
            </div>

            {/* Reviews Grid */}
            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-400">Loading reviews...</p>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-300 dark:border-gray-800">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{review.userName}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">"{review.text}"</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Posted on {review.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No Reviews Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Be the first to share your thoughts on this product!</p>
              </div>
            )}
          </div>
        )}

        {/* Product Details  */}
        {activeTab === 'details' && (
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
            <p>
              {product.description || "No product description available."}
            </p>
          </div>
        )}
        {/* FAQs Tab Content */}
        {activeTab === 'faqs' && (
          <div className="max-w-5xl mx-auto my-20">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-300 dark:border-gray-700">
                  <AccordionTrigger className="flex justify-between items-center text-left text-base font-semibold text-gray-800 dark:text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </>
  );
};

export default RatingSection;