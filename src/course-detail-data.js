// src/course-detail-data.js

// Add UNC-CH data structure for search validation and filtering (The source of truth for course codes)
export const uncchCourseCatalog = { 
    'AAAD': [
        { id: 20, title: "AAAD 101", code: "Intro to African American Studies", professor: "N/A", rating: 4.3, difficulty: 2, workload: 3, description: "Introductory survey.", reviews: 150 },
        { id: 21, title: "AAAD 386", code: "Black Cultures and Digital Media", professor: "N/A", rating: 4.6, difficulty: 3, workload: 3, description: "Examines intersection of black cultures and digital technologies.", reviews: 80 }
    ],
    'COMP': [
        { id: 10, title: "COMP 110", code: "Introduction to Programming", professor: "Prof. X", rating: 4.8, difficulty: 3, workload: 3, description: "Fundamentals of programming using a modern language.", reviews: 1200 },
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
};


export const defaultCourseData = { 
            title: "COMP 110",
            code: "Introduction to Programming",
            description: "An introduction to programming and problem solving. Students learn how to design, code, and test programs using Python. Topics include variables, data types, control structures, functions, and basic data structures. This course provides a foundation for further study in computer science.",
            overallRating: 4.6,
            totalReviews: 142,
            difficulty: 3.2,
            workload: 3.5,
            professorQuality: 4.3,
            fun: 4.1,
            ratingDistribution: {
                5: 78,
                4: 42,
                3: 15,
                2: 5,
                1: 2
            },
            reviews: [
                {
                    id: 1, author: "Sarah M.", date: "2024-09-15", rating: 5, difficulty: 3, workload: 3, professorQuality: 5, fun: 4, grade: "A", passed: "yes", wouldTakeAgain: "yes", textbookRequired: "no", text: "Great intro course! The professor explains concepts clearly and the assignments build on each other nicely. Lab sessions are really helpful for getting hands-on practice."
                },
                {
                    id: 2, author: "Alex P.", date: "2024-09-10", rating: 4, difficulty: 4, workload: 4, professorQuality: 4, fun: 4, grade: "B+", passed: "yes", wouldTakeAgain: "yes", textbookRequired: "no", text: "Solid course overall. The workload can be heavy at times, especially when projects are due. Make sure to start early and attend office hours if you get stuck."
                },
                {
                    id: 3, author: "Jamie L.", date: "2024-09-05", rating: 5, difficulty: 2, workload: 3, professorQuality: 5, fun: 5, grade: "A", passed: "yes", wouldTakeAgain: "yes", textbookRequired: "no", text: "This was my first programming course and I loved it! The professor made it fun and engaging. I went from knowing nothing about coding to building my own projects."
                },
                {
                    id: 4, author: "Chris T.", date: "2024-08-28", rating: 4, difficulty: 3, workload: 4, professorQuality: 4, fun: 3, grade: "B", passed: "yes", wouldTakeAgain: "no", textbookRequired: "no", text: "Good course structure. The exams are fair and test what you've learned. TAs are knowledgeable and helpful during lab sessions."
                }
            ]
        };

export const courseMap = { 
    'COMP110': {
        title: 'COMP 110', code: 'Introduction to Programming', description: 'An introduction to programming and problem solving. Students learn Python and basic programming concepts.', overallRating: 4.6, totalReviews: 142, difficulty: 3.2, workload: 3.5, professorQuality: 4.3, fun: 4.1, ratingDistribution: {5:78,4:42,3:15,2:5,1:2}, reviews: defaultCourseData.reviews
    },
    'MATH231': {
        title: 'MATH 231', code: 'Calculus I', description: 'Limits, derivatives, and integrals with applications.', overallRating: 4.1, totalReviews: 88, difficulty: 3.8, workload: 3.9, professorQuality: 4.0, fun: 3.6, ratingDistribution: {5:40,4:25,3:15,2:6,1:2}, reviews: [
            { id: 1, author: 'Taylor R.', date: '2024-05-12', rating: 4, difficulty: 4, workload:4, professorQuality:4, fun:3, grade:'B+', passed:'yes', wouldTakeAgain:'no', textbookRequired:'yes', text:'Strong calculus fundamentals, but expect weekly problem sets.' }
        ]
    },
    'STOR320': {
        title: 'STOR 320', code: 'Methods and Models of Data Science', description: 'Data science methods with practical projects and group work.', overallRating: 4.4, totalReviews: 76, difficulty: 3.6, workload: 3.7, professorQuality: 4.2, fun: 4.0, ratingDistribution: {5:50,4:18,3:5,2:2,1:1}, reviews: [
            { id: 1, author: 'Jordan S.', date: '2024-04-20', rating:5, difficulty:3, workload:3, professorQuality:5, fun:5, grade:'A', passed:'yes', wouldTakeAgain:'yes', textbookRequired:'no', text:'Hands-on and project driven – great for practical skills.' }
        ]
    }
};