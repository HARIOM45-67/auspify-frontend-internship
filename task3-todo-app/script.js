const STORAGE_KEY = "auspify.todo.tasks.v1";

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const errorEl = document.getElementById("error");
const listEl = document.getElementById("taskList");
const emptyEl = document.getElementById("empty");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const filtersEl = document.getElementById("filters");
const clearBtn = document.getElementById("clearDone");

let tasks = load();
let filter = "all";

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (_) {}
}

function addTask(text, prio) {
  tasks.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, priority: prio, done: false });
  save();
  render();
}

function toggleTask(id) {
  const t = tasks.find((x) => x.id === id);
  if (t) { t.done = !t.done; save(); render(); }
}

function deleteTask(id, li) {
  li.classList.add("removing");
  setTimeout(() => {
    tasks = tasks.filter((x) => x.id !== id);
    save();
    render();
  }, 200);
}

function editTask(id, li) {
  const t = tasks.find((x) => x.id === id);
  const textEl = li.querySelector(".text");
  const box = document.createElement("input");
  box.className = "edit-input";
  box.value = t.text;
  box.maxLength = 120;
  textEl.replaceWith(box);
  box.focus();
  box.select();
  let finished = false;
  const finish = (commit) => {
    if (finished) return;
    finished = true;
    const v = box.value.trim();
    if (commit && v) { t.text = v; save(); }
    render();
  };
  box.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  box.addEventListener("blur", () => finish(true));
}

function visibleTasks() {
  if (filter === "active") return tasks.filter((t) => !t.done);
  if (filter === "completed") return tasks.filter((t) => t.done);
  return tasks;
}

function render() {
  listEl.innerHTML = "";
  const items = visibleTasks();

  items.forEach((t) => {
    const li = document.createElement("li");
    li.className = `task p-${t.priority}${t.done ? " done" : ""}`;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.setAttribute("aria-label", "Mark task complete");
    cb.addEventListener("change", () => toggleTask(t.id));

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = t.text; // textContent prevents HTML injection
    span.title = "Double-click to edit";
    span.addEventListener("dblclick", () => editTask(t.id, li));

    const del = document.createElement("button");
    del.className = "del";
    del.innerHTML = "&times;";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(t.id, li));

    li.append(cb, span, del);
    listEl.appendChild(li);
  });

  emptyEl.hidden = items.length > 0;

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  progressFill.style.width = pct + "%";
  progressText.textContent = `${done} of ${tasks.length} done`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) { errorEl.textContent = "Please type a task first."; return; }
  if (tasks.some((t) => t.text.toLowerCase() === text.toLowerCase() && !t.done)) {
    errorEl.textContent = "That task is already on your list.";
    return;
  }
  errorEl.textContent = "";
  addTask(text, priority.value);
  input.value = "";
  input.focus();
});

input.addEventListener("input", () => { errorEl.textContent = ""; });

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  filter = btn.dataset.filter;
  filtersEl.querySelectorAll(".filter").forEach((b) => b.classList.toggle("active", b === btn));
  render();
});

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
});

document.getElementById("today").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

render();
