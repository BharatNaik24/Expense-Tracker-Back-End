const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3002;

// Setup SQLite Database
const db = new sqlite3.Database("./database.db");

// Create transactions table if it doesn't exist
const createTableIfNotExists = () => {
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    running_balance REAL
  )`);
};

// Middleware
app.use(cors());
app.use(express.json());

// Route to get transactions with running balance
app.get("/api/expenses", (req, res) => {
  db.all("SELECT * FROM transactions ORDER BY date ASC", (err, rows) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({ error: "Failed to fetch transactions" });
    } else {
      // Calculate running balance
      let runningBalance = 0;
      const transactionsWithBalance = rows.map((transaction) => {
        runningBalance +=
          transaction.type === "credit"
            ? transaction.amount
            : -transaction.amount;
        return { ...transaction, running_balance: runningBalance };
      });
      res.json(transactionsWithBalance);
    }
  });
});

app.post("/api/expenses", (req, res) => {
  const { type, amount, description, date } = req.body;

  db.get(
    "SELECT running_balance FROM transactions ORDER BY date DESC LIMIT 1",
    (err, row) => {
      if (err) {
        console.error("Error fetching last running balance:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to calculate running balance" });
      }

      let runningBalance = row ? row.running_balance : 0;
      runningBalance += type === "credit" ? amount : -amount;

      const stmt = db.prepare(
        "INSERT INTO transactions (type, amount, description, date, running_balance) VALUES (?, ?, ?, ?, ?)"
      );
      stmt.run(type, amount, description, date, runningBalance, function (err) {
        if (err) {
          console.error("Error adding transaction:", err.message);
          res.status(500).json({ error: "Failed to add transaction" });
        } else {
          res.status(201).json({
            id: this.lastID,
            type,
            amount,
            description,
            date,
            running_balance: runningBalance,
          });
        }
      });
    }
  );
});

// Route to delete a transaction
app.delete("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare("DELETE FROM transactions WHERE id = ?");
  stmt.run(id, function (err) {
    if (err) {
      console.error("Error deleting transaction:", err.message);
      res.status(500).json({ error: "Failed to delete transaction" });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Transaction not found" });
    } else {
      res.status(200).json({ message: "Transaction deleted successfully" });
    }
  });
});

// Start server
createTableIfNotExists();
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
