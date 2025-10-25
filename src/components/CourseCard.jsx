// src/components/CourseCard.jsx
import React from 'react';

// Replaces the generateStars logic from dom.js
const StarRating = ({ rating }) => {
    const stars = [];
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    // Note: The original JS uses >= 0.5 for half star, so we replicate that here.
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

    return <div className="stars">{stars}</div>;
};

const CourseCard = ({ course }) => {
    
    // FIX APPLIED HERE: Navigation logic changed to use query string for SPA routing
    const handleCourseClick = () => {
        const courseCode = encodeURIComponent(course.title);
        // Navigate using the query parameter which triggers CourseDetail.jsx in main.jsx
        window.location.href = `?course=${courseCode}`; 
    };

    return (
        <div className="course-card" onClick={handleCourseClick} style={{ cursor: 'pointer' }}>
            <div className="course-header">
                <div>
                    <div className="course-title">{course.title}</div>
                    <div className="course-code">{course.code}</div>
                </div>
                <div className="course-rating">
                    <StarRating rating={course.rating} />
                    <div className="rating-text">{course.rating}/5</div>
                </div>
            </div>
            <div className="course-meta">
                <span><i className="fas fa-comments"></i> {course.reviews} reviews</span>
            </div>
            <div className="course-description">{course.description}</div>
            <div className="course-stats">
                <span>Difficulty: {course.difficulty}/5</span>
                <span>Workload: {course.workload}/5</span>
            </div>
        </div>
    );
};

export default CourseCard;