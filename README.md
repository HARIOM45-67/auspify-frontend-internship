# Auspify Frontend Developer Internship - Submission

**Intern:** Hariom Tiwari
**Program:** Auspify Technologies - Frontend Developer Internship (4-week practical program)
**Tasks completed:** 4 of 6 (Tasks 1, 2, 3 and 4)

Every project is plain HTML, CSS and JavaScript. No build step or installation is needed: open the `index.html` file inside each folder in a browser.

| # | Task | Level | Folder |
|---|------|-------|--------|
| 1 | Responsive Landing Page | Easy | `task1-landing-page/` |
| 2 | Interactive Portfolio Website | Easy | `task2-portfolio/` |
| 3 | Dynamic To-Do Application | Medium | `task3-todo-app/` |
| 4 | Weather Dashboard Using API | Medium | `task4-weather-dashboard/` |

## Task 1 - Responsive Landing Page
Mobile-first landing page for a fictional coding platform ("CodeNest").
- Sticky navigation bar with a hamburger menu on mobile
- Hero section, features, courses, testimonials and a call-to-action sign-up form with email validation
- Responsive layout using CSS Grid and Flexbox with breakpoints at 900px and 720px

## Task 2 - Interactive Portfolio Website
Personal portfolio with smooth-scroll navigation and active-section highlighting.
- Animated skill bars, scroll-reveal animations, typing effect, hover effects
- Project filter (All / UI / JavaScript / API)
- Dark mode (saved in Local Storage), scroll progress bar, back-to-top button
- Contact form with field-level validation (opens the visitor's mail app)
- Respects `prefers-reduced-motion`

**Before submitting, edit:** the `to` email address in `task2-portfolio/script.js` and the GitHub/LinkedIn links in `task2-portfolio/index.html`. Also adjust the skill percentages to be honest about your level.

## Task 3 - Dynamic To-Do Application
- Add, delete and complete tasks, with priorities (low / medium / high)
- Double-click a task to edit it; filter All / Active / Completed; clear completed
- Progress bar, duplicate and empty-input validation
- Data saved in Local Storage, so tasks survive page reloads

## Task 4 - Weather Dashboard Using API
Uses the free [Open-Meteo](https://open-meteo.com) geocoding and forecast APIs (no API key needed).
- Search any city; shows current temperature, feels-like, humidity, wind, pressure and a 5-day forecast
- Celsius / Fahrenheit toggle, recent searches (Local Storage), background changes with weather and day/night
- Handles errors: empty input, city not found, network failure, server errors and timeouts
- Needs an internet connection to load data

## Screenshots
Add screenshots of each task in a `screenshots/` folder before submitting (the program asks for source code, screenshots, a GitHub repository link and an optional demo video).

## Suggested GitHub repository
```
git init
git add .
git commit -m "Auspify frontend internship: tasks 1-4"
```
Then create a repository on GitHub and push it. You can also enable GitHub Pages to get live demo links.
