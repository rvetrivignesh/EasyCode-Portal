
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
    await db.run('DELETE FROM classes WHERE id = ?', [id]);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Error deleting class' });
  }
});

// Get problems for a student's class
app.get('/api/problems/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get student's class_id
    const student = await db.get('SELECT class_id FROM students WHERE id = ?', [studentId]);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all problems for the student's class
    const problems = await db.all(`
      SELECT q.*, s.name as subject_name 
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
      WHERE s.class_id = ?
      ORDER BY q.id ASC
    `, [student.class_id]);
    
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

    const result = await db.run(
      'INSERT INTO submissions (student_id, question_id, code, output, status) VALUES (?, ?, ?, ?, ?)',
      [student_id, question_id, code, output || '', 'pending']
    );

    res.status(201).json({ 
      message: 'Solution submitted successfully',
      submission_id: result.lastID
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
