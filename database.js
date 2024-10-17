const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// Create table if it doesn't exist
const createTableIfNotExists = () => {
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    running_balance REAL NOT NULL
  )`);
};

// Fetch transactions from the database
const getTransactionsFromDatabase = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM transactions", (err, rows) => {
      if (err) {
        console.error("Database query error:", err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Add bulk transactions to the database
const addBulkTransactions = (transactions, callback) => {
  const stmt = db.prepare(
    "INSERT INTO transactions (type, amount, description, date, running_balance) VALUES (?, ?, ?, ?, ?)"
  );
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    transactions.forEach((transaction) => {
      stmt.run(
        transaction.type,
        transaction.amount,
        transaction.description,
        transaction.date,
        transaction.running_balance
      );
    });
    stmt.finalize();
    db.run("COMMIT", callback);
  });
};

// Initialize database
createTableIfNotExists();

module.exports = {
  getTransactionsFromDatabase,
  addBulkTransactions,
};
