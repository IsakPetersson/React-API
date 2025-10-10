import sqlite3 from "sqlite3";
import { open } from "sqlite";

// This function will open the database connection and create the tables if they don't exist.
export async function setupDatabase() {
  const db = await open({
    filename: "./database.sqlite", // This file will be created in your 'server' folder
    driver: sqlite3.Database,
  });

  // Use migrate to create tables. It's safer as it only runs if tables don't exist.
  await db.migrate({
    migrationsPath: "./server/migrations", // We'll create this folder next
  });

  console.log("Database setup complete.");
  return db;
}