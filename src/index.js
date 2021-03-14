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
    return res.status(400).json({ msg: "Invalid CPF." });
  }

  let accountAlreadyExists = customers.some((c) => c.cpf === cpf);

  if (accountAlreadyExists) {
    return res.status(400).json({ msg: "CPF already registered." });
  }

  const account = { id: uuid(), name, cpf, statement: [] };

  customers.push(account);

  return res.status(201).json(account);
});
