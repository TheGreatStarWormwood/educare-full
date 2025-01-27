const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 4405;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set up middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use(cors()); // Add CORS to allow cross-origin requests

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // Replace with your MySQL root password
    database: 'educare',
    port: 3307 // Use your MySQL container port
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database');
});



// Function to get all tutors with listings and reviews
async function getTutorsFromDatabase() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT tutors.*, 
                JSON_ARRAYAGG(
                    JSON_OBJECT('listingId', listings.id, 'keywords', listings.keywords)
                ) AS listings,
                JSON_ARRAYAGG(
                    JSON_OBJECT('text', reviews.text, 'stars', reviews.stars)
                ) AS reviews
            FROM tutors
            LEFT JOIN (
                SELECT DISTINCT id, tutor_id, keywords
                FROM listings
            ) AS listings ON tutors.id = listings.tutor_id
            LEFT JOIN (
                SELECT DISTINCT text, tutor_id, stars
                FROM reviews
            ) AS reviews ON tutors.id = reviews.tutor_id
            GROUP BY tutors.id;  -- Make sure each tutor is grouped correctly
        `;
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

app.get('/', (req, res) => {
    res.render('home', {
        pageTitle: 'Welcome to Tutor Directory',
        browseTutorsLink: '/tutors',
        lmsLink: '/lms',
        year: 2025,
    });
});

// directory route: Display items
app.get('/directory', (req, res) => {
    // Render the index.ejs file
    res.render('index');
});

// Route to return the tutor profile data as JSON
app.get('/tutor-profile', async (req, res) => {
    res.render('tutor-profile');
});

// Route to return the tutor profile data as JSON
app.get('/lms', async (req, res) => {
    res.render('lms');
});

// Route to return the tutor profile data as JSON
app.get('/course', async (req, res) => {
    res.render('course');
});



// CRUD routes for Tutors

app.get('/api/lms/:id/courses', async (req, res) => {
    const lmsId = req.params.id;
    console.log(`Fetching courses for LMS ID: ${lmsId}`);  // Add logging

    try {
        const query = `SELECT * FROM courses WHERE lms_id = ?`;
        db.query(query, [lmsId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);  // Log query errors
                res.status(500).json({ error: 'Failed to fetch courses' });
                return;
            }

            console.log('Query result:', results);  // Log the result
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);  // Log any other caught errors
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});


app.get('/api/students/:id/enrollments', async (req, res) => {
    const studentId = req.params.id;
    console.log(`Fetching enrollments for Student ID: ${studentId}`);  // Add logging

    try {
        const query = `SELECT * FROM enrollments WHERE student_id = ?`;
        db.query(query, [studentId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);  // Log query errors
                res.status(500).json({ error: 'Failed to fetch enrollments' });
                return;
            }

            console.log('Query result:', results);  // Log the result
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);  // Log any other caught errors
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
});

app.get('/api/courses/:id/materials', async (req, res) => {
    const courseId = req.params.id;
    console.log(`Fetching materials for Course ID: ${courseId}`);  // Add logging

    try {
        const query = `SELECT * FROM materials WHERE course_id = ?`;
        db.query(query, [courseId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);  // Log query errors
                res.status(500).json({ error: 'Failed to fetch materials' });
                return;
            }

            console.log('Query result:', results);  // Log the result
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);  // Log any other caught errors
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});

app.get('/api/courses/:id/assignments', async (req, res) => {
    const courseId = req.params.id;
    console.log(`Fetching assignments for Course ID: ${courseId}`);  // Add logging

    try {
        const query = `SELECT * FROM assignments WHERE course_id = ?`;
        db.query(query, [courseId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);  // Log query errors
                res.status(500).json({ error: 'Failed to fetch assignments' });
                return;
            }

            console.log('Query result:', results);  // Log the result
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);  // Log any other caught errors
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

app.get('/api/lms/:id', async (req, res) => {
    const lmsId = req.params.id;
    console.log(`Fetching LMS information for LMS ID: ${lmsId}`);  // Add logging

    try {
        const query = `SELECT * FROM lms WHERE id = ?`;
        db.query(query, [lmsId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);  // Log query errors
                res.status(500).json({ error: 'Failed to fetch LMS information' });
                return;
            }

            console.log('Query result:', results);  // Log the result
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);  // Log any other caught errors
        res.status(500).json({ error: 'Failed to fetch LMS information' });
    }
});

app.get('/api/tutor/:id/lms', async (req, res) => {
    const tutorId = req.params.id;
    console.log(`Fetching LMS for Tutor ID: ${tutorId}`);  // Add logging

    try {
        const query = `SELECT lms.* FROM lms
                       JOIN tutor_lms ON lms.id = tutor_lms.lms_id
                       WHERE tutor_lms.tutor_id = ?`;
        db.query(query, [tutorId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);  // Log query errors
                res.status(500).json({ error: 'Failed to fetch LMS' });
                return;
            }

            console.log('Query result:', results);  // Log the result
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);  // Log any other caught errors
        res.status(500).json({ error: 'Failed to fetch LMS' });
    }
});

app.get('/api/tutor/:id/courses', async (req, res) => {
    const tutorId = req.params.id;
    console.log(`Fetching courses for Tutor ID: ${tutorId}`);  // Add logging

    try {
        // First, get the LMS associated with the tutor
        const lmsQuery = `SELECT lms_id FROM tutor_lms WHERE tutor_id = ?`;
        db.query(lmsQuery, [tutorId], (err, lmsResults) => {
            if (err) {
                console.error('Error executing LMS query: ', err);  // Log query errors
                res.status(500).json({ error: 'Failed to fetch LMS for the tutor' });
                return;
            }

            if (lmsResults.length === 0) {
                return res.status(404).json({ error: 'No LMS found for the tutor' });
            }

            const lmsId = lmsResults[0].lms_id;

            // Now, fetch courses from the LMS
            const coursesQuery = `SELECT * FROM courses WHERE lms_id = ?`;
            db.query(coursesQuery, [lmsId], (err, coursesResults) => {
                if (err) {
                    console.error('Error executing courses query: ', err);  // Log query errors
                    res.status(500).json({ error: 'Failed to fetch courses' });
                    return;
                }

                console.log('Query result for courses:', coursesResults);  // Log the result
                res.json(coursesResults);
            });
        });
    } catch (err) {
        console.error('Caught error: ', err);  // Log any other caught errors
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

app.get('/api/students/:id/lms', async (req, res) => {
    const studentId = req.params.id;
    console.log(`Fetching LMS for Student ID: ${studentId}`);

    try {
        const query = `
            SELECT lms.* FROM lms
            JOIN enrollments ON lms.id = enrollments.lms_id
            WHERE enrollments.student_id = ?
        `;
        db.query(query, [studentId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);  // Log query errors
                res.status(500).json({ error: 'Failed to fetch LMS for the student' });
                return;
            }

            console.log('Query result:', results);  // Log the result
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);  // Log any other caught errors
        res.status(500).json({ error: 'Failed to fetch LMS for the student' });
    }
});

app.get('/api/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    console.log(`Fetching details for Course ID: ${courseId}`);

    try {
        const query = `
            SELECT * FROM courses
            WHERE id = ?
        `;
        db.query(query, [courseId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);
                res.status(500).json({ error: 'Failed to fetch course details' });
                return;
            }

            console.log('Course details:', results);
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
});

app.get('/api/courses/:id/materials', async (req, res) => {
    const courseId = req.params.id;
    console.log(`Fetching materials for Course ID: ${courseId}`);

    try {
        const query = `
            SELECT * FROM materials
            WHERE course_id = ?
        `;
        db.query(query, [courseId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);
                res.status(500).json({ error: 'Failed to fetch course materials' });
                return;
            }

            console.log('Course materials:', results);
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);
        res.status(500).json({ error: 'Failed to fetch course materials' });
    }
});

app.get('/api/courses/:id/assignments', async (req, res) => {
    const courseId = req.params.id;
    console.log(`Fetching assignments for Course ID: ${courseId}`);

    try {
        const query = `
            SELECT * FROM assignments
            WHERE course_id = ?
        `;
        db.query(query, [courseId], (err, results) => {
            if (err) {
                console.error('Error executing query: ', err);
                res.status(500).json({ error: 'Failed to fetch course assignments' });
                return;
            }

            console.log('Course assignments:', results);
            res.json(results);
        });
    } catch (err) {
        console.error('Caught error: ', err);
        res.status(500).json({ error: 'Failed to fetch course assignments' });
    }
});

app.get('/api/courses/:id/details', async (req, res) => {
    const courseId = req.params.id;
    console.log(`Fetching full details for Course ID: ${courseId}`);

    try {
        const courseQuery = `
            SELECT * FROM courses
            WHERE id = ?
        `;

        const materialsQuery = `
            SELECT * FROM materials
            WHERE course_id = ?
        `;

        const assignmentsQuery = `
            SELECT * FROM assignments
            WHERE course_id = ?
        `;

        db.query(courseQuery, [courseId], (err, courseResults) => {
            if (err) {
                console.error('Error fetching course:', err);
                res.status(500).json({ error: 'Failed to fetch course details' });
                return;
            }

            db.query(materialsQuery, [courseId], (err, materialsResults) => {
                if (err) {
                    console.error('Error fetching materials:', err);
                    res.status(500).json({ error: 'Failed to fetch course materials' });
                    return;
                }

                db.query(assignmentsQuery, [courseId], (err, assignmentsResults) => {
                    if (err) {
                        console.error('Error fetching assignments:', err);
                        res.status(500).json({ error: 'Failed to fetch course assignments' });
                        return;
                    }

                    res.json({
                        course: courseResults[0],
                        materials: materialsResults,
                        assignments: assignmentsResults,
                    });
                });
            });
        });
    } catch (err) {
        console.error('Caught error: ', err);
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
});





// Get all tutors
app.get('/tutors', async (req, res) => {
    try {
        let tutors = await getTutorsFromDatabase();
        res.json({ success: true, data: tutors });
    } catch (error) {
        console.error('Error fetching tutors:', error);
        res.json({ success: false, message: 'Failed to fetch tutors.' });
    }
});

// Add a new tutor
app.post('/add-tutor', (req, res) => {
    const { name, subject } = req.body;
    const query = 'INSERT INTO tutors (name, subject) VALUES (?, ?)';
    db.query(query, [name, subject], (err, result) => {
        if (err) {
            console.error('Error adding tutor:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(201).json({ success: true, message: 'Tutor added successfully' });
    });
});

// Update a tutor
app.put('/update-tutor/:id', (req, res) => {
    const tutorId = req.params.id;
    const { name, subject } = req.body;
    const query = 'UPDATE tutors SET name = ?, subject = ? WHERE id = ?';
    db.query(query, [name, subject, tutorId], (err, result) => {
        if (err) {
            console.error('Error updating tutor:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(200).json({ success: true, message: 'Tutor updated successfully' });
    });
});

// Delete a tutor
app.delete('/delete-tutor/:id', (req, res) => {
    const tutorId = req.params.id;
    const query = 'DELETE FROM tutors WHERE id = ?';
    db.query(query, [tutorId], (err, result) => {
        if (err) {
            console.error('Error deleting tutor:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(200).json({ success: true, message: 'Tutor deleted successfully' });
    });
});
// Route to get a single tutor by ID from MySQL
app.get('/tutors/:id', (req, res) => {
    const tutorId = parseInt(req.params.id);

    // Query to get tutor information
    db.query('SELECT * FROM tutors WHERE id = ?', [tutorId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching tutor data' });
        }

        const tutor = results[0];
        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Query to get tutor listings
        db.query('SELECT * FROM listings WHERE tutor_id = ?', [tutorId], (err, listings) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error fetching tutor listings' });
            }

            // Query to get tutor reviews
            db.query('SELECT * FROM reviews WHERE tutor_id = ?', [tutorId], (err, reviews) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Error fetching tutor reviews' });
                }

                // Combine tutor, listings, and reviews data
                tutor.listings = listings;
                tutor.reviews = reviews;

                // Return the tutor data
                res.json(tutor);
            });
        });
    });
});

// CRUD routes for Courses

// Create a new course
app.post('/add-course', (req, res) => {
    const { name, tutor_id } = req.body;
    const query = 'INSERT INTO courses (name, tutor_id) VALUES (?, ?)';
    db.query(query, [name, tutor_id], (err, result) => {
        if (err) {
            console.error('Error adding course:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(201).json({ success: true, message: 'Course added successfully' });
    });
});

// Get all courses
app.get('/courses', (req, res) => {
    const query = `
        SELECT 
            c.id AS course_id, c.name AS course_name, 
            t.name AS tutor_name, 
            GROUP_CONCAT(s.name SEPARATOR ', ') AS students
        FROM 
            courses c
        LEFT JOIN tutors t ON c.tutor_id = t.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN students s ON e.student_id = s.id
        GROUP BY c.id, c.name, t.name;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching courses:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(200).json({ success: true, data: results });
    });
});

// Update a course
app.put('/update-course/:id', (req, res) => {
    const courseId = req.params.id;
    const { name, tutor_id } = req.body;
    const query = 'UPDATE courses SET name = ?, tutor_id = ? WHERE id = ?';
    db.query(query, [name, tutor_id, courseId], (err, result) => {
        if (err) {
            console.error('Error updating course:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(200).json({ success: true, message: 'Course updated successfully' });
    });
});

// Delete a course
app.delete('/delete-course/:id', (req, res) => {
    const courseId = req.params.id;
    const query = 'DELETE FROM courses WHERE id = ?';
    db.query(query, [courseId], (err, result) => {
        if (err) {
            console.error('Error deleting course:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(200).json({ success: true, message: 'Course deleted successfully' });
    });
});

// CRUD routes for Students

// Get all students
app.get('/students', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) {
            console.error('Error fetching students:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.status(200).json({ success: true, data: results });
    });
});

// Add a new student
app.post('/add-student', (req, res) => {
    const { name } = req.body;
    const query = 'INSERT INTO students (name) VALUES (?)';
    db.query(query, [name], (err, result) => {
        if (err) {
            console.error('Error adding student:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(201).json({ success: true, message: 'Student added successfully' });
    });
});

// Update a student
app.put('/update-student/:id', (req, res) => {
    const studentId = req.params.id;
    const { name } = req.body;
    const query = 'UPDATE students SET name = ? WHERE id = ?';
    db.query(query, [name, studentId], (err, result) => {
        if (err) {
            console.error('Error updating student:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(200).json({ success: true, message: 'Student updated successfully' });
    });
});

// Delete a student
app.delete('/delete-student/:id', (req, res) => {
    const studentId = req.params.id;
    const query = 'DELETE FROM students WHERE id = ?';
    db.query(query, [studentId], (err, result) => {
        if (err) {
            console.error('Error deleting student:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    });
});

// CRUD routes for Enrollments

// Get all enrollments
app.get('/enrollments', (req, res) => {
    const query = 'SELECT * FROM enrollments';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching enrollments:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
            return;
        }
        res.status(200).json({ success: true, data: results });
    });
});

// Add a new enrollment
app.post('/add-enrollment', (req, res) => {
    const { student_id, course_id } = req.body;
    const query = 'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)';
    db.query(query, [student_id, course_id], (err, result) => {
        if (err) {
            console.error('Error adding enrollment:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(201).json({ success: true, message: 'Enrollment added successfully' });
    });
});

// Delete an enrollment
app.delete('/delete-enrollment/:id', (req, res) => {
    const enrollmentId = req.params.id;
    const query = 'DELETE FROM enrollments WHERE id = ?';
    db.query(query, [enrollmentId], (err, result) => {
        if (err) {
            console.error('Error deleting enrollment:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(200).json({ success: true, message: 'Enrollment deleted successfully' });
    });
});

// CRUD routes for Listings

// Add a new listing
app.post('/add-listing', (req, res) => {
    const { tutorId, keywords } = req.body;
    const query = 'INSERT INTO listings (tutorId, keywords) VALUES (?, ?)';
    db.query(query, [tutorId, keywords], (err, result) => {
        if (err) {
            console.error('Error adding listing:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(201).json({ success: true, message: 'Listing added successfully' });
    });
});

// CRUD routes for Reviews

// Add a new review
app.post('/api/add-review', (req, res) => {
    const { tutor_id, text, stars } = req.body;
    const query = 'INSERT INTO reviews (tutor_id, text, stars) VALUES (?, ?, ?)';
    db.query(query, [tutor_id, text, stars], (err, result) => {
        if (err) {
            console.error('Error adding review:', err.message);
            res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
            return;
        }
        res.status(201).json({ success: true, message: 'Review added successfully' });
    });
});

// Get all reviews by tutor ID
app.get('/tutors/:id/reviews', (req, res) => {
    const tutorId = parseInt(req.params.id);

    // Query to get reviews by tutor ID
    db.query('SELECT * FROM reviews WHERE tutor_id = ?', [tutorId], (err, reviews) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching tutor reviews' });
        }

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this tutor' });
        }

        res.json(reviews); // Return all reviews
    });
});

// Get all listings by tutor ID
app.get('/tutors/:id/listings', (req, res) => {
    const tutorId = parseInt(req.params.id);

    // Query to get listings by tutor ID
    db.query('SELECT * FROM listings WHERE tutor_id = ?', [tutorId], (err, listings) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching tutor listings' });
        }

        if (listings.length === 0) {
            return res.status(404).json({ message: 'No listings found for this tutor' });
        }

        res.json(listings); // Return all listings
    });
});

// PUT request to update a review by review ID
app.put('/reviews/:id', (req, res) => {
    const reviewId = parseInt(req.params.id);
    const { comment, rating } = req.body; // Assuming you're updating the comment and rating

    // Query to update the review
    db.query('UPDATE reviews SET comment = ?, rating = ? WHERE id = ?', [comment, rating, reviewId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error updating review' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json({ message: 'Review updated successfully' });
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
