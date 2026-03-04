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

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    token: user.id,
      user: {
    id: user.id,
    email: user.email,
    balance: user.balance
      },
  });
});
app.get("/api/auth/me", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  const user = users.find(u => u.id === token);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json({
    id: user.id,
    email: user.email,
    balance: user.balance
  });
});
app.get("/api/account/summary", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  const user = users.find(u => u.id === token);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json({
    balance: user.balance,
    available_margin: user.balance,
    day_pnl: 0,
    total_pnl: 0
  });
});
app.get("/api/positions", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  const user = users.find(u => u.id === token);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json(user.trades || []);
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
