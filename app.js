// --- CONFIG & CONSTANTS ---
const MODES = {
  focus: { seconds: 25 * 60, label: 'Focus time' },
  break: { seconds: 5 * 60,  label: 'Break time' }
};

// --- INITIAL STATE MANAGEMENT ---
let state = {
  timer: { mode: 'focus', timeLeft: MODES.focus.seconds, isRunning: false, endTime: null },
  kanban: JSON.parse(localStorage.getItem('fb_kanban')) || [],
  habits: JSON.parse(localStorage.getItem('fb_habits')) || []
};

// --- SYNCHRONIZATION HELPERS ---
function saveToStorage(key, data) { localStorage.setItem(`fb_${key}`, JSON.stringify(data)); }

// --- TIMER CONTROLLER ---
const timerCircle = document.querySelector('.progress-ring__circle');
let circumference = 0;

if (timerCircle) {
  const radius = timerCircle.r.baseVal.value;
  circumference = radius * 2 * Math.PI;
  timerCircle.style.strokeDasharray = `${circumference} ${circumference}`;
}

function setProgress(percent) {
  if (!timerCircle) return;
  timerCircle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
}

let timerInterval = null;

function updateTimerDisplay() {
  const mins = Math.floor(state.timer.timeLeft / 60).toString().padStart(2, '0');
  const secs = (state.timer.timeLeft % 60).toString().padStart(2, '0');
  const displayStr = `${mins}:${secs}`;
  
  const timerTimeEl = document.getElementById('timer-time');
  if (timerTimeEl) timerTimeEl.textContent = displayStr;
  
  document.title = state.timer.isRunning ? `(${displayStr}) Focus Board` : 'Focus Board 🎯';

  const total = MODES[state.timer.mode].seconds;
  const percent = ((total - state.timer.timeLeft) / total) * 100;
  setProgress(percent);
}

function startTimer() {
  if (state.timer.isRunning) return;
  state.timer.isRunning = true;
  state.timer.endTime = Date.now() + state.timer.timeLeft * 1000;
  
  const startBtn = document.getElementById('timer-start');
  if (startBtn) startBtn.textContent = 'Pause';
  
  timerInterval = setInterval(() => {
    const remains = Math.round((state.timer.endTime - Date.now()) / 1000);
    if (remains <= 0) {
      clearInterval(timerInterval);
      state.timer.timeLeft = 0;
      state.timer.isRunning = false;
      state.timer.mode = state.timer.mode === 'focus' ? 'break' : 'focus';
      state.timer.timeLeft = MODES[state.timer.mode].seconds;
      if (startBtn) startBtn.textContent = 'Start';
      switchTimerModeVisual(state.timer.mode);
      updateTimerDisplay();
    } else {
      state.timer.timeLeft = remains;
      updateTimerDisplay();
    }
  }, 200);
}

function pauseTimer() {
  if (!state.timer.isRunning) return;
  clearInterval(timerInterval);
  state.timer.isRunning = false;
  const startBtn = document.getElementById('timer-start');
  if (startBtn) startBtn.textContent = 'Start';
  updateTimerDisplay();
}

function resetTimer() {
  clearInterval(timerInterval);
  state.timer.isRunning = false;
  state.timer.timeLeft = MODES[state.timer.mode].seconds;
  const startBtn = document.getElementById('timer-start');
  if (startBtn) startBtn.textContent = 'Start';
  updateTimerDisplay();
}

function switchTimerModeVisual(mode) {
  state.timer.mode = mode;
  document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
  const modeBtn = document.getElementById(`mode-${mode}`);
  if (modeBtn) modeBtn.classList.add('active');
  resetTimer();
}

// --- KANBAN BOARD SYSTEM ---
const kanbanForm = document.getElementById('kanban-form');
if (kanbanForm) {
  kanbanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('task-input');
    if (!input || !input.value.trim()) return;
    state.kanban.push({ id: Date.now().toString(), text: input.value.trim(), status: 'todo' });
    input.value = '';
    saveToStorage('kanban', state.kanban);
    renderKanban();
  });
}

function moveTask(id, dir) {
  const steps = ['todo', 'inprogress', 'done'];
  const t = state.kanban.find(x => x.id === id);
  if (t) {
    let idx = steps.indexOf(t.status) + dir;
    if (idx >= 0 && idx < steps.length) {
      t.status = steps[idx];
      saveToStorage('kanban', state.kanban);
      renderKanban();
    }
  }
}

function deleteTask(id) {
  state.kanban = state.kanban.filter(x => x.id !== id);
  saveToStorage('kanban', state.kanban);
  renderKanban();
}

function renderKanban() {
  const lists = { todo: document.getElementById('list-todo'), inprogress: document.getElementById('list-inprogress'), done: document.getElementById('list-done') };
  const counts = { todo: document.getElementById('count-todo'), inprogress: document.getElementById('count-inprogress'), done: document.getElementById('count-done') };

  Object.keys(lists).forEach(k => {
    if (lists[k]) lists[k].innerHTML = '';
    if (counts[k]) counts[k].textContent = '0';
  });

  state.kanban.forEach(task => {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.draggable = true;
    item.dataset.id = task.id;

    item.innerHTML = `
      <span>${task.text}</span>
      <div class="task-actions">
        <button class="btn-arrow" onclick="moveTask('${task.id}', -1)">&lt;</button>
        <button class="btn-arrow" onclick="moveTask('${task.id}', 1)">&gt;</button>
        <button class="btn-delete" onclick="deleteTask('${task.id}')">X</button>
      </div>
    `;

    item.addEventListener('dragstart', () => item.classList.add('dragging'));
    item.addEventListener('dragend', () => item.classList.remove('dragging'));

    if (lists[task.status]) lists[task.status].appendChild(item);
  });

  Object.keys(counts).forEach(k => {
    if (counts[k]) counts[k].textContent = state.kanban.filter(x => x.status === k).length;
  });
}

// --- HABIT TRACKER SYSTEM ---
function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff));

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d.toISOString().split('T')[0]; // DÜZƏLDİLDİ: [0] indeksi əlavə olundu
  });
}

const habitForm = document.getElementById('habit-form');
if (habitForm) {
  habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('habit-input');
    if (!input || !input.value.trim()) return;
    state.habits.push({ id: Date.now().toString(), name: input.value.trim(), history: {} });
    input.value = '';
    saveToStorage('habits', state.habits);
    renderHabits();
  });
}

function toggleHabit(habitId, dateStr) {
  const h = state.habits.find(x => x.id === habitId);
  if (h) {
    h.history[dateStr] = !h.history[dateStr];
    saveToStorage('habits', state.habits);
    renderHabits();
  }
}

function deleteHabit(id) {
  state.habits = state.habits.filter(x => x.id !== id);
  saveToStorage('habits', state.habits);
  renderHabits();
}

function renderHabits() {
  const tbody = document.getElementById('habits-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const dates = getWeekDates();
  const todayStr = new Date().toISOString().split('T')[0]; // DÜZƏLDİLDİ: [0] indeksi əlavə olundu

  state.habits.forEach(habit => {
    const tr = document.createElement('tr');
    let cellsHTML = `<td>${habit.name}</td>`;

    dates.forEach(d => {
      const isChecked = !!habit.history[d];
      const isToday = d === todayStr;
      cellsHTML += `
        <td class="habit-cell">
          <button class="habit-check-btn ${isChecked ? 'checked' : ''} ${isToday ? 'today' : ''}"
            onclick="toggleHabit('${habit.id}', '${d}')">
          </button>
        </td>
      `;
    });

    cellsHTML += `<td><button class="btn-delete" onclick="deleteHabit('${habit.id}')">X</button></td>`;
    tr.innerHTML = cellsHTML;
    tbody.appendChild(tr);
  });
}

// --- CLEAR ALL DATA (SIFIRLAMA) ---
const resetAllBtn = document.getElementById('reset-all-btn');
if (resetAllBtn) {
  resetAllBtn.addEventListener('click', () => {
    if (confirm('Bütün datanı silmək və paneli sıfırlamaq istəyirsiniz?')) {
      localStorage.clear(); // Yaddaş təmizlənir
      
      // State sıfırlanır
      state.kanban = [];
      state.habits = [];
      
      // Taymer sıfırlanır
      pauseTimer();
      state.timer.mode = 'focus';
      state.timer.timeLeft = MODES.focus.seconds;

      // İnterfeys vizual olaraq yenilənir
      renderKanban();
      renderHabits();
      updateTimerDisplay();
      switchTimerModeVisual('focus');
    }
  });
}

// --- EVENT BINDINGS & INIT ---
document.addEventListener('DOMContentLoaded', () => {
  // Taymer düymələri
  const startBtn = document.getElementById('timer-start');
  const resetBtn = document.getElementById('timer-reset');
  
  if (startBtn) startBtn.addEventListener('click', () => state.timer.isRunning ? pauseTimer() : startTimer());
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);
  
  document.querySelectorAll('.btn-mode').forEach(btn => {
    btn.addEventListener('click', (e) => switchTimerModeVisual(e.target.dataset.mode));
  });

  // Drag and Drop hadisələri
  document.querySelectorAll('.task-list').forEach(list => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const dragging = document.querySelector('.dragging');
      if (dragging) list.appendChild(dragging);
    });
    
    list.addEventListener('drop', () => {
      const dragging = document.querySelector('.dragging');
      if (dragging) {
        const id = dragging.dataset.id;
        const targetStatus = list.parentElement.dataset.status;
        const t = state.kanban.find(x => x.id === id);
        if (t) {
          t.status = targetStatus;
          saveToStorage('kanban', state.kanban);
          renderKanban();
        }
      }
    });
  });

  // İlk yükləniş renderi
  renderKanban();
  renderHabits();
  updateTimerDisplay();
});
