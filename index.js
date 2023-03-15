const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const UserRouter = require("./routes/userRoutes");

app.use(express.json());

app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(req.path, req.method);
  next();
});

app.use("/", UserRouter);

app.listen(port, () => {
  console.log(`Server Running on ${port}`);
});

module.exports = app;
