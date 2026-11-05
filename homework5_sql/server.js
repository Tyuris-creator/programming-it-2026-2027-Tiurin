import express from "express";
import cors from "cors";

import writeToJson from "./json_handlers/writeFromJson.js";
import readFromJson from "./json_handlers/readFromJson.js";

import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import path from "node:path";

import { randomUUID } from "crypto";

import taskRepository from "./repositories/taskRepository.js";

const taskRepo = new taskRepository();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PATH_TO_JSON = path.join(__dirname, "data/data.json");

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.get("/api/v1/tasks", async (req, res) => {
  try {
    const tasks = await taskRepo.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Ошибка чтения файла:", error);
    return res.status(500).json({ error: "Ошибка чтения файла" });
  }
});

app.post("/api/v1/tasks", async (req, res) => {
  const task = req.body;
  if (!task || !task.title || !task.studentId) {
    return res.status(400).json({ error: "Неверные данные" });
  }

  try {
    const savedTask = await taskRepo.add({
      ...task,
      id: randomUUID(),
    });
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Ошибка добавления задачи в PostgreSQL:", error);
    return res.status(500).json({ error: "Ошибка добавления задачи" });
  }
});

app.delete("/api/v1/tasks/:id", async (req, res) => {
  const { id } = req.params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return res.status(400).json({ error: "Некорректный id задачи" });
  }

  try {
    const deleted = await taskRepo.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: "Задача не найдена" });
    }

    return res.status(204).end();
  } catch (error) {
    console.error("Ошибка удаления задачи из PostgreSQL:", error);
    return res.status(500).json({ error: "Ошибка удаления задачи" });
  }
});

app.put("/api/v1/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const task = req.body;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return res.status(400).json({ error: "Некорректный id задачи" });
  }

  if (
    !task ||
    typeof task.title !== "string" ||
    !task.title.trim() ||
    typeof task.studentId !== "string" ||
    !task.studentId.trim()
  ) {
    return res.status(400).json({ error: "Неверные данные" });
  }

  try {
    const updatedTask = await taskRepo.update(id, task);

    if (!updatedTask) {
      return res.status(404).json({ error: "Задача не найдена" });
    }

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Ошибка обновления задачи в PostgreSQL:", error);
    return res.status(500).json({ error: "Ошибка обновления задачи" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
