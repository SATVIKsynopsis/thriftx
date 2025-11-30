/**
 * Seller Business Logic Utilities
 * Core business functions for seller operations and profit calculations
 */

// Business constants for seller operations
const SELLER_BUSINESS_RULES = {
  minimumProfitMargin: 0.15, // 15% minimum profit margin
  maximumDiscountPercentage: 0.50, // 50% maximum discount
  minimumSellingPrice: 50, // ₹50 minimum selling price
  commissionRate: 0.10, // 10% platform commission
  bulkDiscountThreshold: 10, // Units for bulk pricing
  lowStockThreshold: 5, // Alert below this
  commissionPrecision: 2 // Decimal places for precision
};

/**
 * Calculates net profit for seller based on selling price and costs
 * @param {number} sellingPrice - Final customer price
 * @param {number} costPrice - Seller's acquisition cost
 * @param {number} additionalFees - Shipping, packaging, etc.
 * @returns {number} Net profit for seller after commission
 */
export const calculateSellerProfit = (sellingPrice, costPrice, additionalFees = 0) => {
  const platformCommission = sellingPrice * SELLER_BUSINESS_RULES.commissionRate;
  const netAfterCommission = sellingPrice - platformCommission;
  const totalCosts = costPrice + additionalFees;

  return Number((netAfterCommission - totalCosts).toFixed(SELLER_BUSINESS_RULES.commissionPrecision));
};

/**
 * Validates if a seller's pricing meets minimum profitability requirements
 * @param {number} sellingPrice - Customer price
 * @param {number} costPrice - Seller cost
 * @returns {boolean} True if meets minimum profit margin
 */
export const validateProfitMargin = (sellingPrice, costPrice) => {
  if (sellingPrice <= 0 || costPrice < 0) return false;

  const profitMargin = (sellingPrice - costPrice) / sellingPrice;
  return profitMargin >= SELLER_BUSINESS_RULES.minimumProfitMargin;
};

/**
 * Calculates recommended pricing to meet minimum profit requirements
 * @param {number} costPrice - Seller's acquisition cost
 * @returns {object} Recommended pricing information
 */
export const getRecommendedPricing = (costPrice) => {
  if (costPrice <= 0) {
    return {
      error: 'Invalid cost price',
      minimumSellingPrice: 0,
      recommendedSellingPrice: 0,
      profitMarginAtMinimum: 0,
      commissionAmount: 0
    };
  }

  // Calculate minimum selling price to achieve minimum profit margin
  const minSellingPrice = costPrice / (1 - SELLER_BUSINESS_RULES.minimumProfitMargin);
  const minimumSellingPrice = Math.ceil(minSellingPrice);

  // Recommended pricing adds 20% comfort margin
  const recommendedSellingPrice = Math.ceil(minSellingPrice * 1.2);

  const commissionAmount = Number((minimumSellingPrice * SELLER_BUSINESS_RULES.commissionRate).toFixed(SELLER_BUSINESS_RULES.commissionPrecision));

  return {
    minimumSellingPrice,
    recommendedSellingPrice,
    profitMarginAtMinimum: SELLER_BUSINESS_RULES.minimumProfitMargin * 100,
    commissionAmount,
    costPrice,
    netMarginAfterCommission: Number(((minimumSellingPrice - costPrice - commissionAmount) / minimumSellingPrice * 100).toFixed(2))
  };
};

/**
 * Validates discount amount against business rules and profitability
 * @param {number} originalPrice - Regular selling price
 * @param {number} discountedPrice - Discounted price
 * @param {number} costPrice - Seller's acquisition cost
 * @returns {object} Validation result with profitability analysis
 */
export const validateDiscount = (originalPrice, discountedPrice, costPrice = 0) => {
  if (originalPrice <= 0 || discountedPrice <= 0) {
    return {
      isValid: false,
      discountPercentage: 0,
      maxAllowedDiscount: 0,
      violates: true,
      error: 'Invalid prices'
    };
  }

  const discountPercentage = Number((((originalPrice - discountedPrice) / originalPrice) * 100).toFixed(2));
  const maxAllowedDiscount = Number((originalPrice * SELLER_BUSINESS_RULES.maximumDiscountPercentage).toFixed(2));

  // Check both discount limits AND profitability
  const violatesLimit = discountPercentage > SELLER_BUSINESS_RULES.maximumDiscountPercentage;
  const remainsProfitable = costPrice === 0 || validateProfitMargin(discountedPrice, costPrice);

  const platformCommission = Number((discountedPrice * SELLER_BUSINESS_RULES.commissionRate).toFixed(SELLER_BUSINESS_RULES.commissionPrecision));

  return {
    isValid: !violatesLimit && (costPrice === 0 || remainsProfitable),
    discountPercentage,
    maxAllowedDiscount,
    violates: violatesLimit,
    profitableAfterDiscount: costPrice === 0 || remainsProfitable,
    platformCommission,
    sellerReceivesAfterCommission: Number((discountedPrice - platformCommission).toFixed(2)),
    netProfitAfterDiscount: costPrice > 0 ? Number((discountedPrice - platformCommission - costPrice).toFixed(2)) : null,
    profitabilityWarning: costPrice > 0 && !remainsProfitable ? 'Discount may make this item unprofitable' : null
  };
};

/**
 * Calculates bulk pricing discounts for seller requirements
 * @param {number} basePrice - Unit price
 * @param {number} quantity - Total units
 * @returns {object} Bulk pricing calculation with seller profit analysis
 */
export const calculateBulkPricing = (basePrice, quantity) => {
  if (basePrice <= 0 || quantity <= 0) {
    return {
      error: 'Invalid pricing or quantity',
      originalTotal: 0,
      discountedTotal: 0,
      savings: 0,
      discountRate: 0,
      effectiveUnitPrice: 0
    };
  }

  let discountRate = 0;

  // Business rule: Higher discounts for larger quantities
  if (quantity >= SELLER_BUSINESS_RULES.bulkDiscountThreshold * 3) {
    discountRate = 0.15; // 15%
  } else if (quantity >= SELLER_BUSINESS_RULES.bulkDiscountThreshold * 2) {
    discountRate = 0.10; // 10%
  } else if (quantity >= SELLER_BUSINESS_RULES.bulkDiscountThreshold) {
    discountRate = 0.05; // 5%
  }

  const effectiveUnitPrice = Number((basePrice * (1 - discountRate)).toFixed(2));
  const originalTotal = Number((basePrice * quantity).toFixed(2));
  const discountedTotal = Number((effectiveUnitPrice * quantity).toFixed(2));

  return {
    originalTotal,
    discountedTotal,
    savings: Number((originalTotal - discountedTotal).toFixed(2)),
    discountRate: discountRate * 100,
    effectiveUnitPrice,
    quantity,
    totalCommission: Number((discountedTotal * SELLER_BUSINESS_RULES.commissionRate).toFixed(2)),
    sellerReceives: Number((discountedTotal * (1 - SELLER_BUSINESS_RULES.commissionRate)).toFixed(2))
  };
};

/**
 * Evaluates stock levels for seller operational decisions and profit impact
 * @param {number} currentStock - Current inventory
 * @param {number} dailySales - Average daily sales velocity
 * @param {number} costPrice - Cost price for stock value calculation
 * @returns {object} Stock evaluation with business intelligence
 */
export const evaluateStockHealth = (currentStock, dailySales, costPrice = 0) => {
  if (currentStock < 0 || dailySales < 0) {
    return {
      error: 'Invalid stock or sales data',
      urgency: 'unknown',
      recommendation: 'Please verify inventory data'
    };
  }

  const daysRemaining = dailySales > 0 ? currentStock / dailySales : Infinity;
  const isLowStock = currentStock <= SELLER_BUSINESS_RULES.lowStockThreshold;
  const isCriticalStock = currentStock <= 2;

  // Business intelligence for recommendations
  const stockValue = Number((currentStock * costPrice).toFixed(2));
  const estimatedReorderPoint = dailySales > 0 ? Math.ceil(dailySales * 30) : 30;
  const daysOfSupply = dailySales > 0 ? Math.round(daysRemaining) : null;

  let urgency = 'normal';
  let recommendation = 'Continue selling normally';
  let reorderUrgency = 'normal';
  let profitImpact = 'neutral';

  if (isCriticalStock) {
    urgency = 'critical';
    recommendation = 'Stop advertising, sell remaining stock immediately';
    reorderUrgency = 'immediate';
    profitImpact = 'high_risk';
  } else if (isLowStock) {
    urgency = 'warning';
    recommendation = 'Prepare reorder, reduce marketing spend, prioritize fast-selling items';
    reorderUrgency = 'high';
    profitImpact = 'moderate_risk';
  } else if (daysRemaining <= 14) {
    urgency = 'warning';
    recommendation = 'Monitor closely, plan reorder within 2 weeks';
    reorderUrgency = 'medium';
    profitImpact = 'low_risk';
  } else if (daysRemaining > 60) {
    urgency = 'warning';
    recommendation = 'Consider promotions, potentially overstocked';
    reorderUrgency = 'low';
    profitImpact = 'opportunity';
  }

  return {
    daysRemaining: daysOfSupply,
    isLowStock,
    isCriticalStock,
    urgency,
    recommendation,
    reorderUrgency,
    estimatedReorderPoint,
    stockValue,
    profitImpact,
    runRate: dailySales,
    stockoutRisk: daysOfSupply < 7 ? 'high' : daysOfSupply < 14 ? 'moderate' : 'low',
    revenueRunRate: Number((dailySales * (costPrice * SELLER_BUSINESS_RULES.minimumProfitMargin + costPrice)).toFixed(2))
  };
};
