import express from "express";
import { randomUUID } from "node:crypto";

import TaskRepository from "../repositories/taskRepository.js";

const router = express.Router();
const taskRepo = new TaskRepository();

router.get("/", async (req, res) => {
  try {
    const tasks = await taskRepo.findAll();
    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Ошибка чтения задач из PostgreSQL:", error);
    return res.status(500).json({ error: "Ошибка чтения задач" });
  }
});

router.post("/", async (req, res) => {
  const task = req.body;

  if (!task || !task.title || !task.studentId) {
    return res.status(400).json({ error: "Неверные данные" });
  }

  try {
    const savedTask = await taskRepo.add({
      ...task,
      id: randomUUID(),
    });

    return res.status(201).json(savedTask);
  } catch (error) {
    console.error("Ошибка добавления задачи в PostgreSQL:", error);
    return res.status(500).json({ error: "Ошибка добавления задачи" });
  }
});

router.delete("/:id", async (req, res) => {
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

router.put("/:id", async (req, res) => {
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

export default router;
