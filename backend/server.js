const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("VelocitiX Backend Running");
});
let users = [
  {
    id: uuidv4(),
    email: "demo@velocitix.com",
    password: "demo123",
    balance: 100000,
    trades: []
  }
];

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    userId: user.id,
    balance: user.balance
  });
});

app.get("/balance/:userId", (req, res) => {
  const user = users.find(u => u.id === req.params.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ balance: user.balance });
});

app.post("/trade", (req, res) => {
  const { userId, symbol, amount } = req.body;

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.balance < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  const trade = {
    id: uuidv4(),
    symbol,
    amount,
    result: Math.random() > 0.5 ? "win" : "loss"
  };

  if (trade.result === "win") {
    user.balance += amount;
  } else {
    user.balance -= amount;
  }

  user.trades.push(trade);

  res.json({
    message: "Trade executed",
    trade,
    newBalance: user.balance
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
