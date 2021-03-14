const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();

app.use(express.json());

const port = 3333;
app.listen(port, () => console.log(`Server running at port ${port}`));

const customers = [];

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  if (customers.find((p) => p.cpf === cpf)) {
    return res.json({ msg: "CPF already registered" });
  }

  const id = uuid();

  const account = { id, name, cpf, statement: [] };

  customers.push(account);

  return res.status(201).json(account);
});
