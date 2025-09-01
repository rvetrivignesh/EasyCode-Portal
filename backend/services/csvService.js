import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadProblemsFromCSV = () => {
  return new Promise((resolve, reject) => {
    const problems = [];
    const csvPath = path.join(__dirname, '../data/problems.csv');
    
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Problems CSV file not found at:', csvPath);
      reject(new Error('Problems CSV file not found'));
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Process each row from CSV
        problems.push({
          id: parseInt(row.id),
          subject_name: row.subject_name,
          question_text: row.question_text,
          sample_input: row.sample_input,
          sample_output: row.sample_output,
          difficulty: row.difficulty,
          tags: row.tags
        });
      })
      .on('end', () => {
        console.log(`✅ Loaded ${problems.length} problems from CSV`);
        resolve(problems);
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV file:', error);
        reject(error);
      });
  });
};

export const getSubjectsFromProblems = (problems) => {
  // Extract unique subjects from problems
  const subjects = [...new Set(problems.map(problem => problem.subject_name))];
  return subjects.map((subject, index) => ({
    id: index + 1,
    name: subject,
    class_id: 1 // Default class for now, can be modified as needed
  }));
};
