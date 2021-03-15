const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();

app.use(express.json());

const port = 3333;
app.listen(port, () => console.log(`Server running at port ${port}`));

const customers = [];

// Middleware
const verifyIfAccountExists = (req, res, next) => {
  const { cpf } = req.headers;

  const account = customers.find((c) => c.cpf === cpf);

  if (!cpf || !account) {
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
    return res.status(400).json({ error: "No CPF provided." });
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
  console.log("🚀 ~ file: index.js ~ line 53 ~ app.get ~ customer", customer);

  return res.json(customer.statement);
});
