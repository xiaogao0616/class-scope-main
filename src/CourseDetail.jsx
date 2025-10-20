// src/CourseDetail.jsx (UPDATED FOR SPA NAVIGATION AND CSS NAMESPACE)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { defaultCourseData, courseMap, uncchCourseCatalog } from './course-detail-data';
import StarRating from './components/StarRating.jsx';
import ReviewCard from './components/ReviewCard.jsx';
import Notification from './components/Notification.jsx'; 

const API_BASE_URL = "http://127.0.0.1:8000";

const CourseDetail = () => {
    // --- State Management ---
    const [courseState, setCourseState] = useState(defaultCourseData);
    const [navSearchTerm, setNavSearchTerm] = useState({ subject: '', catalog: '' });
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [courseIdentifier, setCourseIdentifier] = useState({
        school: "University of North Carolina at Chapel Hill",
        subject: 'COMP', // Default for initial URL parse
        courseNumber: '110',
    });
    // NEW STATE: To control the expansion of individual optional fields
    const [expandedOptionalFields, setExpandedOptionalFields] = useState({});
    
    const clearNotification = useCallback(() => setNotification({ message: '', type: '' }), []);

    // --- Utility Functions ---

    // Replaces updateNavCatalogOptions from course-detail-interaction.js
    const getNavCatalogOptions = (subjectCode) => {
        const subject = subjectCode.toUpperCase().trim();
        if (uncchCourseCatalog[subject]) {
            return uncchCourseCatalog[subject].map(course => {
                const parts = course.title.split(' ');
                return parts.length > 1 ? parts[1] : null;
            }).filter(Boolean);
        }
        return [];
    };
    
    // Renders the Rating Distribution Bars (Replaces createRatingDistribution)
    const RatingDistributionBars = useMemo(() => {
        const total = Object.values(courseState.ratingDistribution).reduce((a, b) => a + b, 0) || 1;
        const distribution = courseState.ratingDistribution;
        const barJSX = [];

        for (let i = 5; i >= 1; i--) {
            const count = distribution[i] || 0;
            const percentage = ((count / total) * 100).toFixed(1);

            barJSX.push(
                <div className="rating-bar-container" key={i}>
                    <div className="rating-bar-label">
                        <span>{i} stars</span>
                        <span>{count} reviews ({percentage}%)</span>
                    </div>
                    <div className="rating-bar">
                        <div 
                            className="rating-bar-fill" 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            );
        }
        return barJSX;
    }, [courseState.ratingDistribution]);


    // Replaces fetchCourseStats 
    const fetchCourseStats = useCallback(async () => {
        const { school, subject, courseNumber } = courseIdentifier;
        if (!subject || !courseNumber) return;

        const url = `${API_BASE_URL}/get_course_stats?school=${encodeURIComponent(school)}&subject=${subject}&courseNumber=${courseNumber}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch course stats: " + response.statusText);
            
            const stats = await response.json();

            setCourseState(prev => ({
                ...prev,
                overallRating: stats.overallRating.toFixed(1),
                totalReviews: stats.totalReviews,
                difficulty: stats.difficulty.toFixed(1),
                workload: stats.workload.toFixed(1),
                usefulness: stats.usefulness.toFixed(1),
                fun: stats.fun.toFixed(1),
                ratingDistribution: stats.ratingDistribution,
                avgGrade: stats.avgGrade,
                passRate: stats.passRate.toFixed(1) + '%',
                wouldTakeAgainRate: stats.wouldTakeAgainRate.toFixed(1) + '%',
                extraCost: stats.extraCostRate > 50 ? 'Yes' : 'No',
                // NEW FIELDS: Assuming backend sends these average rates back
                attendanceRate: stats.attendanceRate.toFixed(1) + '%', 
                participationRate: stats.participationRate.toFixed(1) + '%', 
            }));

        } catch (error) {
            console.error("❌ Error fetching course stats:", error);
            setNotification({ message: 'Failed to load course statistics.', type: 'error' });
        }
    }, [courseIdentifier]);

    // Replaces fetchBackendReviews
    const fetchBackendReviews = useCallback(async () => {
        const { school, subject, courseNumber } = courseIdentifier;
        if (!subject || !courseNumber) return;

        const url = `${API_BASE_URL}/get_reviews?school=${encodeURIComponent(school)}&subject=${subject}&courseNumber=${courseNumber}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch reviews: " + response.statusText);
            
            const reviews = await response.json();

            const formattedReviews = reviews.map((r) => ({
                id: r.id,
                author: r.professorName || "Anonymous", 
                date: r.timestamp.split("T")[0],
                rating: r.rating,
                difficulty: r.difficulty,
                workload: r.workload,
                usefulness: r.usefulness,
                fun: r.fun,
                grade: r.grade || "N/A", 
                passed: r.passed || "N/A",
                wouldTakeAgain: r.wouldTakeAgain || "N/A",
                extraCost: r.extraCost || "N/A",
                // NEW FIELDS
                requireAttendance: r.requireAttendance || "N/A",
                requireParticipation: r.requireParticipation || "N/A",
                text: r.reviewText
            }));
            
            setCourseState(prev => ({...prev, reviews: formattedReviews}));

        } catch (error) {
            console.error("❌ Error fetching backend reviews:", error);
            setNotification({ message: 'Failed to load student reviews.', type: 'error' });
        }
    }, [courseIdentifier]);
    
    // --- Lifecycle and Initial Load (Replaces applyCourseFromUrl and initializePage) ---
    useEffect(() => {
        // 1. Parse URL Parameter
        const params = new URLSearchParams(window.location.search);
        let raw = params.get('course');
        
        if (raw) {
            const courseKey = raw.replace(/\s+/g, '').toUpperCase();
            const localData = courseMap[courseKey];
            
            // Parse subject and number
            if (raw.includes(' ')) {
                const parts = raw.split(' ');
                if (parts.length >= 2) {
                    const subject = parts[0].toUpperCase().trim();
                    const courseNumber = parts[1].trim();
                    setCourseIdentifier(prev => ({...prev, subject, courseNumber}));
                    
                    // Update initial state with parsed info for immediate display
                    if (!localData) {
                        setCourseState(prev => ({
                            ...prev,
                            title: `${subject} ${courseNumber}`,
                            code: '',
                            description: 'Course details not found locally. Fetching data from the server...',
                        }));
                    }
                }
            }
            
            // Use local mock data if available
            if (localData) {
                setCourseState(localData);
            }
        }
        
        // 2. Setup range sliders (Replaces setupRangeSliders)
        const handleRangeInput = (e) => {
            const span = e.target.nextElementSibling;
            if (span && span.classList.contains('range-value')) {
                span.textContent = e.target.value;
            }
        };

        const sliders = document.querySelectorAll('#reviewForm input[type="range"]');
        sliders.forEach(slider => slider.addEventListener('input', handleRangeInput));
        
        return () => sliders.forEach(slider => slider.removeEventListener('input', handleRangeInput));

    }, []);

    // 3. Fetch data when identifier is set (Replaces initializePage logic)
    useEffect(() => {
        fetchCourseStats();
        fetchBackendReviews();
    }, [fetchCourseStats, fetchBackendReviews]);


    // --- Interaction Handlers ---

    // Replaces goHome (FIXED: Uses root path for SPA navigation)
    const handleGoHome = () => {
        window.location.href = '/'; 
    };

    // Replaces searchFromNav (FIXED: Uses query string for SPA navigation)
    const handleSearchFromNav = () => {
        const { subject, catalog } = navSearchTerm;
        const subjectUpper = subject.toUpperCase().trim();
        const catalogClean = catalog.trim();
        
        if (!subjectUpper || !catalogClean) {
            alert('Please enter both subject and catalog number.');
            return;
        }
        
        const fullCourseCode = subjectUpper + ' ' + catalogClean;
        
        const coursesInSubject = uncchCourseCatalog[subjectUpper] || [];

        if (coursesInSubject.length === 0) {
             alert(`Error: The subject "${subjectUpper}" is not yet fully integrated in our search catalog. Please check your subject code.`);
             return;
        }
        
        // Navigate to the detail page for the searched course using the query string
        const courseCode = encodeURIComponent(fullCourseCode);
        window.location.href = `?course=${courseCode}`;
    };
    
    // Replaces toggleReviewForm
    const handleToggleReviewForm = () => {
        setIsFormVisible(prev => !prev);
        // Collapse optional fields when closing the form
        if (isFormVisible) {
            setExpandedOptionalFields({});
        } else {
            document.getElementById('reviewForm')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    // Replaces submitReview
    const handleSubmitReview = async (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const formObj = Object.fromEntries(formData.entries());
        
        const { rating, difficulty, workload, usefulness, fun, reviewText: text, gradeReceived: grade, passedClass: passed, wouldTakeAgain, extraCost,
            // NEW FIELDS
            requireAttendance,
            requireParticipation
        } = formObj;
        
        if (!rating) {
            setNotification({ message: 'Please select an overall rating before submitting your review!', type: 'error' });
            return;
        }

        const reviewPayload = {
            school: courseIdentifier.school,
            subject: courseIdentifier.subject,
            courseNumber: courseIdentifier.courseNumber,
            professorName: null,
            rating: parseInt(rating),
            reviewText: text,
            difficulty: parseInt(difficulty),
            workload: parseInt(workload),
            usefulness: parseInt(usefulness),
            fun: parseInt(fun),
            // Optional fields
            grade: grade || null,
            passed: passed || null,
            wouldTakeAgain: wouldTakeAgain || null,
            extraCost: extraCost || null,
            requireAttendance: requireAttendance || null,
            requireParticipation: requireParticipation || null,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/submit_review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewPayload)
            });

            if (!response.ok) throw new Error("Failed to submit review. Status: " + response.status);
            
            await fetchCourseStats();
            await fetchBackendReviews(); 

            event.target.reset();
            document.querySelectorAll('#reviewForm .range-value').forEach(span => span.textContent = '3');
            
            handleToggleReviewForm();
            setExpandedOptionalFields({}); // Collapse optional fields after successful submission
            setNotification({ message: 'Review submitted successfully! Thank you for your contribution.', type: 'success' });

        } catch (error) {
            console.error("❌ Error submitting review:", error);
            setNotification({ message: 'Failed to submit review. Please ensure the backend is running and the course is valid.', type: 'error' });
        }
    };

    // NEW HANDLER: Toggles individual optional fields
    const handleToggleOptionalField = (e, fieldName) => {
        e.preventDefault();
        setExpandedOptionalFields(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    // --- Render ---
    return (
        // ADDED: CSS Namespacing wrapper
        <div className="course-detail-page"> 
            <Notification message={notification.message} type={notification.type} clearNotification={clearNotification} />
            
            {/* Navigation Bar (Restored HTML converted to JSX) */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo" onClick={handleGoHome}>
                        <i className="fas fa-graduation-cap"></i>
                        <span>ClassScope</span>
                    </div>
                    <div className="nav-search">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            id="navSubjectSearch" 
                            placeholder="Subject" 
                            list="navSubjectOptions" 
                            autoComplete="off"
                            value={navSearchTerm.subject}
                            onChange={(e) => setNavSearchTerm(prev => ({ ...prev, subject: e.target.value, catalog: '' }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchFromNav(); }}
                        />
                        <datalist id="navSubjectOptions">
                            {/* Static Subject Options from original HTML (All subjects included) */}
                            <option value="AAAD">African, African American and Diaspora Studies</option>
                            <option value="AMST">American Studies</option>
                            <option value="ANTH">Anthropology</option>
                            <option value="APPL">Applied Sciences</option>
                            <option value="ARAB">Arabic</option>
                            <option value="ARTH">Art History</option>
                            <option value="ARTS">Studio Art</option>
                            <option value="ASTR">Astronomy</option>
                            <option value="BIOL">Biology</option>
                            <option value="BMME">Biomedical Engineering</option>
                            <option value="BUSI">Business Administration</option>
                            <option value="CHEM">Chemistry</option>
                            <option value="CHIN">Chinese</option>
                            <option value="CLAR">Classics</option>
                            <option value="COMM">Communication</option>
                            <option value="COMP">Computer Science</option>
                            <option value="DRAM">Dramatic Art</option>
                            <option value="ECON">Economics</option>
                            <option value="EDUC">Education</option>
                            <option value="ENEC">Energy</option>
                            <option value="ENGL">English</option>
                            <option value="ENVR">Environment</option>
                            <option value="EXSS">Exercise and Sport Science</option>
                            <option value="FREN">French</option>
                            <option value="GEOG">Geography</option>
                            <option value="GEOL">Geological Sciences</option>
                            <option value="GERM">German</option>
                            <option value="GLBL">Global Studies</option>
                            <option value="HIST">History</option>
                            <option value="HNRS">Honors</option>
                            <option value="INLS">Information and Library Science</option>
                            <option value="ITAL">Italian</option>
                            <option value="JAPN">Japanese</option>
                            <option value="JOMC">Journalism and Media</option>
                            <option value="KOR">Korean</option>
                            <option value="LFIT">Lifetime Fitness</option>
                            <option value="LING">Linguistics</option>
                            <option value="MATH">Mathematics</option>
                            <option value="MUSC">Music</option>
                            <option value="NAVS">Naval Science</option>
                            <option value="NSCI">Neuroscience</option>
                            <option value="NURS">Nursing</option>
                            <option value="PACE">Professional and Continuing Education</option>
                            <option value="PHIL">Philosophy</option>
                            <option value="PHYA">Physical Activity</option>
                            <option value="PHYS">Physics</option>
                            <option value="PLCY">Public Policy</option>
                            <option value="POLI">Political Science</option>
                            <option value="PORT">Portuguese</option>
                            <option value="PSYC">Psychology</option>
                            <option value="PUBL">Public Health</option>
                            <option value="RELI">Religious Studies</option>
                            <option value="RUSS">Russian</option>
                            <option value="SOCI">Sociology</option>
                            <option value="SPAN">Spanish</option>
                            <option value="STOR">Statistics and Operations Research</option>
                            <option value="SWAH">Swahili</option>
                            <option value="WGST">Women's and Gender Studies</option>
                        </datalist>
                        <input 
                            type="text" 
                            id="navCatalogSearch" 
                            placeholder="Number (e.g., 110, 231)" 
                            required 
                            list="navCatalogNumberList" 
                            autoComplete="off"
                            value={navSearchTerm.catalog}
                            onChange={(e) => setNavSearchTerm(prev => ({ ...prev, catalog: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchFromNav(); }}
                        />
                        <datalist id="navCatalogNumberList">
                            {getNavCatalogOptions(navSearchTerm.subject).map(number => (
                                <option key={`nav-cat-${number}`} value={number} />
                            ))}
                        </datalist>
                        
                        <button className="nav-search-btn" onClick={handleSearchFromNav}>
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                    <button className="back-btn" onClick={handleGoHome}>
                        <i className="fas fa-arrow-left"></i>
                        Back to Home
                    </button>
                </div>
            </nav>

            {/* Course Header (Restored HTML converted to JSX) */}
            <section className="course-header">
                <div className="container">
                    <div className="course-header-content">
                        <div className="course-title-section">
                            <h1 id="courseTitle">{courseState.title}</h1>
                            <p className="course-code" id="courseCode">{courseState.code}</p>
                            <div className="course-meta">
                                <div className="meta-item">
                                    <span className="bullet">•</span>
                                    <span>UNC Chapel Hill</span>
                                </div>
                            </div>
                        </div>
                        <div className="rating-summary">
                            <StarRating rating={courseState.overallRating} size="stars-large" />
                            <div className="overall-rating" id="overallRating">{courseState.overallRating}</div>
                            <p className="total-reviews" id="totalReviews">Based on {courseState.totalReviews} reviews</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content (Restored HTML converted to JSX) */}
            <section className="main-content">
                <div className="container">
                    <div className="content-grid">
                        <div>
                            {/* Course Description */}
                            <div className="card">
                                <h2>Course Description</h2>
                                <p className="description" id="courseDescription">
                                    {courseState.description}
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="card">
                                <h2>Quick Stats</h2>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-label">Average Grade</span>
                                        <span className="stat-value">{courseState.avgGrade || 'B+'}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Pass Rate</span>
                                        <span className="stat-value">{courseState.passRate || '94%'}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Would Take Again</span>
                                        <span className="stat-value">{courseState.wouldTakeAgainRate || '87%'}</span>
                                    </div>
                                    {/* Removed: Extra Cost, Required Attendance, and Required Participation stats */}
                                </div>
                            </div>

                            {/* Detailed Ratings & Distribution */}
                            <div className="card">
                                <h2>Detailed Ratings</h2>
                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <div className="metric-label">Difficulty</div>
                                        <div className="metric-value" id="difficultyValue">{courseState.difficulty}<span className="metric-max">/5</span></div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">Workload</div>
                                        <div className="metric-value" id="workloadValue">{courseState.workload}<span className="metric-max">/5</span></div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">Usefulness</div>
                                        <div className="metric-value" id="usefulnessValue">{courseState.usefulness}<span className="metric-max">/5</span></div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">Engagement/Interesting</div>
                                        <div className="metric-value" id="funValue">{courseState.fun}<span className="metric-max">/5</span></div>
                                    </div>
                                </div>

                                <h3 style={{marginTop: '30px'}}>Rating Distribution</h3>
                                <div id="ratingBars">
                                    {RatingDistributionBars}
                                </div>
                            </div>

                            {/* Student Reviews & Form */}
                            <div className="card">
                                <h2>Student Reviews</h2>
                                <button className="add-review-btn" onClick={handleToggleReviewForm}>
                                    <i className="fas fa-plus"></i>
                                    Write a Review
                                </button>

                                <div className={`review-form ${isFormVisible ? 'active' : ''}`} id="reviewForm">
                                    <h3>Share Your Experience</h3>
                                    <form onSubmit={handleSubmitReview}>
                                        <div className="form-group">
                                            <label>Overall Rating</label>
                                            <div className="rating-input">
                                                {/* No default checked star */}
                                                <input type="radio" name="rating" value="5" id="star5" />
                                                <label htmlFor="star5"><i className="fas fa-star"></i></label>
                                                <input type="radio" name="rating" value="4" id="star4" />
                                                <label htmlFor="star4"><i className="fas fa-star"></i></label>
                                                <input type="radio" name="rating" value="3" id="star3" />
                                                <label htmlFor="star3"><i className="fas fa-star"></i></label>
                                                <input type="radio" name="rating" value="2" id="star2" />
                                                <label htmlFor="star2"><i className="fas fa-star"></i></label>
                                                <input type="radio" name="rating" value="1" id="star1" />
                                                <label htmlFor="star1"><i className="fas fa-star"></i></label>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="difficulty">Difficulty (1-5)</label>
                                                <div className="range-container">
                                                    <input type="range" name="difficulty" id="difficulty" min="1" max="5" defaultValue="3" />
                                                    <span className="range-value">3</span>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="workload">Workload (1-5)</label>
                                                <div className="range-container">
                                                    <input type="range" name="workload" id="workload" min="1" max="5" defaultValue="3" />
                                                    <span className="range-value">3</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="usefulness">Usefulness (1-5)</label>
                                                <div className="range-container">
                                                    <input type="range" name="usefulness" id="usefulness" min="1" max="5" defaultValue="3" />
                                                    <span className="range-value">3</span>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="fun">Engagement/Interesting (1-5)</label>
                                                <div className="range-container">
                                                    <input type="range" name="fun" id="fun" min="1" max="5" defaultValue="3" />
                                                    <span className="range-value">3</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* NEW: INDIVIDUAL OPTIONAL FIELDS */}
                                        <div className="optional-form-section">
                                            <div className={`optional-header ${expandedOptionalFields.grade ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'grade')}>
                                                Grade Received (Optional) <i className="fas fa-plus"></i>
                                            </div>
                                            <div className={`optional-content ${expandedOptionalFields.grade ? 'expanded' : ''}`}>
                                                <div className="form-group">
                                                    <select name="gradeReceived" id="gradeReceived" defaultValue="">
                                                        <option value="">Select grade</option>
                                                        <option value="A+">A+</option><option value="A">A</option><option value="A-">A-</option>
                                                        <option value="B+">B+</option><option value="B">B</option><option value="B-">B-</option>
                                                        <option value="C+">C+</option><option value="C">C</option><option value="C-">C-</option>
                                                        <option value="D+">D+</option><option value="D">D</option><option value="F">F</option>
                                                        <option value="P">Pass</option><option value="NC">No Credit</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="optional-form-section">
                                            <div className={`optional-header ${expandedOptionalFields.pass ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'pass')}>
                                                Did you pass? (Optional) <i className="fas fa-plus"></i>
                                            </div>
                                            <div className={`optional-content ${expandedOptionalFields.pass ? 'expanded' : ''}`}>
                                                <div className="form-group">
                                                    <select name="passedClass" id="passedClass" defaultValue="">
                                                        <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="optional-form-section">
                                            <div className={`optional-header ${expandedOptionalFields.takeAgain ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'takeAgain')}>
                                                Would take again? (Optional) <i className="fas fa-plus"></i>
                                            </div>
                                            <div className={`optional-content ${expandedOptionalFields.takeAgain ? 'expanded' : ''}`}>
                                                <div className="form-group">
                                                    <select name="wouldTakeAgain" id="wouldTakeAgain" defaultValue="">
                                                        <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="optional-form-section">
                                            <div className={`optional-header ${expandedOptionalFields.extraCost ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'extraCost')}>
                                                Extra Cost? (Optional) <i className="fas fa-plus"></i>
                                            </div>
                                            <div className={`optional-content ${expandedOptionalFields.extraCost ? 'expanded' : ''}`}>
                                                <div className="form-group">
                                                    <select name="extraCost" id="extraCost" defaultValue="">
                                                        <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="optional-form-section">
                                            <div className={`optional-header ${expandedOptionalFields.attendance ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'attendance')}>
                                                Required Attendance? (Optional) <i className="fas fa-plus"></i>
                                            </div>
                                            <div className={`optional-content ${expandedOptionalFields.attendance ? 'expanded' : ''}`}>
                                                <div className="form-group">
                                                    <select name="requireAttendance" id="requireAttendance" defaultValue="">
                                                        <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="optional-form-section">
                                            <div className={`optional-header ${expandedOptionalFields.participation ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'participation')}>
                                                Required Participation? (Optional) <i className="fas fa-plus"></i>
                                            </div>
                                            <div className={`optional-content ${expandedOptionalFields.participation ? 'expanded' : ''}`}>
                                                <div className="form-group">
                                                    <select name="requireParticipation" id="requireParticipation" defaultValue="">
                                                        <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        {/* END NEW OPTIONAL SECTION */}

                                        <div className="form-group">
                                            <label htmlFor="reviewText" style={{fontSize: '1.2rem', fontWeight: '600'}}>Your Personal Review</label>
                                            <textarea name="reviewText" id="reviewText" rows="4" placeholder="Share your experience with this course..." required></textarea>
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="submit-btn">Submit Review</button>
                                            <button type="button" className="cancel-btn" onClick={handleToggleReviewForm}>Cancel</button>
                                        </div>
                                    </form>
                                </div>

                                <div id="reviewsList">
                                    {courseState.reviews.length > 0 ? (
                                        courseState.reviews.map(review => (
                                            <ReviewCard key={review.id} review={review} />
                                        ))
                                    ) : (
                                        <p>Be the first to leave a review!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
export default CourseDetail;