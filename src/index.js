const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();

app.use(express.json());

const port = 3333;
app.listen(port, () => console.log(`Server running at port ${port}`));

const customers = [];

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  if (!cpf) {
    return res.status(400).json({ error: "Invalid CPF." });
  }

  let accountAlreadyExists = customers.some((c) => c.cpf === cpf);

  if (accountAlreadyExists) {
    return res.status(400).json({ error: "CPF already registered." });
  }

  const account = { id: uuid(), name, cpf, statement: [] };

  customers.push(account);

  return res.status(201).json(account);
});

app.get("/statement", (req, res) => {
  const { cpf } = req.headers;

  const account = customers.find((c) => c.cpf === cpf);

  if (!account) {
    return res.status(400).json({ error: "Account not found." });
  }

  return res.json(account.statement);
});
