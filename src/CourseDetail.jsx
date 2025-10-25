// src/CourseDetail.jsx (UPDATED FOR SINGLE API CALL WORKFLOW)

// --- Imports ---
// Import React and standard hooks (useState, useEffect, etc.)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Imports for defaultCourseData and courseMap removed

// Import reusable UI components used on this page
import StarRating from './components/StarRating.jsx';
import ReviewCard from './components/ReviewCard.jsx';
import Notification from './components/Notification.jsx'; 

// --- Constants ---
// Define the base URL for the backend API
const API_BASE_URL = "http://127.0.0.1:8000";

// A default state to use on initial load, replacing defaultCourseData
// This object defines the shape of the course data and provides loading placeholders
const initialCourseState = {
    title: "Loading...",
    code: "",
    description: "Loading course details...",
    overallRating: 0,
    totalReviews: 0,
    difficulty: 0,
    workload: 0,
    usefulness: 0,
    fun: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: [],
    avgGrade: "N/A",
    passRate: "N/A",
    wouldTakeAgainRate: "N/A",
    attendanceRate: "N/A",
    participationRate: "N/A",
};

// --- Component Definition ---
// Define the main component for the Course Detail page
const CourseDetail = () => {
    
    // --- State Management ---
    // Holds all dynamic data for the course being viewed (title, stats, reviews, etc.)
    const [courseState, setCourseState] = useState(initialCourseState); // Use new initial state
    // Holds the user's input from the *navbar* search fields
    const [navSearchTerm, setNavSearchTerm] = useState({ subject: '', catalog: '' });
    // Boolean state to toggle the visibility of the "Write a Review" form
    const [isFormVisible, setIsFormVisible] = useState(false);
    // State to manage showing success/error notifications to the user
    const [notification, setNotification] = useState({ message: '', type: '' });
    // State to store the identifier (school, subject, number) of the course to fetch
    const [courseIdentifier, setCourseIdentifier] = useState({
        school: "University of North Carolina at Chapel Hill",
        subject: null, // Start as null
        courseNumber: null, // Start as null
    });
    // NEW STATE: To control the expansion of individual optional fields
    // Manages the open/closed state of optional accordions in the review form
    const [expandedOptionalFields, setExpandedOptionalFields] = useState({});
    
    // --- Memoized Callbacks ---
    // Creates a memoized function to clear the notification state
    // useCallback prevents this function from being recreated on every render
    const clearNotification = useCallback(() => setNotification({ message: '', type: '' }), []);

    // --- Utility Functions ---

    
    // (This function remains unchanged)
    // Memoized calculation for generating the Rating Distribution bars
    // useMemo ensures this JSX is only recalculated if courseState.ratingDistribution changes
    const RatingDistributionBars = useMemo(() => {
        // Calculate total reviews or default to 1 to avoid division by zero
        const total = Object.values(courseState.ratingDistribution).reduce((a, b) => a + b, 0) || 1;
        const distribution = courseState.ratingDistribution;
        const barJSX = []; // Array to hold the JSX for each bar

        // Loop from 5 stars down to 1 star
        for (let i = 5; i >= 1; i--) {
            const count = distribution[i] || 0;
            const percentage = ((count / total) * 100).toFixed(1);

            // Push the JSX for a single rating bar into the array
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
        return barJSX; // Return the array of JSX elements
    }, [courseState.ratingDistribution]); // Dependency array: only run if this changes


    // ===================================================================
    // ===                 THIS IS THE MAIN UPDATED PART (1/3)         ===
    // ===================================================================

    // Replaces fetchCourseStats AND fetchBackendReviews
    // --- Data Fetching ---
    // A single, memoized function to fetch all course data (details, stats, reviews)
    const fetchCourseData = useCallback(async () => {
        const { school, subject, courseNumber } = courseIdentifier;
        // Guard clause: Don't fetch if subject or number aren't set yet
        if (!subject || !courseNumber) return;

        // This single endpoint does all the work:
        // 1. Check DB. 2. If not found, scrape, create, and return.
        // Construct the API URL with query parameters
        const url = `${API_BASE_URL}/get_course_details?school=${encodeURIComponent(school)}&subject=${subject}&courseNumber=${courseNumber}`;
        
        try {
            // Make the GET request to the backend
            const response = await fetch(url);
            
            // Handle specific 404 (Not Found) error
            if (response.status === 404) {
                 throw new Error(`Course ${subject} ${courseNumber} was not found. Please check the subject and number.`);
            }
            // Handle other non-successful responses
            if (!response.ok) {
                throw new Error("Failed to fetch course data from the server.");
            }
            
            // Parse the JSON data from the response
            const data = await response.json(); // Expects { title, description, subject, courseNumber, stats: {...}, reviews: [...] }

            // Format reviews (logic from old fetchBackendReviews)
            // Map over the raw review data from the API to format it for the frontend
            const formattedReviews = (data.reviews || []).map((r) => ({
                id: r.id,
                author: r.professorName || "Anonymous", 
                date: r.timestamp.split("T")[0], // Format date to YYYY-MM-DD
                rating: r.rating,
                difficulty: r.difficulty,
                workload: r.workload,
                usefulness: r.usefulness,
                fun: r.fun,
                grade: r.grade || "N/A", 
                passed: r.passed || "N/A",
                wouldTakeAgain: r.wouldTakeAgain || "N/A",
                extraCost: r.extraCost || "N/A",
                requireAttendance: r.requireAttendance || "N/A",
                requireParticipation: r.requireParticipation || "N/A",
                text: r.reviewText
            }));

            // Set the complete, combined state (logic from old fetchCourseStats)
            // Update the component's state with all the fetched and formatted data
            setCourseState({
                title: data.title,
                code: `${data.subject} ${data.courseNumber}`,
                description: data.description,
                reviews: formattedReviews,
                // Spread all stats from the backend response
                overallRating: data.stats.overallRating.toFixed(1),
                totalReviews: data.stats.totalReviews,
                difficulty: data.stats.difficulty.toFixed(1),
                workload: data.stats.workload.toFixed(1),
                usefulness: data.stats.usefulness.toFixed(1),
                fun: data.stats.fun.toFixed(1),
                ratingDistribution: data.stats.ratingDistribution,
                avgGrade: data.stats.avgGrade,
                passRate: data.stats.passRate.toFixed(1) + '%',
                wouldTakeAgainRate: data.stats.wouldTakeAgainRate.toFixed(1) + '%',
                attendanceRate: data.stats.attendanceRate.toFixed(1) + '%', 
                participationRate: data.stats.participationRate.toFixed(1) + '%', 
                // Note: 'extraCost' stat is no longer set here as it's part of the review
            });

        } catch (error) {
            // Handle any errors from the fetch or data processing
            console.error("❌ Error fetching course data:", error);
            // Show an error message to the user
            setNotification({ message: error.message, type: 'error' });
            // Set error state
            // Update the state to show a "Not Found" message on the page
            setCourseState({
                ...initialCourseState,
                title: "Course Not Found",
                code: `${subject || ''} ${courseNumber || ''}`,
                description: error.message,
            });
        }
    }, [courseIdentifier]); // Dependency: Re-run only if courseIdentifier changes
    
    // --- (Old fetchCourseStats and fetchBackendReviews functions removed) ---
    
    
    // ===================================================================
    // ===                 THIS IS THE MAIN UPDATED PART (2/3)         ===
    // ===================================================================
    // --- Lifecycle and Initial Load (Replaces applyCourseFromUrl and initializePage) ---
    
    // This useEffect hook runs *once* when the component mounts (empty dependency array [])
    useEffect(() => {
        // 1. Parse URL Parameter
        // Get the 'course' query parameter from the window's URL (e.g., "?course=COMP 110")
        const params = new URLSearchParams(window.location.search);
        let raw = params.get('course');
        
        // If the 'course' parameter exists and contains a space
        if (raw && raw.includes(' ')) {
            const parts = raw.split(' ');
            if (parts.length >= 2) {
                // Extract the subject (e.g., "COMP") and course number (e.g., "110")
                const subject = parts[0].toUpperCase().trim();
                const courseNumber = parts[1].trim();
                
                // This setCourseIdentifier will trigger the data fetching useEffect below
                setCourseIdentifier(prev => ({...prev, subject, courseNumber}));
                
                // Set a temporary loading state, removing 'courseMap' logic
                // This shows the user that data is being fetched
                setCourseState(prev => ({
                    ...initialCourseState,
                    title: `${subject} ${courseNumber}`,
                    code: 'Loading...',
                    description: 'Fetching course details from the server...',
                }));
            }
        }
        
        // 2. Setup range sliders (Unchanged)
        // This function updates the "span" next to a range slider with its current value
        const handleRangeInput = (e) => {
            const span = e.target.nextElementSibling;
            if (span && span.classList.contains('range-value')) {
                span.textContent = e.target.value;
            }
        };

        // Find all range sliders in the review form and attach the event listener
        const sliders = document.querySelectorAll('#reviewForm input[type="range"]');
        sliders.forEach(slider => slider.addEventListener('input', handleRangeInput));
        
        // Return a cleanup function to remove event listeners when the component unmounts
        return () => sliders.forEach(slider => slider.removeEventListener('input', handleRangeInput));

    }, []); // This hook still runs only once on mount

    // 3. Fetch data when identifier is set
    // This useEffect hook runs whenever 'courseIdentifier' or 'fetchCourseData' changes
    useEffect(() => {
        // This hook is now responsible for ALL data fetching.
        // It runs when 'courseIdentifier' is set by the hook above.
        // It calls the main fetch function *only if* subject and number are set
        if (courseIdentifier.subject && courseIdentifier.courseNumber) {
            fetchCourseData();
        }
    }, [courseIdentifier, fetchCourseData]); // Depends on identifier and the fetch function
    // ===================================================================


    // --- Interaction Handlers ---

    // (handleGoHome remains unchanged)
    // Navigates the user back to the homepage
    const handleGoHome = () => {
        window.location.href = '/'; 
    };

    // Handles the search action from the top navbar
    const handleSearchFromNav = async () => { // 1. Make the function async
        const { subject, catalog } = navSearchTerm;
        const subjectUpper = subject.toUpperCase().trim();
        const catalogClean = catalog.trim();
        
        // 2. Get the current school from the state
        const school = courseIdentifier.school; 

        // 3. Basic validation (changed alert to notification)
        if (!subjectUpper || !catalogClean) {
            setNotification({ message: 'Please enter both subject and catalog number.', type: 'error' });
            return;
        }
        
        // 4. Add try...catch for backend verification
        try {
            // 5. Build the validation URL
            const url = `${API_BASE_URL}/get_course_details?school=${encodeURIComponent(school)}&subject=${encodeURIComponent(subjectUpper)}&courseNumber=${encodeURIComponent(catalogClean)}`;

            // 6. Call the endpoint to check
            const response = await fetch(url);

            // 7. Handle errors (e.g., 404 Not Found)
            if (!response.ok) {
                let errorMessage = "Failed to find course.";
                try {
                    // Try to get the specific error message from the backend
                    const errorData = await response.json();
                    if (errorData && errorData.detail) {
                         errorMessage = errorData.detail;
                    } else if (response.status === 404) {
                        // Fallback for a simple 404
                        errorMessage = `Course ${subjectUpper} ${catalogClean} was not found. Please check the subject and number.`;
                    }
                } catch (jsonError) {
                    // If backend sent non-JSON error
                    errorMessage = `Error: ${response.statusText}`;
                }
                throw new Error(errorMessage); // Throw to be caught below
            }

            // 8. SUCCESS: If fetch is ok, the course is valid. Now redirect.
            const fullCourseCode = subjectUpper + ' ' + catalogClean;
            const courseCode = encodeURIComponent(fullCourseCode);
            // This reloads the page with the new course in the URL query string
            window.location.href = `?course=${courseCode}`;

        } catch (error) {
            // 9. CATCH: Show the error notification and DO NOT redirect
            console.error("Error checking course existence:", error);
            setNotification({ message: error.message, type: 'error' });
        }
    };
    
    // (handleToggleReviewForm remains unchanged)
    // Toggles the visibility of the review form
    const handleToggleReviewForm = () => {
        setIsFormVisible(prev => !prev);
        // If the form is being hidden, reset the optional field states
        if (isFormVisible) {
            setExpandedOptionalFields({});
        } else {
            // If the form is being shown, scroll to it
            document.getElementById('reviewForm')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };


    // ===================================================================
    // ===                 THIS IS THE MAIN UPDATED PART (3/3)         ===
    // ===================================================================
    // Replaces submitReview
    // Handles the submission of the "Write a Review" form
    const handleSubmitReview = async (event) => {
        // Prevent the default form submission (which would reload the page)
        event.preventDefault();
        
        // Use FormData to easily extract all values from the form
        const formData = new FormData(event.target);
        const formObj = Object.fromEntries(formData.entries());
        
        // Destructure the required and optional fields from the form object
        const { rating, difficulty, workload, usefulness, fun, reviewText: text, gradeReceived: grade, passedClass: passed, wouldTakeAgain, extraCost,
            requireAttendance,
            requireParticipation
        } = formObj;
        
        // Validation: Ensure an overall rating is selected
        if (!rating) {
            setNotification({ message: 'Please select an overall rating before submitting your review!', type: 'error' });
            return;
        }

        // Payload is unchanged, as it always sent the full review
        // Construct the review object to send to the backend API
        const reviewPayload = {
            school: courseIdentifier.school,
            subject: courseIdentifier.subject,
            courseNumber: courseIdentifier.courseNumber,
            professorName: null, // Professor is not part of this form
            rating: parseInt(rating),
            reviewText: text,
            difficulty: parseInt(difficulty),
            workload: parseInt(workload),
            usefulness: parseInt(usefulness),
            fun: parseInt(fun),
            grade: grade || null, // Use null if field is empty
            passed: passed || null,
            wouldTakeAgain: wouldTakeAgain || null,
            extraCost: extraCost || null,
            requireAttendance: requireAttendance || null,
            requireParticipation: requireParticipation || null,
            timestamp: new Date().toISOString() // Add a current timestamp
        };

        try {
            // Send the POST request to the backend's /submit_review endpoint
            const response = await fetch(`${API_BASE_URL}/submit_review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewPayload)
            });

            // Handle non-successful responses
            if (!response.ok) throw new Error("Failed to submit review. Status: " + response.status);
            
            // On success, just call the one new function to refresh ALL data
            // This will fetch the new stats and the newly added review
            await fetchCourseData(); 

            // Reset the form fields
            event.target.reset();
            // Manually reset the range slider 'span' elements
            document.querySelectorAll('#reviewForm .range-value').forEach(span => span.textContent = '3');
            
            // Hide the form
            handleToggleReviewForm();
            // Collapse all optional fields
            setExpandedOptionalFields({});
            // Show a success notification
            setNotification({ message: 'Review submitted successfully! Thank you for your contribution.', type: 'success' });

        } catch (error) {
            // Handle any errors during the submission
            console.error("❌ Error submitting review:", error);
            setNotification({ message: 'Failed to submit review. Please ensure the backend is running and the course is valid.', type: 'error' });
        }
    };
    // ===================================================================


    // (handleToggleOptionalField remains unchanged)
    // Handles clicking on an optional field accordion in the review form
    const handleToggleOptionalField = (e, fieldName) => {
        e.preventDefault(); // Prevent default button/link behavior
        // Toggle the boolean value for the specific fieldName in the state
        setExpandedOptionalFields(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    // --- Render ---
    // (All JSX from your file remains 100% THE SAME)
    // This is the JSX that defines the HTML structure of the page
    return (
        <div className="course-detail-page"> 
            {/* 1. Notification Component */}
            {/* Displays success/error messages at the top of the page */}
            <Notification message={notification.message} type={notification.type} clearNotification={clearNotification} />
            
            {/* 2. Navbar */}
            <nav className="navbar">
                <div className="nav-container">
                    {/* Logo/Home link */}
                    <div className="nav-logo" onClick={handleGoHome}>
                        <i className="fas fa-graduation-cap"></i>
                        <span>ClassScope</span>
                    </div>
                    {/* Navbar Search Bar */}
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
                        {/* Datalist for subject suggestions */}
                        <datalist id="navSubjectOptions">
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
                        
                        <button className="nav-search-btn" onClick={handleSearchFromNav}>
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                    {/* Back to Home Button */}
                    <button className="back-btn" onClick={handleGoHome}>
                        <i className="fas fa-arrow-left"></i>
                        Back to Home
                    </button>
                </div>
            </nav>

            {/* 3. Course Header Section */}
            {/* Displays the course code, title, and overall rating summary */}
            <section className="course-header">
                <div className="container">
                    <div className="course-header-content">
                        {/* Course Code and Title */}
                        <div className="course-title-section">
                            <h1 className="course-code" id="courseCode">{courseState.code}</h1>
                            <p id="courseTitle">{courseState.title}</p>
                            <div className="course-meta">
                                <div className="meta-item">
                                    <span className="bullet">•</span>
                                    <span>UNC Chapel Hill</span>
                                </div>
                            </div>
                        </div>
                        {/* Overall Rating */}
                        <div className="rating-summary">
                            <StarRating rating={courseState.overallRating} size="stars-large" />
                            <div className="overall-rating" id="overallRating">{courseState.overallRating}</div>
                            <p className="total-reviews" id="totalReviews">Based on {courseState.totalReviews} reviews</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Main Content Section */}
            {/* Contains all other cards: Description, Stats, Ratings, and Reviews */}
            <section className="main-content">
                <div className="container">
                    <div className="content-grid">
                        <div>
                            {/* 4a. Course Description Card */}
                            <div className="card">
                                <h2>Course Description</h2>
                                <p className="description" id="courseDescription">
                                    {courseState.description}
                                </p>
                            </div>

                            {/* 4b. Quick Stats Card */}
                            {/* Displays Avg Grade, Pass Rate, etc. */}
                            <div className="card">
                                <h2>Quick Stats</h2>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-label">Average Grade</span>
                                        <span className="stat-value">{courseState.avgGrade || 'N/A'}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Pass Rate</span>
                                        <span className="stat-value">{courseState.passRate || 'N/A'}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Would Take Again</span>
                                        <span className="stat-value">{courseState.wouldTakeAgainRate || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 4c. Detailed Ratings Card */}
                            {/* Displays Difficulty, Workload, etc., and the Rating Distribution Bars */}
                            <div className="card">
                                <h2>Detailed Ratings</h2>
                                <div className="metrics-grid">
                                    {/* ... (metric cards for difficulty, workload, etc.) ... */}
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
                                {/* Renders the memoized RatingDistributionBars JSX */}
                                <div id="ratingBars">
                                    {RatingDistributionBars}
                                </div>
                            </div>

                            {/* 4d. Student Reviews Card */}
                            <div className="card">
                                <h2>Student Reviews</h2>
                                {/* Button to toggle the review form */}
                                <button className="add-review-btn" onClick={handleToggleReviewForm}>
                                    <i className="fas fa-plus"></i>
                                    Write a Review
                                </button>

                                {/* The Review Form (hidden by default) */}
                                <div className={`review-form ${isFormVisible ? 'active' : ''}`} id="reviewForm">
                                    <h3>Share Your Experience</h3>
                                    {/* Form calls handleSubmitReview on submit */}
                                    <form onSubmit={handleSubmitReview}>
                                        {/* Overall Rating (Stars) */}
                                        <div className="form-group">
                                            <label>Overall Rating</label>
                                            <div className="rating-input">
                                                {/* ... (star rating inputs) ... */}
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

                                        {/* Detailed Ratings (Sliders) */}
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="difficulty">Difficulty (1-5)</label>
                                                <div className="range-container">
                                                    <input type="range" name="difficulty" id="difficulty" min="1" max="5" defaultValue="3" />
                                                    <span className="range-value">3</span>
                                                </div>
                                            </div>
                                            {/* ... (workload slider) ... */}
                                            <div className="form-group">
                                                <label htmlFor="workload">Workload (1-5)</label>
                                                <div className="range-container">
                                                    <input type="range" name="workload" id="workload" min="1" max="5" defaultValue="3" />
                                                    <span className="range-value">3</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            {/* ... (usefulness slider) ... */}
                                            <div className="form-group">
                                                <label htmlFor="usefulness">Usefulness (1-5)</label>
                                                <div className="range-container">
                                                    <input type="range" name="usefulness" id="usefulness" min="1" max="5" defaultValue="3" />
                                                    <span className="range-value">3</span>
                                                </div>
                                            </div>
                                            {/* ... (fun slider) ... */}
                                            <div className="form-group">
                                                <label htmlFor="fun">Engagement/Interesting (1-5)</label>
                                                <div className="range-container">
                                                    <input type="range" name="fun" id="fun" min="1" max="5" defaultValue="3" />
                                                    <span className="range-value">3</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Optional Fields (Accordions) */}
                                        {/* Grade Received */}
                                        <div className="optional-form-section">
                                            <div className={`optional-header ${expandedOptionalFields.grade ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'grade')}>
                                                Grade Received (Optional) <i className="fas fa-plus"></i>
                                            </div>
                                            <div className={`optional-content ${expandedOptionalFields.grade ? 'expanded' : ''}`}>
                                                <div className="form-group">
                                                    <select name="gradeReceived" id="gradeReceived" defaultValue="">
                                                        {/* ... (grade options) ... */}
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

                                        {/* ... (Other optional sections: Pass, Take Again, Extra Cost, Attendance, Participation) ... */}
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
                                        
                                        {/* Review Text Area */}
                                        <div className="form-group">
                                            <label htmlFor="reviewText" style={{fontSize: '1.2rem', fontWeight: '600'}}>Your Personal Review</label>
                                            <textarea name="reviewText" id="reviewText" rows="4" placeholder="Share your experience with this course..." required></textarea>
                                        </div>

                                        {/* Form Action Buttons */}
                                        <div className="form-actions">
                                            <button type="submit" className="submit-btn">Submit Review</button>
                                            <button type="button" className="cancel-btn" onClick={handleToggleReviewForm}>Cancel</button>
                                        </div>
                                    </form>
                                </div>

                                {/* 4e. Review List */}
                                {/* This section maps over the 'reviews' array in courseState */}
                                <div id="reviewsList">
                                    {courseState.reviews.length > 0 ? (
                                        // If reviews exist, map them to ReviewCard components
                                        courseState.reviews.map(review => (
                                            <ReviewCard key={review.id} review={review} />
                                        ))
                                    ) : (
                                        // Otherwise, show a fallback message
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
// Export the component for use in other files (like index.js or router)
export default CourseDetail;