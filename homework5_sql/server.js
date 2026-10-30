import express from "express";
import cors from "cors";

import writeToJson from "./json_handlers/writeFromJson.js";
import readFromJson from "./json_handlers/readFromJson.js";

import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import path from "node:path";

import { randomUUID } from "crypto";

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
    const DB = await readFromJson(PATH_TO_JSON);
    res.status(200).json(DB);
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
  task.id = randomUUID();

  try {
    const DB = await readFromJson(PATH_TO_JSON);
    DB.push(task);
    await writeToJson(PATH_TO_JSON, DB);
  } catch (error) {
    console.error("Ошибка записи файла:", error);
    return res.status(500).json({ error: "Ошибка записи файла" });
  }

  res.status(201).json(task);
});

app.delete("/api/v1/tasks/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const DB = await readFromJson(PATH_TO_JSON);
    const index = DB.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Задача не найдена" });
    }
    DB.splice(index, 1);
    await writeToJson(PATH_TO_JSON, DB);
  } catch (error) {
    console.error("Ошибка записи файла:", error);
    return res.status(500).json({ error: "Ошибка записи файла" });
  }
  res.status(200).end();
});

app.put("/api/v1/tasks/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const DB = await readFromJson(PATH_TO_JSON);
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
    await writeToJson(PATH_TO_JSON, DB);
    res.status(200).json(task);
  } catch (error) {
    console.error("Ошибка записи файла:", error);
    return res.status(500).json({ error: "Ошибка записи файла" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
