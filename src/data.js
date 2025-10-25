// data.js

// Sample course data
// NOTE: For a real backend integration, this data structure would be 
// replaced by API calls (e.g., fetch('/api/courses?university=uncch'))
export const courseData = { // <-- ADDED 'export'
        // *** UPDATED: UNC-CH sample course data with more subjects ***
    uncch: {
        'COMP': [
            { id: 10, title: "COMP 110", code: "Intro to Programming", professor: "Prof. X", rating: 4.8, difficulty: 3, workload: 3, description: "Fundamentals of programming using a modern language.", reviews: 1200 },
            { id: 11, title: "COMP 301", code: "Databases", professor: "Prof. Y", rating: 4.2, difficulty: 4, workload: 4, description: "Relational models and SQL.", reviews: 350 },
            { id: 12, title: "COMP 401", code: "Web Programming", professor: "Prof. Z", rating: 4.5, difficulty: 4, workload: 4, description: "Client-side and server-side web development.", reviews: 600 }
        ],
        'MATH': [
            { id: 13, title: "MATH 231", code: "Calculus of One Variable", professor: "Prof. A", rating: 3.9, difficulty: 4, workload: 4, description: "Limits, derivatives, and integrals.", reviews: 900 },
            { id: 14, title: "MATH 233", code: "Calculus of Several Variables", professor: "Prof. B", rating: 4.0, difficulty: 4, workload: 4, description: "Multivariable differentiation and integration.", reviews: 750 }
        ],
        'HIST': [
            { id: 15, title: "HIST 128", code: "US History since 1865", professor: "Prof. C", rating: 4.6, difficulty: 2, workload: 3, description: "A survey of American history from the Civil War to the present.", reviews: 400 },
            { id: 16, title: "HIST 250", code: "Global History", professor: "Prof. D", rating: 4.1, difficulty: 3, workload: 3, description: "Themes in world history from ancient times to the present.", reviews: 250 }
        ],
        'CHEM': [
            { id: 17, title: "CHEM 101", code: "General Chemistry I", professor: "Prof. E", rating: 3.5, difficulty: 5, workload: 5, description: "Introduction to chemical principles.", reviews: 700 },
            { id: 18, title: "CHEM 261", code: "Organic Chemistry I", professor: "Prof. F", rating: 3.2, difficulty: 5, workload: 5, description: "First course in the study of carbon compounds.", reviews: 550 }
        ],
        'PSYC': [
            { id: 19, title: "PSYC 101", code: "General Psychology", professor: "Prof. G", rating: 4.7, difficulty: 2, workload: 2, description: "A survey of the scientific study of behavior and mental processes.", reviews: 850 }
        ]
    }
};

// Utility function to flatten all courses (used in App and CourseBrowse)
export const getAllCourses = (data = courseData) => 
    Object.values(data.uncch).flat(); // <-- ADDED 'export'