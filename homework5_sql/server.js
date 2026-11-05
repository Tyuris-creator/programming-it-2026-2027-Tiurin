import express from "express";
import cors from "cors";

import tasksRouter from "./routes/tasksRouter.js";

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.use("/api/v1/tasks", tasksRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
