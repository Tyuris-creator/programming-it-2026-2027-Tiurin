import express from "express";
import cors from "cors";

const app = express();
const PORT = 5001;

app.use(express.static("public"));

// CORS ращрешил запросы с любого ориджина

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);

// middleware
app.use(express.json());

// БД которая в оперативке эмуляция

const tasks = [
  {
    id: "1",
    title: "Повторить fetch",
    completed: false,
    studentId: "ivanov-ivan",
  },
];

let nextId = 2;

// GET /api/tasks - все задачи

app.get("/api/tasks", (req, res) => {
  const { studentId } = req.query;
  if (studentId) {
    return res.json(tasks.filter((student) => student.studentId === studentId));
  } else {
    return res.json(tasks);
  }
});

//POST /api/tasks - создать задачу

app.post("/api/tasks", (req, res) => {
  const { title, completed = false, studentId } = req.body;
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title обязателен" });
  }
  if (!studentId) {
    return res.status(400).json({ error: "studentId обязателен" });
  }

  const task = {
    id: String(nextId++),
    title: String(title).trim(),
    completed: Boolean(completed),
    studentId,
  };
  tasks.push(task);
  res.status(201).json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex((student) => student.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }
  tasks.splice(index, 1);
  res.status(204).json({ deleted: true });
});

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}`);
});