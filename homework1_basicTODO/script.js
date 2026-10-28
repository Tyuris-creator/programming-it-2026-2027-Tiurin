const form = document.querySelector("form");
const input = document.getElementById("task");
const container = document.getElementById("task-container");
const statusEl = document.getElementById("status");
const filtersEl = document.getElementById("filters");

// массив 
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let filter = "all"; // "all" | "active" | "done"

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

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
    title.textContent = task.title;
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

// добавление
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return; // пустая строка / пробелы — ничего не делаем

  tasks.push({ id: Date.now().toString(), title, completed: false });
  save();
  input.value = "";
  render();
});

// удаление и toggle через делегирование
container.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  const id = e.target.closest(".task").dataset.id;

  if (action === "delete") {
    tasks = tasks.filter((t) => t.id !== id);
  } else if (action === "toggle") {
    const task = tasks.find((t) => t.id === id);
    if (task) task.completed = !task.completed;
  }
  save();
  render();
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

render();
