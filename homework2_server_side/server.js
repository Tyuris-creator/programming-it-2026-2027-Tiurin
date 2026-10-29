import express from "express";

const DB = [];
const PORT = 3000;

const app = express();




app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
