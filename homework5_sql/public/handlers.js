const API_URL = "http://localhost:3000/api/v1/tasks";
const CACHE_KEY = "tasks_cache";

export function saveCache(tasks) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.log("Не удалось сохранить кэш", e);
  }
}

export function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function patchTask(task) {
  return fetch(`${API_URL}/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

export async function getTasks() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Не удалось получить задачи");
  const data = await response.json();
  return data.filter((t) => t.studentId === STUDENT_ID);
}

export async function createTask(task) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error("Не удалось создать задачу");
  return response.json();
}

export async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Не удалось удалить задачу");
}
