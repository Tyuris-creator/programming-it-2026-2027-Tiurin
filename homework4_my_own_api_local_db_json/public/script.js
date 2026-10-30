const form = document.querySelector("form");
const input = document.getElementById("task");
const container = document.getElementById("task-container");
const statusEl = document.getElementById("status");
const filtersEl = document.getElementById("filters");

const STUDENT_ID = "Mikhail_Tiurin";
const API_URL = "http://localhost:3000/api/v1/tasks";

// cash
const CACHE_KEY = "tasks_cache";

function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.log("Не удалось сохранить кэш", e);
  }
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function patchTask(task) {
  return fetch(`${API_URL}/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

async function getTasks() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Не удалось получить задачи");
  const data = await response.json();
  return data.filter((t) => t.studentId === STUDENT_ID);
}

async function createTask(task) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error("Не удалось создать задачу");
  return response.json();
}

async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Не удалось удалить задачу");
}

let tasks = [];
let filter = "all";

function visibleTasks() {
  if (filter === "active") return tasks.filter((t) => !t.completed);
  if (filter === "done") return tasks.filter((t) => t.completed);
  return tasks;
}

function render() {
  container.innerHTML = "";

  const list = visibleTasks();
  for (const task of list) {
    const row = document.createElement("div");
    row.className = "task";
    row.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.dataset.action = "toggle";

    const title = document.createElement("span");
    title.textContent = task.id.slice(0, 5) + "-" + task.title;
    if (task.completed) title.style.textDecoration = "line-through";

    const del = document.createElement("button");
    del.textContent = "Удалить";
    del.dataset.action = "delete";

    row.append(checkbox, title, del);
    container.append(row);
  }

  if (tasks.length === 0) statusEl.textContent = "Задач нет";
  else
    statusEl.textContent = `Всего: ${tasks.length}, показано: ${list.length}`;
}

async function init() {
  tasks = loadCache();
  if (tasks.length) render();

  statusEl.textContent = "Загрузка...";
  try {
    tasks = await getTasks();
    saveCache();
    render();
  } catch (e) {
    console.log(e);
    if (tasks.length) {
      statusEl.textContent = `Ошибка загрузки, показан кэш (${tasks.length})`;
      render();
    } else {
      statusEl.textContent = "Ошибка загрузки";
    }
  }
}
init();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;

  try {
    const created = await createTask({
      title,
      completed: false,
      studentId: STUDENT_ID,
    });
    tasks.push(created);
    saveCache();
    input.value = "";
    render();
  } catch (err) {
    console.log(err);
    statusEl.textContent = "Не удалось создать задачу";
  }
});

container.addEventListener("click", async (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  const id = e.target.closest(".task").dataset.id;
  console.log(id);
  if (action === "delete") {
    try {
      await deleteTask(id);
      tasks = tasks.filter((t) => String(t.id) !== String(id));
      saveCache();
      render();
    } catch (err) {
      console.log(err);
      statusEl.textContent = "Ошибка удаления";
    }
  } else if (action === "toggle") {
    const task = tasks.find((t) => String(t.id) === String(id));
    if (task) task.completed = !task.completed;
    try {
      await patchTask(task);
      saveCache();
      render();
    } catch (err) {
      console.log(err);
      statusEl.textContent = "Ошибка обновления";
    }
  }
});

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;

  filter = btn.dataset.filter;
  for (const b of filtersEl.querySelectorAll("button")) {
    b.classList.toggle("active", b === btn);
  }
  render();
});
