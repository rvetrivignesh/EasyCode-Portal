import { initDB } from './db/database.js';
import { loadProblemsFromCSV, getSubjectsFromProblems } from './services/csvService.js';

const seedData = async () => {
  try {
    const db = await initDB();
    console.log('🌱 Starting database seeding from CSV...');

    // Load problems from CSV file
    const csvProblems = await loadProblemsFromCSV();
    console.log(`📄 Loaded ${csvProblems.length} problems from CSV`);

    // Get unique subjects from CSV
    const subjects = getSubjectsFromProblems(csvProblems);
    console.log(`📚 Found ${subjects.length} unique subjects:`, subjects.map(s => s.name).join(', '));

    // Get existing classes
    const classes = await db.all('SELECT * FROM classes');
    console.log(`🏯 Found ${classes.length} classes`);

    if (classes.length === 0) {
      console.log('⚠️ No classes found. Creating a default class...');
      await db.run(
        'INSERT INTO classes (branch, batch, year, semester) VALUES (?, ?, ?, ?)',
        ['Computer Science', 'A', 2024, 1]
      );
      const newClasses = await db.all('SELECT * FROM classes');
      classes.push(...newClasses);
    }

    // Create subjects for each class
    const subjectMap = new Map(); // Map to store subject_name -> subject_id for each class
    
    for (const cls of classes) {
      console.log(`🏠 Processing class: ${cls.branch} - ${cls.batch}`);
      
      for (const subject of subjects) {
        // Check if subject already exists for this class
        const existingSubject = await db.get(
          'SELECT id FROM subjects WHERE class_id = ? AND name = ?',
          [cls.id, subject.name]
        );

        let subjectId;
        if (existingSubject) {
          subjectId = existingSubject.id;
          console.log(`🔄 Subject '${subject.name}' already exists for class ${cls.id}`);
        } else {
          const subjectResult = await db.run(
            'INSERT INTO subjects (class_id, name) VALUES (?, ?)',
            [cls.id, subject.name]
          );
          subjectId = subjectResult.lastID;
          console.log(`✅ Added subject '${subject.name}' for class ${cls.id}`);
        }

        // Store mapping for later use
        const key = `${cls.id}-${subject.name}`;
        subjectMap.set(key, subjectId);
      }

      // Add problems for this class
      let addedProblems = 0;
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
            addedProblems++;
          }
        }
      }
      console.log(`✅ Added ${addedProblems} new problems for class ${cls.id}`);
    }

    console.log('🎉 Database seeding from CSV completed successfully!');
    await db.close();
  } catch (error) {
    console.error('❌ Error seeding database from CSV:', error);
  }
};

seedData();
