import fs from "fs";
import path from "path";
import { initDB } from "./database.js";

const runMigrations = async () => {
  const db = await initDB();

  const schemaPath = path.resolve("db", "migrations.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  await db.exec(schema);

  console.log("✅ Database initialized & migrations applied.");
  await db.close();
};

runMigrations().catch((err) => {
  console.error("❌ Error initializing database:", err);
});
