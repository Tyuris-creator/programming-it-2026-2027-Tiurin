const API_URL = "http://localhost:5001/api/tasks";
const STUDENT_ID = "ivanov-ivan";

const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");
const form = document.getElementById("form");
const titleInput = document.getElementById("title");

async function loadTasks() {
  statusEl.textContent = "Загрузка…";
  statusEl.className = "status";

  const response = await fetch(
    `${API_URL}?studentId=${encodeURIComponent(STUDENT_ID)}`,
  );
  if (!response.ok) throw new Error("Не удалось загрузить задачи");

  const tasks = await response.json();
  console.log(tasks)
  return tasks;
}

function renderTask(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;

  const span = document.createElement("span");
  span.textContent = task.title;

  const btn = document.createElement("button");
  btn.textContent = "Удалить";
  btn.addEventListener("click", () => onDelete(task.id, li));

  li.append(span, btn);
  listEl.appendChild(li);
}

async function refresh() {
  try {
    listEl.innerHTML = "";
    const tasks = await loadTasks();
    if (tasks.length === 0) {
      statusEl.textContent = "Нет задач";
    } else {
      statusEl.textContent = `Задач: ${tasks.length}`;
      tasks.forEach((task) => renderTask(task));
    }
  } catch (err) {
    statusEl.textContent = "Ошибка загрузки";
    statusEl.classList.add("error");
    console.error(err);
  }
}

async function createTask(title) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      completed: false,
      studentId: STUDENT_ID,
    }),
  });
  if (!response.ok) throw new Error("Не удалось создать задачу");
  return response.json();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  try {
    const task = await createTask(title);
    titleInput.value = "";
    if (listEl.children.length === 0) statusEl.textContent = "Задач: 1";
    else statusEl.textContent = `Задач: ${listEl.children.length + 1}`;
    renderTask(task);
  } catch (err) {
    statusEl.textContent = "Ошибка создания";
    statusEl.classList.add("error");
    console.error(err);
  }
});

async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Не удалось удалить задачу");
}

async function onDelete(id, li) {
  try {
    await deleteTask(id);
    li.remove();
    const n = listEl.children.length;
    statusEl.textContent = n === 0 ? "Нет задач" : `Задач: ${n}`;
  } catch (err) {
    statusEl.textContent = "Ошибка удаления";
    statusEl.classList.add("error");
    console.error(err);
  }
}

refresh();