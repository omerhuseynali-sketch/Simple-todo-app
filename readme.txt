# 🎯 Focus Board

A beautiful, all-in-one productivity dashboard built completely with **Vanilla JavaScript, CSS3, and HTML5**. It combines a Pomodoro timer, a weekly habit tracker, and a Kanban board into a single, clean workspace.

No frameworks. No heavy libraries. Just fast, semantic web code.

---

## ✨ Features

*   **⏱️ Animated Pomodoro Timer:** Switch between Focus and Break modes with a visual, smooth SVG progress ring that animates down to the millisecond.
*   **📊 Weekly Habit Tracker:** A matrix layout running from Monday to Sunday to track your daily routines with automatic styling hooks for the current calendar day.
*   **📋 Interactive Kanban Board:** Create, update, and manage your workflow lanes (`To Do`, `In Progress`, `Done`) using native HTML5 drag-and-drop mechanics or quick-click arrow controls.
*   **💾 Local Storage Persistence:** Your workspace states, active data trees, and habit history automatically save to your browser's local cache—never lose your configuration on a page refresh.
*   **🧼 Master Purge Controls:** Reset your environment instantly using a clean database clearing engine linked to user-confirmation protection loops.

---

## 🛠️ The Tech Stack

*   **Structure:** HTML5 (Semantic elements, responsive layout mapping, custom SVG geometries)
*   **Styling:** CSS3 (Modern 12-column grid matrix, absolute root variables, adaptive smartphone breakpoints)
*   **Logic:** Vanilla JavaScript (Unified state engine, absolute epoch time synchronization via `Date.now()`, custom DOM injection arrays)

---

## 🚀 Getting Started

Getting your personal Focus Board up and running takes less than 30 seconds.

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   ```

2. **Navigate into the directory:**
   ```bash
   cd focus-board
   ```

3. **Launch the app:**
   Simply double-click the `index.html` file to open the application instantly inside your favorite web browser—or launch it using the VS Code **Live Server** extension.

---

## 📂 File Architecture

```text
├── index.html     # Semantic foundation, layout tags, and layout skeletons
├── style.css      # Core root token design variables, CSS grids, and SVG styling
└── app.js         # Unified state controllers, storage synchronizers, and render engines
```

---

## 🧠 What I Learned Building This

*   **Defeating Timer Drift:** Standard browser loops naturally lag over time. I learned how to safeguard countdown metrics by tracking active UNIX epoch differences against absolute target end times.
*   **State-Driven UI Rendering:** Instead of changing individual HTML elements whenever actions happen, I structured a central `state` object that acts as the single source of truth, triggering complete interface repaints on demand.
*   **SVG Math Manipulations:** Programmed real-time visual indicator arc values by running element metrics through radius circumference equations (2 π r).

---

💡 *Feel free to fork this project, add custom styling themes, or open a pull request to introduce new modular panels! Happy coding!*
