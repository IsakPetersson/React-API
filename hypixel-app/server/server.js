import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json()); // gör så du kan ta emot JSON-data

// Test-route för att se att allt funkar
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Starta servern
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
