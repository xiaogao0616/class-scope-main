// src/App.jsx

// --- Imports ---
// Import React and standard hooks (useState, useEffect, useCallback)
import React, { useState, useEffect, useCallback } from 'react';
// Import *local* course data and a utility function to get all courses
import { courseData, getAllCourses } from './data';
// Import reusable UI components
import CourseCard from './components/CourseCard.jsx';
import Notification from './components/Notification.jsx';
// NEW: Define the base URL, same as in CourseDetail.jsx
const API_BASE_URL = "http://127.0.0.1:8000";

// --- Component Definition ---
// Define the main component for the Homepage
const App = () => {
    
    // --- State Management (Replacing global variables & UI state from JS) ---
    // Holds input from the "Popular Courses" search bar
    const [searchTerm, setSearchTerm] = useState({ subject: '', catalog: '' });
    // Holds the selected university from the hero section
    const [selectedUniversity, setSelectedUniversity] = useState('University of North Carolina at Chapel Hill');
    // Holds the list of courses to display in the "Popular Courses" grid
    const [displayedCourses, setDisplayedCourses] = useState([]);
    // State to manage showing success/error notifications
    const [notification, setNotification] = useState({ message: '', type: '' });
    // NEW STATE: To control the expansion of individual optional fields
    // Manages the open/closed state of optional accordions in the *homepage* review form
    const [expandedOptionalFields, setExpandedOptionalFields] = useState({});
    
    // --- Constants and Utilities ---
    // UNC-CH key is hardcoded in original JS.
    // Determines the key to use for accessing the local 'courseData' object
    const universityKey = selectedUniversity === "University of North Carolina at Chapel Hill" ? 'uncch' : selectedUniversity.toLowerCase();

    // Utility to clear notification
    // Creates a memoized function to clear the notification state
    const clearNotification = useCallback(() => setNotification({ message: '', type: '' }), []);

    // Replaces loadSampleCourses & setupEventListeners from original JS
    // --- Lifecycle Hook (On Mount) ---
    // This useEffect hook runs *once* when the component mounts (empty dependency array [])
    useEffect(() => {
        // Load initial 6 popular courses on mount (from loadSampleCourses)
        // Gets all courses from the *local* data and sets the first 6 to display
        const all = getAllCourses(courseData);
        setDisplayedCourses(all.slice(0, 6));
        
        // Setup range sliders (Replaces setupRangeSliders in dom.js)
        // This function updates the "span" next to a range slider with its current value
        const handleRangeInput = (e) => {
            const span = e.target.parentElement.querySelector('.range-value');
            if (span) {
                span.textContent = e.target.value;
            }
        };

        // Find all range sliders on the page and attach the event listener
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => slider.addEventListener('input', handleRangeInput));
        
        // Setup smooth scrolling event listeners (Replaces part of setupEventListeners in interaction.js)
        // This handles clicks on anchor links (e.g., href="#courses")
        const anchors = document.querySelectorAll('a[href^="#"]');
        const clickHandler = (e) => {
            e.preventDefault(); // Stop the default jump behavior
            const target = document.querySelector(e.currentTarget.getAttribute('href'));
            // If the target element exists, scroll to it smoothly
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        // Attach the click handler to all anchor links
        anchors.forEach(anchor => anchor.addEventListener('click', clickHandler));
        
        // Cleanup function for event listeners
        // This runs when the component unmounts to prevent memory leaks
        return () => {
            sliders.forEach(slider => slider.removeEventListener('input', handleRangeInput));
            anchors.forEach(anchor => anchor.removeEventListener('click', clickHandler));
        };

    }, []); // Empty array means this runs only once on mount
    
    // --- Data Filtering Logic (Replaces filterCourses from interaction.js) ---
    // Memoized function to filter the *local* course data based on the 'searchTerm' state
    const filterCourses = useCallback(() => {
        const { subject, catalog } = searchTerm;
        const subjectTerm = subject.toUpperCase().trim();
        const catalogTerm = catalog.trim();
        
        // If the university data doesn't exist, show no courses
        if (!courseData[universityKey]) {
            setDisplayedCourses([]);
            return;
        }

        let allCourses = [];
        const subjects = courseData[universityKey];
        
        // If a subject is specified, filter by it. Otherwise, use all subjects.
        if (subjectTerm && subjects[subjectTerm]) {
            allCourses = subjects[subjectTerm];
        } else {
            allCourses = Object.values(subjects).flat();
        }

        // Filter the courses based on subject and catalog terms
        const filtered = allCourses.filter(course => {
            const courseTitleUpper = course.title.toUpperCase().trim();
            const courseCodeUpper = course.code.toUpperCase().trim();
            
            const matchesSubject = !subjectTerm || courseTitleUpper.startsWith(subjectTerm);
            const matchesCatalog = !catalogTerm || courseTitleUpper.includes(catalogTerm) || courseCodeUpper.includes(catalogTerm);

            return matchesSubject && matchesCatalog;
        });

        // Display only the first 6 for the "Popular Courses" section
        setDisplayedCourses(filtered.slice(0, 6)); 
    }, [searchTerm, universityKey]); // Dependencies: Re-run if search or university changes

    // Run filter when search terms change (Replacing 'input' listeners)
    // This useEffect hook triggers the filter function whenever 'searchTerm' changes
    useEffect(() => {
        filterCourses();
    }, [searchTerm, filterCourses]);

    // Replaces updateBrowseCatalogOptions from dom.js
    // --- Utility Function ---
    // Gets a list of valid course numbers for a given subject (used for datalists)
    const getCatalogOptions = (subjectCode) => {
        const subject = subjectCode.toUpperCase().trim();
        // Check if the subject exists in the local data
        if (courseData[universityKey] && courseData[universityKey][subject]) {
            // Map over the courses for that subject and extract the number
            return courseData[universityKey][subject].map(course => {
                const parts = course.title.split(' ');
                return parts.length > 1 ? parts[1] : null;
            }).filter(Boolean); // Filter out any null/invalid entries
        }
        return []; // Return empty array if subject not found
    };
    
    // --- Interaction Handlers (Replacing functions from interaction.js) ---

    // Replaces browseCourses from interaction.js
    // Handles clicking the "Browse Courses" button in the hero section
    const handleBrowseAllCourses = () => {
        if (!selectedUniversity) {
            alert('Please select a university first!');
            return;
        }
        
        // This relies on the smooth scrolling effect from useEffect above
        // Scrolls the user down to the #courses section
        document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Get all courses from local data
        const allCourses = getAllCourses(courseData);
        // FIX APPLIED (from previous request): Ensure it displays only the popular 6 initially.
        setDisplayedCourses(allCourses.slice(0, 6)); 
    };

    // Handles clicking the "Search" button in the "Popular Courses" section
    const handleSearchCourses = async () => { // 1. Make the function async
        const subjectInput = document.getElementById("subjectSearch").value.toUpperCase().trim();
        const catalogInput = document.getElementById("catalogSearch").value.trim();

        // 2. Basic validation (changed alert to notification)
        if (!subjectInput || !catalogInput) {
            setNotification({ message: 'Please enter both subject and catalog number.', type: 'error' });
            return;
        }

        // 3. Get the selected school from state
        const school = selectedUniversity; // 'selectedUniversity' is from useState

        // 4. Add try...catch block to handle the backend call
        try {
            // 5. Construct the URL for the validation/fetch endpoint
            // We use the same endpoint as CourseDetail.jsx
            const url = `${API_BASE_URL}/get_course_details?school=${encodeURIComponent(school)}&subject=${encodeURIComponent(subjectInput)}&courseNumber=${encodeURIComponent(catalogInput)}`;

            // 6. Call the endpoint just to check if it exists
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
                        errorMessage = `Course ${subjectInput} ${catalogInput} was not found. Please check the subject and number.`;
                    }
                } catch (jsonError) {
                    // If backend sent non-JSON error
                    errorMessage = `Error: ${response.statusText}`;
                }
                // Throw an error to be caught by the catch block below
                throw new Error(errorMessage); 
            }

            // 8. SUCCESS: If response.ok is true, the course is valid.
            // Now we can safely redirect the user.
            const fullCourseCode = subjectInput + " " + catalogInput; 
            const courseCode = encodeURIComponent(fullCourseCode);
            
            // Navigate to the detail page
            window.location.href = `?course=${courseCode}`;

        } catch (error) {
            // 9. CATCH: Show the error notification (e.g., "Course not found...")
            console.error("Error checking course existence:", error);
            setNotification({ message: error.message, type: 'error' });
            // We DO NOT redirect if there's an error
        }
    };

    // Handles clearing the review form on the homepage
    const handleClearForm = () => {
        const form = document.getElementById('reviewForm');
        if (form) {
            form.reset(); // Reset all form fields
            // Manually reset range values and spans 
            document.querySelectorAll('#reviewForm input[type="range"]').forEach(input => input.value = '3');
            document.querySelectorAll('#reviewForm .range-value').forEach(span => span.textContent = '3');
            // Reset the search term state (which is linked to the form's subject/catalog inputs)
            setSearchTerm({ subject: '', catalog: '' }); 
            setExpandedOptionalFields({}); // Collapse all optional fields
        }
    };

    // Replaces submitReview from interaction.js
    // Handles submission of the review form on the *homepage*
    const handleSubmitReview = async (e) => { // 1. Make the function async
        e.preventDefault(); // Stop default form submission
        
        // Extracting form data using FormData
        const formData = new FormData(e.target);
        const formObj = Object.fromEntries(formData.entries());
        
        // Destructure all fields from the form object
        const { 
            schoolSelect: school, 
            subjectInput: subject, 
            courseNumber, 
            rating, 
            reviewText,
            difficulty,
            workload,
            usefulness,
            fun,
            gradeReceived: grade,
            passedClass: passed,
            wouldTakeAgain,
            extraCost,
            requireAttendance,
            requireParticipation
        } = formObj;

        // Form Validation (Kept the simple 'is it empty?' checks)
        if (!school || !subject || !courseNumber) {
            setNotification({ message: 'Please fill in school, subject, and catalog number!', type: 'error' });
            return;
        }
        if(!rating){
            setNotification({ message: 'You forgot to select your overall rating!', type: 'error' });
            return;
        }

        // --- 2. VALIDATION BLOCK REMOVED ---
        // The old check against 'getCatalogOptions' and 'validOptions'
        // is now gone. We trust the backend to do this.
        
        // Build review object for backend submission
        const review = {
            school,
            subject: subject.trim(),
            courseNumber,
            professorName: null, // Professor not included in this form
            rating: parseInt(rating),
            reviewText: reviewText || null,
            difficulty: parseInt(difficulty),
            workload: parseInt(workload),
            usefulness: parseInt(usefulness),
            fun: parseInt(fun),
            timestamp: new Date().toISOString(),
            // Optional fields
            grade: grade || null,
            passed: passed || null,
            wouldTakeAgain: wouldTakeAgain || null,
            extraCost: extraCost || null,
            requireAttendance: requireAttendance || null,
            requireParticipation: requireParticipation || null,
        };

        // --- 3. ADDED TRY...CATCH BLOCK ---
        try {
            // Send POST request to backend
            const response = await fetch(`${API_BASE_URL}/submit_review`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(review)
            });

            // --- 4. IMPROVED ERROR HANDLING ---
            // Handle non-successful responses
            if (!response.ok) {
                let errorMessage = "Failed to submit review. Please check the server.";
                // Try to parse a specific error message from the backend (e.g., { "detail": "Invalid course" })
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.detail) {
                         errorMessage = errorData.detail;
                    } else if (response.status === 404) {
                        // Fallback for a simple 404
                        errorMessage = `Course ${subject} ${courseNumber} was not found. Please check the subject and number.`;
                    }
                } catch (jsonError) {
                    // Could not parse JSON, just use the status text
                    errorMessage = `Error: ${response.statusText}`;
                }
                // Throw an error to be caught by the catch block
                throw new Error(errorMessage);
            }
            
            // If we are here, the response was successful
            setNotification({ message: 'Review submitted successfully! Thank you for your contribution.', type: 'success' });
            handleClearForm(); // Use the clear handler to reset everything

        } catch (error) {
            // Handle any errors during submission (network, or the error we threw)
            console.error('Error submitting review:', error);
            // This will now display the specific error from the backend
            setNotification({ message: error.message, type: 'error' });
        }
    };
    // NEW HANDLER: Toggles individual optional fields
    // Handles clicking on an optional field accordion in the homepage review form
    const handleToggleOptionalField = (e, fieldName) => {
        e.preventDefault(); // Prevent default button/link behavior
        // Toggle the boolean value for the specific fieldName in the state
        setExpandedOptionalFields(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };


    // --- Render (JSX replaces index.html body) ---
    // This is the JSX that defines the HTML structure of the page
    return (
        <>
            {/* 1. Notification Component */}
            {/* Displays success/error messages */}
            <Notification message={notification.message} type={notification.type} clearNotification={clearNotification} />
            
            {/* 2. Nav Bar Component */}
            {/* Uses anchor links (e.g., #home, #courses) for smooth scrolling */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo">
                        <i className="fas fa-graduation-cap"></i>
                        <span>ClassScope</span>
                    </div>
                    <div className="nav-menu">
                        <a href="#home" className="nav-link active">Home</a>
                        <a href="#courses" className="nav-link">Browse Courses</a>
                        <a href="#upload" className="nav-link">Upload Review</a>
                        <a href="#about" className="nav-link">About</a>
                    </div>
                    {/* Mobile menu toggle (functionality not fully implemented in this file) */}
                    <div className="nav-toggle">
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </div>
                </div>
            </nav>

            {/* 3. Home/Hero Section */}
            {/* Contains the main headline, description, and university selector */}
            <section id="home" className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Find the Perfect Course with
                            <span className="highlight">Student Reviews</span>
                        </h1>
                        <p className="hero-description">
                            Discover honest reviews, ratings, and insights from fellow students who have actually taken the courses. 
                            Make informed decisions about your academic journey.
                        </p>
                        
                        {/* University Selector and Browse Button */}
                        <div className="university-selector">
                            <div className="selector-container">
                                <i className="fas fa-university"></i>
                                <input 
                                    className="university-dropdown" 
                                    id="universitySelect" 
                                    placeholder="Select or search your school" 
                                    required 
                                    list="universityOptions" 
                                    autoComplete="off"
                                    value={selectedUniversity} // Controlled input
                                    onChange={(e) => setSelectedUniversity(e.target.value)} // Update state on change
                                />
                                <datalist id="universityOptions">   
                                <option value="University of North Carolina at Chapel Hill"></option>
                                </datalist>
                            </div>
                            <button className="browse-btn" onClick={handleBrowseAllCourses}>
                                <i className="fas fa-search"></i>
                                Browse Courses
                            </button>
                        </div>
                    </div>
                    
                    {/* Floating Cards (Restored) */}
                    {/* These are static decorative elements */}
                    <div className="hero-image">
                        <div className="floating-card card-1">
                            {/* ... (Static content for card 1) ... */}
                            <div className="card-header">
                                <div className="course-info">
                                    <h3>COMP 110</h3>
                                    <p>Intro Programming</p>
                                </div>
                                <div className="rating">
                                    <div className="stars">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                    </div>
                                    <span className="rating-text">4.8/5</span>
                                </div>
                            </div>
                            <div className="card-content">
                                <p className="review-text">"The course is well-structured and the assignments are sometimes challenging but fair. The workload is definitely not too bad."</p>
                                <div className="reviewer">
                                    <i className="fas fa-user-circle"></i>
                                    <span>Sarah M.</span>
                                </div>
                            </div>
                        </div>
                        <div className="floating-card card-2">
                            {/* ... (Static content for card 2) ... */}
                            <div className="card-header">
                                <div className="course-info">
                                    <h3>MATH 233</h3>
                                    <p>Calculus of Functions of Several Variables</p>
                                </div>
                                <div className="rating">
                                    <div className="stars">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="far fa-star"></i>
                                    </div>
                                    <span className="rating-text">4.0/5</span>
                                </div>
                            </div>
                            <div className="card-content">
                                <p className="review-text">"It's Calc 1 with a 3rd dimension added. More computation focused. It's definitely not easy but manageable."</p>
                                <div className="reviewer">
                                    <i className="fas fa-user-circle"></i>
                                    <span>Alex P.</span>
                                </div>
                            </div>
                        </div>
                        <div className="floating-card card-3">
                            {/* ... (Static content for card 3) ... */}
                            <div className="card-header">
                                <div className="course-info">
                                    <h3>STOR 320</h3>
                                    <p>Methods and Models of Data Science</p>
                                </div>
                                <div className="rating">
                                    <div className="stars">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star-half-alt"></i>
                                    </div>
                                    <span className="rating-text">4.5/5</span>
                                </div>
                            </div>
                            <div className="card-content">
                                <p className="review-text">"STOR 320 involves using code, you will have a group project and there is a participation grade based on how your group mates rate your participation"</p>
                                <div className="reviewer">
                                    <i className="fas fa-user-circle"></i>
                                    <span>Jamie L.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Features Section */}
            {/* Static content describing the site's features */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">Why Choose ClassScope?</h2>
                    <div className="features-grid">
                        {/* ... (Static feature cards) ... */}
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-star"></i>
                            </div>
                            <h3>Real Student Reviews</h3>
                            <p>Get authentic feedback from students who have actually taken the courses</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <h3>Detailed Ratings</h3>
                            <p>Comprehensive ratings for difficulty, workload, professor quality, and more</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-upload"></i>
                            </div>
                            <h3>Easy Upload</h3>
                            <p>Share your own course experiences quickly and easily</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-search"></i>
                            </div>
                            <h3>Smart Search</h3>
                            <p>Find courses by keywords and subjects</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Course Browse Section */}
            {/* Contains the search bar for courses and the grid of course cards */}
            <section id="courses" className="course-browse">
                <div className="container">
                    <h2 className="section-title">Popular Courses</h2>
                    {/* Search bar for filtering local courses */}
                    <div className="search-bar">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            id="subjectSearch" 
                            placeholder="Subject (e.g., COMP, MATH)" 
                            required 
                            list="SubjectList" 
                            autoComplete="off"
                            value={searchTerm.subject} // Controlled input from state
                            onChange={(e) => {
                                // Clear catalog search when subject changes to update datalist
                                setSearchTerm(prev => ({ ...prev, subject: e.target.value, catalog: '' }));
                            }}
                        />
                        {/* Subject Datalist (Restored) */}
                        {/* Provides suggestions for the subject input */}
                        <datalist id="SubjectList">   
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
                            id="catalogSearch" 
                            placeholder="Number (e.g., 110, 231)" 
                            required 
                            list="CatalogNumberList" 
                            autoComplete="off"
                            value={searchTerm.catalog} // Controlled input from state
                            onChange={(e) => setSearchTerm(prev => ({ ...prev, catalog: e.target.value }))}
                        />
                        
                        {/* This search button navigates to the detail page */}
                        <button className="search-btn" onClick={handleSearchCourses}>Search</button>
                    </div>
                    
                    {/* Display Courses */}
                    {/* This grid maps over the 'displayedCourses' state */}
                    <div className="course-grid" id="courseGrid">
                        {displayedCourses.length > 0 ? (
                            // If courses exist, map them to CourseCard components
                            displayedCourses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))
                        ) : (
                            // Otherwise, show a fallback message
                            <div className="no-courses">No courses found matching your criteria.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* 6. Review Upload Section */}
            {/* Contains the "Upload Review" form */}
            <section id="upload" className="upload-section">
                <div className="container">
                    <h2 className="section-title">Help Other Students Choose</h2>
                    <div className="upload-container">
                        <div className="upload-form">
                            <h3>Your review could save someone's GPA</h3>
                            {/* Form calls handleSubmitReview on submit */}
                            <form id="reviewForm" onSubmit={handleSubmitReview}>
                                {/* --- Form Fields (School, Subject, Number, Rating) --- */}
                                <div className="form-group">
                                    <label htmlFor="schoolSelect">School</label>
                                    <input name="schoolSelect" id="schoolSelect" placeholder="Select or search your school..." required list="universityOptions" autoComplete="off" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="subjectInput">Subject</label>
                                    <div className="subject-container">
                                        <input 
                                            type="text" 
                                            name="subjectInput"
                                            id="subjectInput" 
                                            placeholder="Select or search subject..." 
                                            required 
                                            list="subjectOptions" 
                                            autoComplete="off" 
                                            // Update subject search term to enable datalist updates
                                            // This links this form's subject input to the 'searchTerm' state
                                            onChange={(e) => setSearchTerm(prev => ({...prev, subject: e.target.value}))}
                                        />
                                        {/* Subject Options (Restored) */}
                                        <datalist id="subjectOptions">
                                            <option value="AAAD">African, African American and Diaspora Studies</option>
                                            <option value="AMST">American Studies</option>
                                            <option value="ANTH">Anthropology</option>
                                            <option value="APPL">Applied Physical Sciences</option>
                                            <option value="ARAB">Arabic</option>
                                            <option value="ARTH">Art History</option>
                                            <option value="ARTS">Studio Art</option>
                                            <option value="ASTR">Astronomy</option>
                                            <option value="BIOL">Biology</option>
                                            <option value="BMME">Biomedical Engineering</option>
                                            <option value="BUSI">Business Administration</option>
                                            <option value="CHEM">Chemistry</option>
                                            <option value="CHIN">Chinese</option>
                                            <option value="CLAR">Classical Archaeology</option>
                                            <option value="CLAS">Classics</option>
                                            <option value="COMM">Communication Studies</option>
                                            <option value="COMP">Computer Science</option>
                                            <option value="DRAM">Dramatic Art</option>
                                            <option value="ECON">Economics</option>
                                            <option value="EDUC">Education</option>
                                            <option value="ENEC">Environmental Science</option>
                                            <option value="ENGL">English</option>
                                            <option value="ENVR">Environmental Engineering</option>
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
                                            <option value="NURS">Nursing</option>
                                            <option value="PHIL">Philosophy</option>
                                            <option value="PHYS">Physics</option>
                                            <option value="PLCY">Public Policy</option>
                                            <option value="POLI">Political Science</option>
                                            <option value="PSYC">Psychology</option>
                                            <option value="RELI">Religious Studies</option>
                                            <option value="RUSS">Russian</option>
                                            <option value="SOCI">Sociology</option>
                                            <option value="SPAN">Spanish</option>
                                            <option value="STOR">Statistics and Operations Research</option>
                                            <option value="WGST">Women's and Gender Studies</option>
                                        </datalist>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="courseNumber">Catalog Number</label>
                                    <input 
                                        type="text" 
                                        name="courseNumber"
                                        id="courseNumber" 
                                        placeholder="e.g., 101, 210, 320, etc." 
                                        required 
                                        list="UploadCatalogNumberList" 
                                        autoComplete="off"
                                        value={searchTerm.catalog} // Linked to 'searchTerm' state
                                        onChange={(e) => setSearchTerm(prev => ({...prev, catalog: e.target.value}))}
                                    />
                    
                                </div>
                                {/* Overall Rating (Stars) */}
                                <div className="form-group">
                                    <label htmlFor="rating">Overall Rating</label>
                                    <div className="rating-input">
                                        {/* No default checked star applied */}
                                        <input type="radio" name="rating" value="5" id="star5" />
                                        <label htmlFor="star5"><i className="fas fa-star"></i></label>
                                        {/* ... (other star inputs) ... */}
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
                                
                                {/* --- DETAILED RATINGS (MANDATORY) --- */}
                                {/* Contains the range sliders for Difficulty, Workload, etc. */}
                                <div className="rating-section">
                                    <h4>Detailed Ratings</h4>
                                    {/* ... (existing detailed ratings) ... */}
                                    <div className="form-group">
                                        <label htmlFor="difficulty">Difficulty (1-5)</label>
                                        <div className="range-container">
                                            <input type="range" name="difficulty" id="difficulty" min="1" max="5" defaultValue="3" />
                                            <span className="range-value">3</span>
                                        </div>
                                    </div>
                                    {/* ... (workload, usefulness, fun sliders) ... */}
                                    <div className="form-group">
                                        <label htmlFor="workload">Workload (1-5)</label>
                                        <div className="range-container">
                                            <input type="range" name="workload" id="workload" min="1" max="5" defaultValue="3" />
                                            <span className="range-value">3</span>
                                        </div>
                                    </div>
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

                                {/* --- NEW: INDIVIDUAL OPTIONAL FIELDS --- */}
                                {/* Each section is an accordion controlled by 'expandedOptionalFields' state */}
                                <div className={`optional-form-section ${expandedOptionalFields.grade ? 'expanded-section' : ''}`}>
                                    {/* The header toggles the state on click */}
                                    <div className={`optional-header ${expandedOptionalFields.grade ? 'expanded' : ''}`} 
                                         onClick={(e) => handleToggleOptionalField(e, 'grade')}>
                                        Grade Received (Optional)  <i className="fas fa-plus"></i>
                                    </div>
                                    {/* The content's visibility is controlled by the 'expanded' class */}
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
                                {/* This is a repetitive pattern of accordions */}
                                <div className={`optional-form-section ${expandedOptionalFields.grade ? 'expanded-section' : ''}`}>
                                    <div className={`optional-header ${expandedOptionalFields.pass ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'pass')}>
                                        Did you pass? (Optional)  <i className="fas fa-plus"></i>
                                    </div>
                                    <div className={`optional-content ${expandedOptionalFields.pass ? 'expanded' : ''}`}>
                                        <div className="form-group">
                                            <select name="passedClass" id="passedClass" defaultValue="">
                                                <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className={`optional-form-section ${expandedOptionalFields.grade ? 'expanded-section' : ''}`}>
                                    <div className={`optional-header ${expandedOptionalFields.takeAgain ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'takeAgain')}>
                                        Would take again? (Optional)  <i className="fas fa-plus"></i>
                                    </div>
                                    <div className={`optional-content ${expandedOptionalFields.takeAgain ? 'expanded' : ''}`}>
                                        <div className="form-group">
                                            <select name="wouldTakeAgain" id="wouldTakeAgain" defaultValue="">
                                                <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className={`optional-form-section ${expandedOptionalFields.grade ? 'expanded-section' : ''}`}>
                                    <div className={`optional-header ${expandedOptionalFields.extraCost ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'extraCost')}>
                                        Extra Cost? (Optional)  <i className="fas fa-plus"></i>
                                    </div>
                                    <div className={`optional-content ${expandedOptionalFields.extraCost ? 'expanded' : ''}`}>
                                        <div className="form-group">
                                            <select name="extraCost" id="extraCost" defaultValue="">
                                                <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`optional-form-section ${expandedOptionalFields.grade ? 'expanded-section' : ''}`}>
                                    <div className={`optional-header ${expandedOptionalFields.attendance ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'attendance')}>
                                        Required Attendance? (Optional)  <i className="fas fa-plus"></i>
                                    </div>
                                    <div className={`optional-content ${expandedOptionalFields.attendance ? 'expanded' : ''}`}>
                                        <div className="form-group">
                                            <select name="requireAttendance" id="requireAttendance" defaultValue="">
                                                <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className={`optional-form-section ${expandedOptionalFields.grade ? 'expanded-section' : ''}`}>
                                    <div className={`optional-header ${expandedOptionalFields.participation ? 'expanded' : ''}`} onClick={(e) => handleToggleOptionalField(e, 'participation')}>
                                        Required Participation? (Optional)  <i className="fas fa-plus"></i>
                                    </div>
                                    <div className={`optional-content ${expandedOptionalFields.participation ? 'expanded' : ''}`}>
                                        <div className="form-group">
                                            <select name="requireParticipation" id="requireParticipation" defaultValue="">
                                                <option value="">Select</option><option value="yes">Yes</option><option value="no">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {/* --- END NEW OPTIONAL SECTION --- */}


                                {/* Review Text Area */}
                                <div className="form-group">
                                    <label htmlFor="reviewText" style={{fontSize: '1.2rem', fontWeight: '600'}}>Your Personal Review</label>
                                    <textarea name="reviewText" id="reviewText" rows="4" placeholder="Share your thoughts about this course..."></textarea>
                                </div>
                                {/* Form Action Buttons */}
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        <i className="fas fa-upload"></i>
                                        Submit Review
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={handleClearForm}>
                                        Clear Form
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Footer Component */}
            {/* Static footer with site links */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        {/* ... (Static footer sections) ... */}
                        <div className="footer-section">
                            <h3>ClassScope</h3>
                            <p>Empowering students with honest course reviews and ratings.</p>
                        </div>
                        <div className="footer-section">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><a href="#home">Home</a></li>
                                <li><a href="#courses">Browse Courses</a></li>
                                <li><a href="#upload">Upload Review</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Contact Us</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 ClassScope. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

// Export the component for use in other files
export default App;