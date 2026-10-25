const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

// ---------- Mobile menu ----------
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
$$("#navLinks a").forEach((a) => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}));

// ---------- Dark mode (remembered) ----------
const themeBtn = $("#themeBtn");
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  themeBtn.textContent = t === "dark" ? "☀" : "☾";
}
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (_) {}
applyTheme(saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (_) {}
});

// ---------- Typing effect ----------
const roles = ["MCA Student", "Front-End Developer", "Problem Solver", "Lifelong Learner"];
const typed = $("#typed");
let r = 0, c = 0, deleting = false;
(function type() {
  const word = roles[r];
  typed.textContent = word.slice(0, c);
  if (!deleting && c === word.length) { deleting = true; return setTimeout(type, 1400); }
  if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; }
  c += deleting ? -1 : 1;
  setTimeout(type, deleting ? 45 : 90);
})();

// ---------- Reveal on scroll + skill bars ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("visible");
    const lvl = en.target.dataset.level;
    if (lvl) $(".fill", en.target).style.width = lvl + "%";
    io.unobserve(en.target);
  });
}, { threshold: 0.15 });
$$(".reveal").forEach((el) => io.observe(el));

// ---------- Active nav link, progress bar, back-to-top ----------
const sections = $$("main section[id]");
const links = $$("#navLinks a");
const progress = $("#progress");
const toTop = $("#toTop");
function onScroll() {
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  toTop.classList.toggle("show", y > 500);
  let current = sections[0].id;
  sections.forEach((s) => { if (y + 120 >= s.offsetTop) current = s.id; });
  links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------- Project filter ----------
$$("#filters .chip").forEach((chip) => chip.addEventListener("click", () => {
  $$("#filters .chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  const f = chip.dataset.filter;
  $$("#projectGrid .project").forEach((p) => {
    const show = f === "all" || p.dataset.cat.split(" ").includes(f);
    p.classList.toggle("hide", !show);
  });
}));

// ---------- Contact form validation ----------
const form = $("#contactForm");
const status = $("#status");
function setError(id, text) {
  $("#" + id + "Err").textContent = text;
  $("#" + id).closest(".field").classList.toggle("invalid", Boolean(text));
  return !text;
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  status.textContent = "";
  const name = $("#name").value.trim();
  const email = $("#email").value.trim();
  const message = $("#message").value.trim();
  const ok = [
    setError("name", name.length < 2 ? "Please enter your name." : ""),
    setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Please enter a valid email."),
    setError("message", message.length < 10 ? "Message should be at least 10 characters." : ""),
  ].every(Boolean);
  if (!ok) return;
  // Demo only: opens the visitor's mail app. Replace the address below with your own.
  const to = "your-email@example.com";
  const body = encodeURIComponent(message + "\n\n- " + name + " (" + email + ")");
  window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Portfolio message from " + name) + "&body=" + body;
  status.textContent = "Thanks, " + name + "! Your message is ready to send.";
  form.reset();
});

$("#year").textContent = new Date().getFullYear();
