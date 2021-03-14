const express = require("express");

const app = express();

const port = 3333;
app.listen(port, () => console.log(`Server running at port ${port}`));

app.get("/", (req, res) => {
  return res.json({ msg: "Hi" });
});
