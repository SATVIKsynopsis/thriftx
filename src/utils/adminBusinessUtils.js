/**
 * Admin Business Logic Utilities
 * Core business functions for admin operations, vendor management, and platform oversight
 */

// Platform business constants for admin operations
const PLATFORM_RULES = {
  commissionRate: 0.10, // 10% platform commission
  maxCouponDiscount: 0.30, // 30% maximum coupon discount
  minVendorRating: 4.0, // Minimum vendor rating for approval
  revenueShareCap: 0.15, // Maximum platform revenue share
  fraudDetectionThreshold: 0.95, // 95% similarity threshold
  qualityInspectionCycles: 30, // Days between quality inspections
  vendorBlacklistScore: 50 // Points to trigger vendor suspension
};

/**
 * Validates vendor application for marketplace access
 * @param {object} application - Vendor application data
 * @returns {object} Validation result with approval/rejection details
 */
export const validateVendorApplication = (application) => {
  const issues = [];
  let score = 100; // Start with perfect score

  if (!application.businessLicense) {
    issues.push('Missing business license');
    score -= 25;
  }

  if (!application.taxId) {
    issues.push('Missing tax identification');
    score -= 20;
  }

  if (!application.addressProof) {
    issues.push('Missing address verification');
    score -= 15;
  }

  if (application.sampleProducts?.length < 3) {
    issues.push('Insufficient product samples (minimum 3 required)');
    score -= 10;
  }

  if (application.expectedRevenue < 50000) {
    issues.push('Business plan shows insufficient revenue potential');
    score -= 15;
  }

  if (application.backgroundIssues) {
    issues.push('Background check issues detected');
    score = Math.max(0, score - 50); // Automatic rejection factor, don't go below 0
  }

  const isApproved = score >= 70 && issues.length < 3;
  const riskLevel = score >= 85 ? 'low' : score >= 70 ? 'medium' : 'high';

  return {
    isApproved,
    score,
    riskLevel,
    issues,
    recommendations: isApproved
      ? ['Monitor sales closely first 30 days', `Complete quality inspection within ${PLATFORM_RULES.qualityInspectionCycles} days`]
      : ['Re-submit with missing documentation', 'Address flagged issues', 'Consider re-evaluation in 90 days']
  };
};

/**
 * Validates coupon creation requests from admins
 * @param {object} couponRequest - Coupon configuration
 * @returns {object} Validation result with approval/rejection
 */
export const validateCouponRequest = (couponRequest) => {
  const issues = [];

  if (!couponRequest || typeof couponRequest !== 'object') {
    return {
      isValid: false,
      issues: ['Invalid coupon request data'],
      riskAssessment: { category: 'general', potentialSavingsPerUse: 0, estimatedTotalBenefit: 0, recommendedApproval: 'deny' }
    };
  }

  // Business rule validations
  if (couponRequest.discountType === 'percentage' && couponRequest.value > PLATFORM_RULES.maxCouponDiscount * 100) {
    issues.push(`Discount exceeds maximum allowed (${PLATFORM_RULES.maxCouponDiscount * 100}%)`);
  }

  if (couponRequest.discountType === 'fixed' && couponRequest.value > 10000) {
    issues.push('Fixed discount amount too high (max ₹10,000)');
  }

  // Usage limitation checks
  if (couponRequest.maxUses < 1) {
    issues.push('Maximum uses must be at least 1');
  }

  if (couponRequest.minPurchase > 50000) {
    issues.push('Minimum purchase requirement too high (max ₹50,000)');
  }

  // Validity period checks
  if (couponRequest.startDate && couponRequest.expiryDate) {
    const duration = Math.ceil((new Date(couponRequest.expiryDate) - new Date(couponRequest.startDate)) / (1000 * 60 * 60 * 24));
    if (duration > 365) {
      issues.push('Coupon validity period too long (max 1 year)');
    }
    if (duration < 1) {
      issues.push('Coupon validity period too short (minimum 1 day)');
    }
    if (duration <= 0) {
      issues.push('Expiry date must be after start date');
    }
  } else {
    issues.push('Start and expiry dates are required');
  }

  const isValid = issues.length === 0;
  const category = couponRequest.category || 'general';
  const potentialSavingsPerUse = calculateCouponSavingsPotential(couponRequest);
  const estimatedTotalBenefit = couponRequest.maxUses * potentialSavingsPerUse;

  return {
    isValid,
    issues,
    riskAssessment: {
      category,
      potentialSavingsPerUse,
      estimatedTotalBenefit,
      recommendedApproval: isValid && couponRequest.maxUses <= 100 ? 'auto' : couponRequest.maxUses <= 1000 ? 'manual' : 'deny'
    }
  };
};

/**
 * Calculates potential coupon savings impact
 * @param {object} coupon - Coupon configuration
 * @returns {number} Average savings per use
 */
const calculateCouponSavingsPotential = (coupon) => {
  if (!coupon || !coupon.discountType) return 0;

  if (coupon.discountType === 'percentage') {
    return (coupon.estimatedAvgOrderValue || 2000) * (coupon.value / 100);
  } else if (coupon.discountType === 'fixed') {
    return coupon.value;
  }
  return 0;
};

/**
 * Evaluates platform financial performance metrics
 * @param {object} periodData - Revenue data for analysis period
 * @returns {object} Comprehensive performance analysis
 */
export const analyzePlatformPerformance = (periodData) => {
  if (!periodData || typeof periodData !== 'object') {
    return {
      error: 'Invalid period data',
      financials: { totalRevenue: 0 },
      operations: { transactionCount: 0 },
      risks: { riskLevel: 'unknown' },
      recommendations: ['Please provide valid period data']
    };
  }

  const totalRevenue = periodData.revenue?.total || 0;
  const totalCommission = periodData.commission?.total || 0;
  const transactionCount = periodData.transactions?.count || 0;
  const vendorCount = periodData.vendors?.active || 0;
  const previousPeriodRevenue = periodData.revenue?.previousPeriod || 0;
  const chargebackCount = periodData.chargebacks?.count || 0;
  const vendorLeftCount = periodData.vendors?.left || 0;
  const operationsCostPerTransaction = periodData.costs?.operations || 0;

  const revenueGrowth = calculateGrowthRate(previousPeriodRevenue, totalRevenue);
  const commissionMargin = transactionCount > 0 ? (totalCommission / totalRevenue) * 100 : 0;
  const averageOrderValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;
  const revenuePerVendor = vendorCount > 0 ? totalRevenue / vendorCount : 0;

  // Platform efficiency metrics
  const operationalCosts = operationsCostPerTransaction * transactionCount;
  const netProfit = totalCommission - operationalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Risk indicators
  const chargebackRate = transactionCount > 0 ? (chargebackCount / transactionCount) * 100 : 0;
  const vendorChurnRate = vendorCount > 0 ? (vendorLeftCount / vendorCount) * 100 : 0;

  return {
    financials: {
      totalRevenue,
      netProfit,
      profitMargin,
      commissionMargin,
      revenueGrowth
    },
    operations: {
      transactionCount,
      averageOrderValue,
      revenuePerVendor,
      vendorCount
    },
    risks: {
      chargebackRate,
      vendorChurnRate,
      operationalCosts,
      riskLevel: chargebackRate > 1.5 ? 'high' : chargebackRate > 0.8 ? 'medium' : 'low'
    },
    recommendations: generatePlatformRecommendations({
      revenueGrowth,
      profitMargin,
      chargebackRate,
      vendorChurnRate
    })
  };
};

/**
 * Calculates growth rate between periods
 * @param {number} previous - Previous period value
 * @param {number} current - Current period value
 * @returns {number} Growth rate as percentage
 */
const calculateGrowthRate = (previous, current) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

/**
 * Generates actionable recommendations for platform management
 * @param {object} metrics - Platform performance metrics
 * @returns {Array} List of prioritized recommendations
 */
const generatePlatformRecommendations = (metrics) => {
  const recommendations = [];

  if (metrics.revenueGrowth < 5) {
    recommendations.push('🚨 Revenue growth below target - implement marketing initiatives');
  }

  if (metrics.profitMargin < 15) {
    recommendations.push('⚠️ Profit margins below target - review commission rates or costs');
  }

  if (metrics.chargebackRate > 1) {
    recommendations.push('🔴 Chargeback rate concerning - enhance fraud prevention');
  }

  if (metrics.vendorChurnRate > 20) {
    recommendations.push('🟡 Vendor churn elevated - improve vendor support programs');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Platform performance satisfactory - continue current strategy');
  }

  return recommendations;
};

/**
 * Validates order dispute resolution processes
 * @param {object} dispute - Order dispute details
 * @returns {object} Validation and resolution guidance
 */
export const validateDisputeResolution = (dispute) => {
  if (!dispute || typeof dispute !== 'object') {
    return {
      error: 'Invalid dispute data',
      recommendedAction: 'investigate',
      refundAmount: 0,
      priority: 'low',
      escalationRequired: false
    };
  }

  const issueType = dispute.type || 'general';
  const orderValue = dispute.orderValue || 0;
  const disputeAge = dispute.daysSinceOrder || 0;

  let recommendedAction = 'investigate';
  let refundAmount = 0;
  let resolutionTimeframe = '7 days';
  let priority = 'medium';

  // Business rules for different dispute types
  switch (issueType) {
    case 'quality':
      if (orderValue > 5000) {
        priority = 'high';
        refundAmount = orderValue * 0.5; // 50% refund for high-value quality issues
        recommendedAction = 'partial_refund'; // Changed to match test expectation
      } else {
        refundAmount = orderValue * 0.3; // 30% refund for standard quality issues
        recommendedAction = 'partial_refund';
      }
      break;

    case 'shipping_delayed':
      priority = 'low';
      refundAmount = Math.min(orderValue * 0.1, 200); // Max ₹200 for shipping delays
      recommendedAction = disputeAge > 7 ? 'small_refund' : 'shipping_credit';
      break;

    case 'product_mismatch':
      refundAmount = orderValue; // Full refund for wrong product
      recommendedAction = 'full_refund';
      priority = 'high';
      break;

    case 'missing_item':
      refundAmount = orderValue * 0.2; // 20% refund + reship if applicable
      recommendedAction = 'partial_refund_reship';
      priority = 'medium';
      break;

    default:
      recommendedAction = 'escalate_to_management';
      priority = 'high';
  }

  // Fraud risk assessment
  const fraudRisk = assessFraudRisk(dispute);
  if (fraudRisk.score > 80) {
    recommendedAction = 'deny';
    refundAmount = 0;
  }

  return {
    recommendedAction,
    refundAmount: Math.min(refundAmount, orderValue), // Never exceed order value
    priority,
    resolutionTimeframe,
    fraudRisk,
    escalationRequired: priority === 'high' || fraudRisk.score > 60
  };
};

/**
 * Assesses fraud risk for dispute claims
 * @param {object} dispute - Dispute claim data
 * @returns {object} Fraud risk assessment
 */
export const assessFraudRisk = (dispute) => {
  let score = 0;

  // Risk factors that increase fraud score
  if (dispute.customerHasMultipleDisputes) score += 25;
  if (dispute.vendorHasNoPriorComplaints) score += 20;
  if (dispute.photoEvidenceProvided) score -= 30; // Evidence reduces risk
  if (dispute.thirdPartyVerification) score -= 20; // Verification reduces risk
  if (dispute.disputeAge < 2) score += 15; // Very quick claims suspicious
  if (dispute.customerAccountNew) score += 10; // New accounts higher risk

  const riskLevel = score >= 70 ? 'high' : score >= 40 ? 'medium' : score >= 0 ? 'low' : 'low';
  const finalScore = Math.min(Math.max(score, 0), 100);

  return {
    score: finalScore,
    riskLevel,
    requiresInvestigation: finalScore > 30,
    automaticDenial: finalScore > 80
  };
};
