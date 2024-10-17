const sqlite3 = require("sqlite3").verbose();

// Array of database paths
const dbPaths = "./databas.db";

// Function to delete data from each database
function deleteDataFromDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        return reject(`Error opening database ${dbPath}: ${err.message}`);
      }
      console.log(`Connected to ${dbPath}`);

      db.run("DELETE FROM transactions", (err) => {
        if (err) {
          return reject(`Error deleting data from ${dbPath}: ${err.message}`);
        }
        console.log(`All data deleted from ${dbPath}`);

        db.close((err) => {
          if (err) {
            return reject(`Error closing database ${dbPath}: ${err.message}`);
          }
          console.log(`Database connection closed for ${dbPath}`);
          resolve();
        });
      });
    });
  });
}

// Sequentially delete data from each database
async function main() {
  for (const dbPath of dbPaths) {
    try {
      await deleteDataFromDatabase(dbPath);
    } catch (error) {
      console.error(error);
    }
  }
}

main();
