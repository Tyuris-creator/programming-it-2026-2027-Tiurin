import fs from "node:fs/promises";

export default async function write(filePath, data) {
  const jsonData = JSON.stringify(data, null, 2);
  return await fs.writeFile(filePath, jsonData, "utf-8");
}
