import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";

const dbPath = path.resolve("db", "app.db");

// ensure db folder exists
if (!fs.existsSync("db")) {
  fs.mkdirSync("db");
}

export const initDB = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  
  // Enable foreign key constraints (SQLite disables them by default)
  await db.exec('PRAGMA foreign_keys = ON;');
  
  return db;
};
