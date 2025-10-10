import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { setupDatabase } from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to the database and start the server
let db;
setupDatabase().then(database => {
  db = database;
  app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
  });
}).catch(console.error);


// --- USER REGISTRATION ROUTE ---
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Insert the new user into the database
    const result = await db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully!", userId: result.lastID });
  } catch (error) {
    // Check for unique constraint violation (username already exists)
    if (error.code === "SQLITE_CONSTRAINT") {
      return res.status(409).json({ message: "Username already exists." });
    }
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
});


// Test-route for att se att allt funkar
app.get("/", (req, res) => {
  res.send("Backend is running!");
});
