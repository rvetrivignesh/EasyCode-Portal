
import express from 'express';
import cors from 'cors';
import { initDB } from './db/database.js';
import studentRoutes from './routes/student.js';
import { exec } from 'child_process';
import fs from 'fs-extra';
import tmp from 'tmp';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', studentRoutes);

// Initialize database
let db;
initDB().then(database => {
  db = database;
  console.log('✅ Database connected');
}).catch(err => {
  console.error('❌ Database connection failed:', err);
});

// Admin Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'rvetrivignesh@gmail.com' && password === 'Sachin@18') {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Student Login endpoint
app.post('/api/student-login', async (req, res) => {
  try {
    const { college_id } = req.body;
    
    if (!college_id) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    // Check if student exists in database
    const student = await db.get(
      'SELECT * FROM students WHERE college_id = ?',
      [college_id]
    );

    if (student) {
      res.status(200).json({ 
        message: 'Student login successful',
        student: {
          id: student.id,
          college_id: student.college_id,
          name: student.name,
          class_id: student.class_id
        }
      });
    } else {
      res.status(401).json({ message: 'Student not found. Please contact your administrator.' });
    }
  } catch (error) {
    console.error('Error during student login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Add class endpoint
app.post('/api/classes', async (req, res) => {
  try {
    const { branch, batch, year, semester } = req.body;
    
    if (!branch || !batch || !year || !semester) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await db.run(
      'INSERT INTO classes (branch, batch, year, semester) VALUES (?, ?, ?, ?)',
      [branch, batch, parseInt(year), parseInt(semester)]
    );

    res.status(201).json({ 
      message: 'Class added successfully',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error adding class:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ message: 'A class with this branch, batch, year, and semester already exists' });
    } else {
      res.status(500).json({ message: 'Error adding class' });
    }
  }
});

// Get all classes endpoint
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await db.all('SELECT * FROM classes ORDER BY created_at DESC');
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Error fetching classes' });
  }
});

// Delete class endpoint
app.delete('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting class ${id} and all associated students...`);
    
    // Get count of students that will be deleted (for reporting)
    const studentCount = await db.get(
      'SELECT COUNT(*) as count FROM students WHERE class_id = ?', 
      [id]
    );
    
    // Delete the class (foreign key constraint will cascade delete students)
    await db.run('DELETE FROM classes WHERE id = ?', [id]);
    
    console.log(`✅ Deleted class ${id} and ${studentCount.count} associated students via foreign key cascade`);
    
    res.json({ 
      message: 'Class deleted successfully', 
      students_deleted: studentCount.count 
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Error deleting class' });
  }
});

// Get all problems for any student (class-independent)
app.get('/api/problems/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Verify student exists (but don't filter by class)
    const student = await db.get('SELECT id, name, college_id FROM students WHERE id = ?', [studentId]);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log(`📝 Fetching all problems for student: ${student.name} (${student.college_id})`);

    // Get ALL problems from database regardless of class
    const problems = await db.all(`
      SELECT q.*, s.name as subject_name 
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      ORDER BY q.id ASC
    `);
    
    console.log(`📊 Found ${problems.length} total problems for student`);
    res.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ message: 'Error fetching problems' });
  }
});

// Submit solution
app.post('/api/submit', async (req, res) => {
  try {
    const { student_id, question_id, code, output } = req.body;
    
    if (!student_id || !question_id || !code) {
      return res.status(400).json({ message: 'Student ID, Question ID, and Code are required' });
    }

    // Check if a submission already exists for this student and question
    const existingSubmission = await db.get(
      'SELECT id, submitted_at FROM submissions WHERE student_id = ? AND question_id = ?',
      [student_id, question_id]
    );

    let message = 'Solution submitted successfully';
    let isUpdate = false;

    if (existingSubmission) {
      // Delete the existing submission
      await db.run(
        'DELETE FROM submissions WHERE student_id = ? AND question_id = ?',
        [student_id, question_id]
      );
      message = 'Previous submission replaced successfully';
      isUpdate = true;
      console.log(`🔄 Replaced existing submission ${existingSubmission.id} for student ${student_id}, question ${question_id}`);
    }

    // Insert the new submission
    const result = await db.run(
      'INSERT INTO submissions (student_id, question_id, code, output, status) VALUES (?, ?, ?, ?, ?)',
      [student_id, question_id, code, output || '', 'pending']
    );

    console.log(`✅ ${isUpdate ? 'Updated' : 'Created'} submission ${result.lastID} for student ${student_id}, question ${question_id}`);

    res.status(201).json({ 
      message: message,
      submission_id: result.lastID,
      is_update: isUpdate
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ message: 'Error submitting solution' });
  }
});

// Get student's submissions
app.get('/api/submissions/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const submissions = await db.all(`
      SELECT 
        sub.*,
        q.question_text,
        s.name as subject_name
      FROM submissions sub
      JOIN questions q ON sub.question_id = q.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE sub.student_id = ?
      ORDER BY sub.submitted_at DESC
    `, [studentId]);
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

// Reload problems from CSV endpoint (Admin only)
app.post('/api/reload-problems', async (req, res) => {
  try {
    // Import the CSV service dynamically
    const { loadProblemsFromCSV, getSubjectsFromProblems } = await import('./services/csvService.js');
    
    console.log('📄 Admin requested to reload problems from CSV...');
    
    // Load problems from CSV file
    const csvProblems = await loadProblemsFromCSV();
    console.log(`📊 Loaded ${csvProblems.length} problems from CSV`);

    // Get unique subjects from CSV
    const subjects = getSubjectsFromProblems(csvProblems);
    console.log(`📚 Found ${subjects.length} unique subjects`);

    // Get existing classes
    const classes = await db.all('SELECT * FROM classes');
    
    if (classes.length === 0) {
      return res.status(400).json({ message: 'No classes found. Please create classes first.' });
    }

    // Create subjects for each class
    const subjectMap = new Map();
    let totalNewSubjects = 0;
    let totalNewProblems = 0;
    
    for (const cls of classes) {
      for (const subject of subjects) {
        // Check if subject already exists for this class
        const existingSubject = await db.get(
          'SELECT id FROM subjects WHERE class_id = ? AND name = ?',
          [cls.id, subject.name]
        );

        let subjectId;
        if (existingSubject) {
          subjectId = existingSubject.id;
        } else {
          const subjectResult = await db.run(
            'INSERT INTO subjects (class_id, name) VALUES (?, ?)',
            [cls.id, subject.name]
          );
          subjectId = subjectResult.lastID;
          totalNewSubjects++;
        }

        const key = `${cls.id}-${subject.name}`;
        subjectMap.set(key, subjectId);
      }

      // Add problems for this class
      for (const problem of csvProblems) {
        const key = `${cls.id}-${problem.subject_name}`;
        const subjectId = subjectMap.get(key);
        
        if (subjectId) {
          // Check if problem already exists
          const existingProblem = await db.get(
            'SELECT id FROM questions WHERE subject_id = ? AND question_text = ?',
            [subjectId, problem.question_text]
          );

          if (!existingProblem) {
            await db.run(
              'INSERT INTO questions (subject_id, question_text, sample_input, sample_output) VALUES (?, ?, ?, ?)',
              [subjectId, problem.question_text, problem.sample_input, problem.sample_output]
            );
            totalNewProblems++;
          }
        }
      }
    }

    console.log(`✅ CSV Reload completed: ${totalNewSubjects} new subjects, ${totalNewProblems} new problems`);
    
    res.json({ 
      message: 'Problems reloaded successfully from CSV',
      stats: {
        totalProblemsInCSV: csvProblems.length,
        newSubjectsAdded: totalNewSubjects,
        newProblemsAdded: totalNewProblems,
        classes: classes.length
      }
    });
  } catch (error) {
    console.error('Error reloading problems from CSV:', error);
    res.status(500).json({ message: 'Error reloading problems from CSV', error: error.message });
  }
});

// Code execution endpoint
app.post('/api/run-code', async (req, res) => {
  const { code, language, input } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  const sessionId = uuidv4();
  
  try {
    let output = '';
    let command = '';
    let filePath = '';
    let extension = '';
    
    // Create temporary file based on language
    switch (language) {
      case 'python':
        extension = 'py';
        filePath = `/tmp/code_${sessionId}.${extension}`;
        await fs.writeFile(filePath, code);
        command = `echo '${input}' | python3 ${filePath}`;
        break;
        
      case 'javascript':
        extension = 'js';
        filePath = `/tmp/code_${sessionId}.${extension}`;
        await fs.writeFile(filePath, code);
        command = `echo '${input}' | node ${filePath}`;
        break;
        
      case 'java':
        extension = 'java';
        filePath = `/tmp/Solution_${sessionId}.${extension}`;
        // Replace class name with unique name
        const javaCode = code.replace(/public class Solution/g, `public class Solution_${sessionId.replace(/-/g, '_')}`);
        await fs.writeFile(filePath, javaCode);
        command = `cd /tmp && javac Solution_${sessionId}.java && echo '${input}' | java Solution_${sessionId}`;
        break;
        
      case 'cpp':
        extension = 'cpp';
        filePath = `/tmp/code_${sessionId}.${extension}`;
        const executablePath = `/tmp/code_${sessionId}`;
        await fs.writeFile(filePath, code);
        command = `g++ -o ${executablePath} ${filePath} && echo '${input}' | ${executablePath}`;
        break;
        
      case 'c':
        extension = 'c';
        filePath = `/tmp/code_${sessionId}.${extension}`;
        const cExecutablePath = `/tmp/code_${sessionId}`;
        await fs.writeFile(filePath, code);
        command = `gcc -o ${cExecutablePath} ${filePath} && echo '${input}' | ${cExecutablePath}`;
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported language' });
    }
    
    // Execute the code with timeout
    const execPromise = new Promise((resolve, reject) => {
      exec(command, { 
        timeout: 10000, // 10 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      }, (error, stdout, stderr) => {
        if (error) {
          if (error.code === 'ENOENT') {
            reject(new Error(`${language} compiler/interpreter not found`));
          } else if (error.signal === 'SIGTERM') {
            reject(new Error('Code execution timed out (10s limit)'));
          } else {
            reject(new Error(stderr || error.message || 'Execution error'));
          }
        } else {
          resolve(stdout || stderr || 'Code executed successfully (no output)');
        }
      });
    });
    
    output = await execPromise;
    
    // Clean up temporary files
    try {
      await fs.remove(filePath);
      if (language === 'java') {
        await fs.remove(`/tmp/Solution_${sessionId}.class`);
      } else if (language === 'cpp' || language === 'c') {
        await fs.remove(`/tmp/code_${sessionId}`);
      }
    } catch (cleanupError) {
      console.warn('Cleanup warning:', cleanupError.message);
    }
    
    res.json({ output: output.trim() });
    
  } catch (error) {
    console.error('Code execution error:', error);
    
    // Clean up temporary files on error
    try {
      if (filePath) await fs.remove(filePath);
      if (language === 'java') await fs.remove(`/tmp/Solution_${sessionId}.class`);
      if (language === 'cpp' || language === 'c') await fs.remove(`/tmp/code_${sessionId}`);
    } catch (cleanupError) {
      console.warn('Cleanup warning:', cleanupError.message);
    }
    
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
