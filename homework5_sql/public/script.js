import {
  saveCache,
  loadCache,
  patchTask,
  getTasks,
  createTask,
  deleteTask,
} from "./handlers.js";

const form = document.querySelector("form");
const input = document.getElementById("task");
const container = document.getElementById("task-container");
const statusEl = document.getElementById("status");
const filtersEl = document.getElementById("filters");

const STUDENT_ID = "Mikhail_Tiurin";

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
    saveCache(tasks);
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
    saveCache(tasks);
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
      saveCache(tasks);
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
