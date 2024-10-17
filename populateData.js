const { addBulkTransactions } = require("./database");

const transactions = [
  {
    type: "credit",
    amount: 5000,
    description: "Credited to Office Account",
    date: "2020-02-17",
    running_balance: 5000,
  },
  {
    type: "debit",
    amount: 500,
    description: "Snacks Party",
    date: "2020-02-18",
    running_balance: 4500,
  },
  {
    type: "debit",
    amount: 285,
    description: "Printing sheets for office documents",
    date: "2020-02-18",
    running_balance: 4215,
  },
  {
    type: "debit",
    amount: 3000,
    description: "Misc Expenses",
    date: "2020-02-20",
    running_balance: 1215,
  },
];

addBulkTransactions(transactions, (err) => {
  if (err) {
    console.error("Error adding bulk transactions:", err.message);
  } else {
    console.log("Bulk transactions added successfully.");
  }
});
