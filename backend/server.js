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
    }
  });
});

app.get("/api/auth/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
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

app.get("/api/market/symbols", (req, res) => {
  res.json([
    {
      symbol: "NIFTY 50",
      name: "Nifty 50 Index",
      price: 22500,
      change: 120,
      change_percent: 0.54
    },
    {
      symbol: "BANKNIFTY",
      name: "Bank Nifty",
      price: 48000,
      change: -150,
      change_percent: -0.31
    },
    {
      symbol: "RELIANCE",
      name: "Reliance Industries",
      price: 2950,
      change: 12,
      change_percent: 0.41
    },
    {
      symbol: "INFY",
      name: "Infosys",
      price: 1650,
      change: -8,
      change_percent: -0.48
    }
  ]);
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

app.post("/api/orders", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const user = users.find(u => u.id === token);

  if (!user) {
    return res.status(401).json({ detail: "Unauthorized" });
  }

  const { symbol, side, quantity, order_type, price } = req.body;

  if (!symbol || !quantity) {
    return res.status(400).json({ detail: "Invalid order data" });
  }

  const executionPrice = price || 100;
  const total = executionPrice * quantity;

  if (side === "buy" && user.balance < total) {
    return res.status(400).json({ detail: "Insufficient balance" });
  }

  const order = {
    id: uuidv4(),
    symbol,
    side,
    quantity,
    order_type,
    price: executionPrice,
    status: "executed",
    timestamp: new Date()
  };

  if (side === "buy") {
    user.balance -= total;
  } else {
    user.balance += total;
  }

  user.trades.push(order);

  res.json({
    message: "Order executed",
    order,
    balance: user.balance
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
