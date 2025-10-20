// src/components/ReviewCard.jsx
import React from 'react';
import StarRating from './StarRating.jsx';

/**
 * Formats a date string into a readable format.
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

const ReviewCard = ({ review }) => {
    return (
        <div className="review-item">
            <div className="review-header">
                <div className="reviewer-info">
                    <div className="reviewer-avatar">
                        <i className="fas fa-user"></i>
                    </div>
                    <div className="reviewer-details">
                        <h4>{review.author}</h4>
                        <span className="review-date">{formatDate(review.date)}</span>
                    </div>
                </div>
                <div className="review-rating">
                    <StarRating rating={review.rating} />
                </div>
            </div>
            <p className="review-text">{review.text}</p>
            <div className="review-metrics">
                <div className="review-metric">
                    <i className="fas fa-chart-line"></i>
                    <span>Difficulty: {review.difficulty}/5</span>
                </div>
                <div className="review-metric">
                    <i className="fas fa-briefcase"></i>
                    <span>Workload: {review.workload}/5</span>
                </div>
                <div className="review-metric">
                    <i className="fas fa-user-tie"></i>
                    <span>Usefulness: {review.usefulness}/5</span>
                </div>
                <div className="review-metric">
                    <i className="fas fa-smile"></i>
                    <span>Fun: {review.fun}/5</span>
                </div>
                <div className="review-metric">
                    <i className="fas fa-graduation-cap"></i>
                    <span>Grade: {review.grade}</span>
                </div>
                {/* NEW OPTIONAL FIELDS DISPLAY */}
                {review.requireAttendance && review.requireAttendance !== 'N/A' && (
                    <div className="review-metric">
                        <i className="fas fa-calendar-check"></i>
                        <span>Attendance: {review.requireAttendance}</span>
                    </div>
                )}
                {review.requireParticipation && review.requireParticipation !== 'N/A' && (
                    <div className="review-metric">
                        <i className="fas fa-users"></i>
                        <span>Participation: {review.requireParticipation}</span>
                    </div>
                )}
                {review.extraCost && review.extraCost !== 'N/A' && (
                    <div className="review-metric">
                        <i className="fas fa-money-bill-wave"></i>
                        <span>Extra Cost: {review.extraCost}</span>
                    </div>
                )}
                {/* END NEW OPTIONAL FIELDS DISPLAY */}
            </div>
        </div>
    );
};

export default ReviewCard;
