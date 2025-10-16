import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';


const levenshteinDistance = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
        for (let i = 1; i <= len1; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }

    return matrix[len2][len1];
};

//   Fuzzy matching with scoring
const fuzzyMatch = (searchTerm, text, threshold = 0.6) => {
    if (!searchTerm || !text) return { matches: false, score: 0 };

    const search = searchTerm.toLowerCase().trim();
    const target = text.toLowerCase();

    // Exact match
    if (target === search) return { matches: true, score: 100 };

    // Contains search term
    if (target.includes(search)) {
        const position = target.indexOf(search);
        const positionScore = 1 - (position / target.length);
        const score = 80 + (20 * positionScore);
        return { matches: true, score };
    }

    // Word boundary match
    const words = target.split(/\s+/);
    for (const word of words) {
        if (word.startsWith(search)) {
            return { matches: true, score: 70 };
        }
    }

    // Fuzzy match using Levenshtein distance
    const distance = levenshteinDistance(search, target);
    const maxLength = Math.max(search.length, target.length);
    const similarity = 1 - (distance / maxLength);

    if (similarity >= threshold) {
        return { matches: true, score: similarity * 60 };
    }

    // Check individual words
    for (const word of words) {
        const wordDistance = levenshteinDistance(search, word);
        const wordSimilarity = 1 - wordDistance / Math.max(search.length, word.length);
        if (wordSimilarity >= threshold) {
            return { matches: true, score: wordSimilarity * 50 };
        }
    }

    return { matches: false, score: 0 };
};

/**
 * Search products across multiple fields with weighted scoring
 */
const searchProducts = (products, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) {
        return products.map(p => ({ ...p, searchScore: 100 }));
    }

    const results = products.map(product => {
        let totalScore = 0;
        let matches = false;

        // Search in name (weight: 50%)
        const nameMatch = fuzzyMatch(searchTerm, product.name || '');
        if (nameMatch.matches) {
            matches = true;
            totalScore += nameMatch.score * 0.5;
        }

        // Search in description (weight: 30%)
        const descMatch = fuzzyMatch(searchTerm, product.description || '', 0.5);
        if (descMatch.matches) {
            matches = true;
            totalScore += descMatch.score * 0.3;
        }

        // Search in category (weight: 10%)
        const catMatch = fuzzyMatch(searchTerm, product.category || '', 0.7);
        if (catMatch.matches) {
            matches = true;
            totalScore += catMatch.score * 0.1;
        }

        // Search in brand (weight: 5%)
        if (product.brand) {
            const brandMatch = fuzzyMatch(searchTerm, product.brand, 0.7);
            if (brandMatch.matches) {
                matches = true;
                totalScore += brandMatch.score * 0.05;
            }
        }

        // Search in tags (weight: 5%)
        if (product.tags && Array.isArray(product.tags)) {
            for (const tag of product.tags) {
                const tagMatch = fuzzyMatch(searchTerm, tag, 0.7);
                if (tagMatch.matches) {
                    matches = true;
                    totalScore += tagMatch.score * 0.05;
                    break;
                }
            }
        }

        return {
            ...product,
            searchScore: matches ? totalScore : 0,
            matches
        };
    });

    return results
        .filter(p => p.matches)
        .sort((a, b) => b.searchScore - a.searchScore);
};
