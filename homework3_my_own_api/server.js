import express from "express";
import cors from "cors";

const DB = [];
const PORT = 3000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.get("/api/v1/tasks", (req, res) => {
  console.log("GET /api/v1/tasks");
  console.log("DB:", DB);
  res.json(DB);
});

app.post("/api/v1/tasks", (req, res) => {
  console.log("POST /api/v1/tasks");
  const task = req.body;
  if (!task || !task.title || !task.studentId) {
    return res.status(400).json({ error: "Неверные данные" });
  }
  task.id = DB.length + 1;
  DB.push(task);
  console.log("DB:", DB);
  res.status(201).json(task);
});

app.delete("/api/v1/tasks/:id", (req, res) => {
  console.log("DELETE /api/v1/tasks/:id");
  console.log("DB:", DB);
  const id = Number(req.params.id);
  const index = DB.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Задача не найдена" });
  }
  DB.splice(index, 1);
  res.status(204).send();
});

app.put("/api/v1/tasks/:id", (req, res) => {
  console.log("PUT /api/v1/tasks/:id");
  const id = Number(req.params.id);
  console.log(id);
  const index = DB.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Задача не найдена" });
  }
  const task = req.body;
  console.log(task);
  if (!task || !task.title || !task.studentId) {
    return res.status(400).json({ error: "Неверные данные" });
  }
  task.id = id;
  DB[index] = task;
  res.json(task);
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
