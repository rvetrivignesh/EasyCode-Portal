import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { initDB } from '../db/database.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

let db;
initDB().then(database => {
  db = database;
}).catch(err => {
  console.error('❌ Database connection failed in student routes:', err);
});

// Get students for a specific class
router.get('/students', async (req, res) => {
  try {
    const { class_id } = req.query;
    
    if (!class_id) {
      return res.status(400).json({ message: 'class_id is required' });
    }

    const students = await db.all(
      'SELECT * FROM students WHERE class_id = ? ORDER BY name ASC',
      [class_id]
    );
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Upload students from Excel file
router.post('/upload-students', upload.single('file'), async (req, res) => {
  try {
    const { class_id } = req.body;
    console.log('📊 Upload request received:', { class_id, file: req.file?.originalname });
    
    if (!class_id) {
      console.log('❌ No class_id provided');
      return res.status(400).json({ detail: 'class_id is required' });
    }

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ detail: 'No file uploaded' });
    }

    // Read Excel file as raw data (no headers)
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`📋 Found ${rawData.length} rows in Excel file`);
    
    let studentsCount = 0;
    let skippedCount = 0;
    
    // Process each row as [college_id, name]
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      
      // Skip empty rows
      if (!row || row.length < 2 || !row[0] || !row[1]) {
        console.log(`⚠️ Skipping empty row ${i + 1}:`, row);
        continue;
      }
      
      const college_id = row[0].toString().trim();
      const name = row[1].toString().trim();
      
      console.log(`📝 Row ${i + 1}: ${college_id} - ${name}`);
      
      // Validate college ID format (basic validation)
      if (!college_id || college_id.length < 5) {
        console.log(`⚠️ Invalid college_id format: ${college_id}`);
        skippedCount++;
        continue;
      }
      
      // Validate name
      if (!name || name.length < 2) {
        console.log(`⚠️ Invalid name: ${name}`);
        skippedCount++;
        continue;
      }
      
      try {
        await db.run(
          'INSERT INTO students (class_id, college_id, name) VALUES (?, ?, ?)',
          [class_id, college_id, name]
        );
        studentsCount++;
        console.log(`✅ Added student: ${college_id} - ${name}`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`⚠️ Skipping duplicate college_id: ${college_id}`);
          skippedCount++;
        } else {
          throw error;
        }
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    console.log(`📊 Upload complete: ${studentsCount} added, ${skippedCount} skipped`);

    res.status(200).json({ 
      message: 'Students uploaded successfully',
      students_count: studentsCount,
      skipped_count: skippedCount
    });
  } catch (error) {
    console.error('Error uploading students:', error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ detail: 'Upload failed' });
  }
});

export default router;
