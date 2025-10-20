// src/components/StarRating.jsx
import React from 'react';

/**
 * Generates the HTML string (JSX) for the star rating icons.
 * @param {number} rating - The course rating.
 * @param {string} size - Optional class name for size (e.g., 'stars-large' or default).
 * @returns {JSX.Element} JSX element containing star icons.
 */
const StarRating = ({ rating, size = '' }) => {
    const stars = [];
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5; 
    const emptyStars = 5 - Math.ceil(numericRating);

    for (let i = 0; i < fullStars; i++) {
        stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    
    if (hasHalfStar) {
        stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return (
        <div className={`stars ${size}`}>
            {stars}
        </div>
    );
};

export default StarRating;