const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();

app.use(express.json());

const port = 3333;
app.listen(port, () => console.log(`Server running at port ${port}`));

let customers = [];

// Middleware
const verifyIfAccountExists = (req, res, next) => {
  const { cpf } = req.headers;

  if (!cpf) {
    return res.status(400).json({ error: "Invalid cpf." });
  }

  const account = customers.find((c) => c.cpf === cpf);

  if (!account) {
    return res
      .status(400)
      .json({ error: "Middleware: Account does not exist." });
  }

  // Add customer object to the request
  req.customer = account;

  return next();
};

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  if (!cpf) {
    return res.status(400).json({ error: "Invalid CPF" });
  }

  const accountAlreadyExists = customers.some((c) => c.cpf === cpf);

  if (accountAlreadyExists) {
    return res.status(400).json({ error: "CPF already registered." });
  }

  const account = { id: uuid(), name, cpf, statement: [] };

  customers.push(account);

  return res.status(201).json(account);
});

app.get("/statement", verifyIfAccountExists, (req, res) => {
  const { customer } = req;

  return res.json(customer.statement);
});

app.get("/statement/date", verifyIfAccountExists, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const statementsFound = customer.statement.filter((s) => {
    return s.created_at.toDateString() === new Date(date).toDateString();
  });

  return res.send(statementsFound);
});

app.post("/deposit", verifyIfAccountExists, (req, res) => {
  const { amount, description } = req.body;

  const { customer } = req;

  const depositInformation = {
    amount,
    description,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(depositInformation);

  return res.status(201).json(customer);
});

const getBalance = (statement) => {
  const balance = statement.reduce((acc, transaction) => {
    const { type, amount } = transaction;

    return type === "credit" ? (acc += amount) : (acc -= amount);
  }, 0);

  return balance;
};

app.get("/balance", verifyIfAccountExists, (req, res) => {
  const { customer } = req;

  const balance = getBalance(customer.statement);

  return res.status(200).json(`Your balance is ${balance}`);
});

app.post("/withdraw", verifyIfAccountExists, (req, res) => {
  const { amount } = req.body;

  const { customer } = req;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({ error: "Insufficient funds." });
  }

  const withdrawInformation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(withdrawInformation);

  return res
    .status(201)
    .json(`Withdraw: ${amount}. Balance: ${balance - amount}`);
});

app.put("/account", verifyIfAccountExists, (req, res) => {
  const { customer } = req;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Empty parameter." });
  }

  customer.name = name;

  res.json(customer);
});

app.get("/account", verifyIfAccountExists, (req, res) => {
  const { customer } = req;

  return res.json(customer);
});

app.delete("/account", verifyIfAccountExists, (req, res) => {
  const { customer } = req;

  const updatedCustomersArray = customers.filter((c) => c.cpf !== customer.cpf);

  customers = updatedCustomersArray;

  return res.status(200).json(customers);
});

app.get("/accounts", (req, res) => {
  return res.status(200).json(customers);
});
