import fs from "node:fs/promises";

export default async function read(filePath) {
  const data = await fs.readFile(filePath, "utf-8");
  if (!data) {
    throw new Error("Ошибка чтения файла...");
  }
  return JSON.parse(data);
}
