import express from 'express';
import cors from 'cors';
import { initDB } from './db/database.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database
let db;
initDB().then(database => {
  db = database;
  console.log('✅ Database connected');
}).catch(err => {
  console.error('❌ Database connection failed:', err);
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'rvetrivignesh@gmail.com' && password === 'Sachin@18') {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
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
    res.status(500).json({ message: 'Error adding class' });
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

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
