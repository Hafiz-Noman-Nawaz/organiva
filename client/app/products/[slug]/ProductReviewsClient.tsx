'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, MessageSquarePlus, X, Send, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface Review {
  _id?: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  city?: string;
  verifiedPurchase?: boolean;
  createdAt?: string;
}

interface ProductReviewsClientProps {
  productSlug: string;
  initialRating?: number;
  initialReviewCount?: number;
}

export function ProductReviewsClient({
  productSlug,
  initialRating = 5,
  initialReviewCount = 0,
}: ProductReviewsClientProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [totalCount, setTotalCount] = useState(initialReviewCount);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${productSlug}/reviews`);
      if (res.success && Array.isArray(res.reviews)) {
        setReviews(res.reviews);
        if (res.averageRating) setAverageRating(res.averageRating);
        if (typeof res.count === 'number') setTotalCount(res.count);
      }
    } catch (err) {
      console.warn('Could not fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setSubmitError('Please provide your name and review comment.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.post(`/products/${productSlug}/reviews`, {
        customerName: name.trim(),
        city: city.trim() || 'Pakistan',
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      if (res.success) {
        setSubmitSuccess(true);
        // Optimistically prepend review
        const newRev: Review = {
          customerName: name.trim(),
          city: city.trim() || 'Pakistan',
          rating,
          title: title.trim(),
          comment: comment.trim(),
          verifiedPurchase: true,
          createdAt: new Date().toISOString(),
        };
        setReviews([newRev, ...reviews]);
        setTotalCount((prev) => prev + 1);

        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          setName('');
          setCity('');
          setTitle('');
          setComment('');
          setRating(5);
        }, 2000);
      } else {
        setSubmitError(res.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error publishing review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 border-t border-[#5B755D]/15">
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B755D] flex items-center gap-1.5">
              <Sparkles size={14} /> Verified Buyer Feedback
            </span>
            <h3 className="text-2xl font-extrabold text-[#171A18] mt-1">
              Customer Reviews & Experiences
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#5B755D]/20 shadow-xs">
              <div className="flex text-[#D97706]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                    className={i < Math.round(averageRating) ? 'text-[#D97706]' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm font-black text-[#171A18]">
                {averageRating.toFixed(1)} / 5.0
              </span>
              <span className="text-xs text-[#7F8681]">({totalCount})</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#1F3524] hover:bg-[#2d4b33] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <MessageSquarePlus size={15} />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-gray-100 rounded-2xl border border-gray-200"></div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#5B755D]/15">
            <p className="text-sm text-[#525B54]">No reviews yet for this product.</p>
            <p className="text-xs text-[#7F8681] mt-1">Be the first verified customer to share your feedback!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-5 py-2.5 bg-[#5B755D] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageSquarePlus size={15} /> Write the First Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev, idx) => (
              <div
                key={rev._id || idx}
                className="bg-white p-6 rounded-2xl border border-[#5B755D]/15 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-[#D97706]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? 'text-[#D97706]' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    {rev.verifiedPurchase !== false && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B755D] bg-[#EBF1EB] px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Verified Buyer
                      </span>
                    )}
                  </div>

                  {rev.title && (
                    <h4 className="text-sm font-bold text-[#171A18] mb-1.5 line-clamp-1">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-xs text-[#525B54] leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#5B755D]/10 flex items-center justify-between text-[11px] text-[#7F8681]">
                  <span className="font-bold text-[#171A18]">{rev.customerName}</span>
                  <span>{rev.city || 'Verified Customer'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#5B755D]/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-[#171A18]">Write a Review</h3>
                <p className="text-xs text-[#7F8681] mt-0.5">Share your feedback with fellow shoppers in Pakistan</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="text-base font-bold text-[#171A18]">Review Published!</h4>
                <p className="text-xs text-[#525B54]">
                  Thank you for helping other buyers make informed home choices.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 mt-5">
                {submitError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1.5">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          size={24}
                          fill={(hoverRating || rating) >= star ? '#D97706' : 'none'}
                          className={(hoverRating || rating) >= star ? 'text-[#D97706]' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-[#7F8681] ml-2">
                      {rating === 5 ? 'Excellent (5/5)' : `${rating} Stars`}
                    </span>
                  </div>
                </div>

                {/* Full Name & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171A18] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bilal Ahmed"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#5B755D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171A18] mb-1">
                      City / Area
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lahore (DHA)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#5B755D]"
                    />
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Highly practical and genuinely airtight!"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#5B755D]"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    Your Honest Experience *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked, how it performs, and how delivery was..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#5B755D] resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#1F3524] hover:bg-[#2d4b33] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    {submitting ? (
                      <span>Publishing...</span>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
