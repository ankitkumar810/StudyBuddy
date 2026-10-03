/**
 * StudyBuddy Application Logic
 * Full-featured Pomodoro Timer, 3D Flashcards, and Interactive Quiz Engine
 */

// ============================================================================
// 1. Initial State & Default Sample Data
// ============================================================================

const DEFAULT_SETTINGS = {
  workTime: 25,
  shortBreak: 5,
  longBreak: 15,
  cycles: 4,
  autoBreak: false,
  sound: true,
  tick: false
};

const DEFAULT_FLASHCARDS = [
  {
    id: "card_1",
    deck: "Computer Science",
    front: "What is a Closure in JavaScript?",
    back: "A closure is a combination of a function bundled together with references to its surrounding lexical environment, allowing access to an outer function's scope from an inner function even after the outer function has executed.",
    hint: "Think about lexical scoping and preserving variables.",
    starred: false,
    mastered: false
  },
  {
    id: "card_2",
    deck: "Computer Science",
    front: "What is the difference between 'let' and 'var' in JS?",
    back: "'let' has block scope and does not create properties on the global object, while 'var' has function scope and is hoisted with an initial value of undefined.",
    hint: "Think about scoping rules and hoisting behavior.",
    starred: false,
    mastered: false
  },
  {
    id: "card_3",
    deck: "Computer Science",
    front: "What is the Time Complexity of Binary Search?",
    back: "O(log n) because the search space is cut in half on each iteration over a sorted array.",
    hint: "Dividing the problem in halves.",
    starred: false,
    mastered: false
  },
  {
    id: "card_4",
    deck: "Biology",
    front: "What is the function of the Mitochondria in a eukaryotic cell?",
    back: "Often called the powerhouse of the cell, it produces ATP (adenosine triphosphate) through cellular respiration to supply the cell with energy.",
    hint: "Energy generation / Powerhouse.",
    starred: true,
    mastered: false
  },
  {
    id: "card_5",
    deck: "Biology",
    front: "What are the four nitrogenous nucleotide bases in DNA?",
    back: "Adenine (A), Thymine (T), Guanine (G), and Cytosine (C). A pairs with T, and G pairs with C.",
    hint: "A, T, C, G.",
    starred: false,
    mastered: false
  },
  {
    id: "card_6",
    deck: "General Knowledge",
    front: "What is the capital of Japan?",
    back: "Tokyo — it is one of the world's most populous metropolitan areas.",
    hint: "Starts with the letter T.",
    starred: false,
    mastered: false
  },
  {
    id: "card_7",
    deck: "General Knowledge",
    front: "Who formulated the Theory of General Relativity?",
    back: "Albert Einstein in 1915, describing gravity as a geometric property of space and time.",
    hint: "Famous physicist (E = mc²).",
    starred: false,
    mastered: false
  }
];

const DEFAULT_QUIZ_QUESTIONS = [
  {
    id: "q_1",
    category: "Computer Science",
    question: "Which data structure uses the LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Binary Tree", "Linked List"],
    correctIndex: 1,
    explanation: "A Stack operates on Last-In-First-Out, like a stack of plates."
  },
  {
    id: "q_2",
    category: "Computer Science",
    question: "What does CSS stand for in web development?",
    options: [
      "Cascading Style Sheets",
      "Computer Style System",
      "Creative Styling Syntax",
      "Coded Structure System"
    ],
    correctIndex: 0,
    explanation: "CSS stands for Cascading Style Sheets, used to style HTML documents."
  },
  {
    id: "q_3",
    category: "Biology",
    question: "Which organelle is responsible for photosynthesis in plant cells?",
    options: ["Ribosome", "Endoplasmic Reticulum", "Chloroplast", "Golgi Apparatus"],
    correctIndex: 2,
    explanation: "Chloroplasts contain chlorophyll which absorbs sunlight for photosynthesis."
  },
  {
    id: "q_4",
    category: "General Knowledge",
    question: "What is the largest planet in our Solar System?",
    options: ["Saturn", "Neptune", "Jupiter", "Mars"],
    correctIndex: 2,
    explanation: "Jupiter is by far the largest planet, with more mass than all other planets combined."
  },
  {
    id: "q_5",
    category: "Computer Science",
    question: "What does the JavaScript array method '.map()' return?",
    options: [
      "The length of the original array",
      "A new array containing the results of calling a provided function on every element",
      "The first element that matches a test",
      "A boolean value indicating if elements match"
    ],
    correctIndex: 1,
    explanation: ".map() creates a brand new array populated with the results of calling the function on every item."
  }
];

// ============================================================================
// 2. Audio Engine (Pure Web Audio API - Zero external files needed)
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Play pleasant celebratory chime for timer completion
  playTimerChime() {
    if (!appState.settings.sound) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 1.3);
    });
  }

  // Soft tick sound for focus clock
  playTick() {
    if (!appState.settings.tick || !appState.settings.sound) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  // Correct answer bell
  playSuccess() {
    if (!appState.settings.sound) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, this.ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  // Incorrect answer soft buzz
  playFail() {
    if (!appState.settings.sound) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.28);
  }

  // Calming Binaural Pink-Noise / Rain generator
  toggleAmbient() {
    this.init();
    if (!this.ctx) return false;

    if (this.isAmbientPlaying) {
      if (this.ambientSource) {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      }
      this.isAmbientPlaying = false;
      return false;
    }

    try {
      // 5-second buffer of generated soft pink noise looped seamlessly
      const bufferSize = this.ctx.sampleRate * 4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Lowpass filter to make it sound like gentle distant rainfall / calm study environment
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(750, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      noise.start();
      this.ambientSource = noise;
      this.isAmbientPlaying = true;
      return true;
    } catch (e) {
      console.error("Ambient audio error:", e);
      return false;
    }
  }
}

const sounds = new SoundEngine();

// ============================================================================
// 3. Persistent App State Storage
// ============================================================================

class AppState {
  constructor() {
    this.settings = this.loadJSON("sb_settings", DEFAULT_SETTINGS);
    this.flashcards = this.loadJSON("sb_flashcards", DEFAULT_FLASHCARDS);
    this.quizQuestions = this.loadJSON("sb_quizzes", DEFAULT_QUIZ_QUESTIONS);
    this.stats = this.loadJSON("sb_stats", {
      completedSessions: 0,
      totalMinutes: 0,
      streak: 1,
      lastDate: new Date().toDateString()
    });
    this.tasks = this.loadJSON("sb_tasks", [
      { id: "task_1", text: "Read Chapter Summary", completed: true },
      { id: "task_2", text: "Review 10 Flashcards", completed: false }
    ]);

    this.checkStreak();
  }

  loadJSON(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : JSON.parse(JSON.stringify(fallback));
    } catch (e) {
      console.warn("Storage load error:", e);
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  saveAll() {
    this.save("sb_settings", this.settings);
    this.save("sb_flashcards", this.flashcards);
    this.save("sb_quizzes", this.quizQuestions);
    this.save("sb_stats", this.stats);
    this.save("sb_tasks", this.tasks);
  }

  checkStreak() {
    const today = new Date().toDateString();
    if (this.stats.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (this.stats.lastDate === yesterday) {
        this.stats.streak += 1;
      } else {
        this.stats.streak = 1;
      }
      this.stats.lastDate = today;
      this.save("sb_stats", this.stats);
    }
  }

  recordCompletedSession(durationMinutes) {
    this.stats.completedSessions += 1;
    this.stats.totalMinutes += durationMinutes;
    this.save("sb_stats", this.stats);
  }
}

const appState = new AppState();

// ============================================================================
// 4. Toast Notifications & Confetti
// ============================================================================

function showToast(message, icon = "✨") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Lightweight particle confetti effect
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#6366f1", "#a855f7", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2 - 50,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let animationId;
  const startTime = Date.now();

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.rotation += p.rotSpeed;
      p.opacity -= 0.009;

      if (p.opacity > 0 && p.y < canvas.height) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive && Date.now() - startTime < 3500) {
      animationId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationId);
    }
  }

  render();
}

// ============================================================================
// 5. Pomodoro Clock Module
// ============================================================================

class PomodoroController {
  constructor() {
    this.mode = "work"; // 'work' | 'shortBreak' | 'longBreak'
    this.cycle = 1;
    this.isRunning = false;
    this.timerId = null;
    this.totalSeconds = 25 * 60;
    this.remainingSeconds = 25 * 60;
    this.lastTimestamp = null;

    // Elements
    this.timeDisplay = document.getElementById("timer-time");
    this.startBtn = document.getElementById("timer-start-pause-btn");
    this.playPauseText = document.getElementById("play-pause-text");
    this.resetBtn = document.getElementById("timer-reset-btn");
    this.skipBtn = document.getElementById("timer-skip-btn");
    this.progressBar = document.getElementById("timer-progress-bar");
    this.statusBadge = document.getElementById("timer-status-badge");
    this.cycleNum = document.getElementById("current-cycle-num");
    this.totalCycles = document.getElementById("total-cycles-num");
    this.modeBtns = document.querySelectorAll(".mode-btn");

    this.circumference = 2 * Math.PI * 140; // ~879.64

    this.init();
  }

  init() {
    this.totalCycles.textContent = appState.settings.cycles;
    this.setMode("work", false);

    // Event listeners
    this.startBtn.addEventListener("click", () => this.toggleStart());
    this.resetBtn.addEventListener("click", () => this.resetTimer());
    this.skipBtn.addEventListener("click", () => this.skipSession());

    this.modeBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const mode = e.target.getAttribute("data-mode");
        this.setMode(mode);
      });
    });

    // Quick preset buttons
    document.querySelectorAll(".chip-btn").forEach(chip => {
      chip.addEventListener("click", (e) => {
        const mins = parseInt(e.target.getAttribute("data-minutes"), 10);
        this.applyCustomMinutes(mins);
      });
    });

    this.updateStatsUI();
  }

  setMode(mode, autoStart = false) {
    this.pause();
    this.mode = mode;

    document.body.classList.remove("mode-work", "mode-shortBreak", "mode-longBreak");
    document.body.classList.add(`mode-${mode}`);

    this.modeBtns.forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-mode") === mode);
    });

    let mins = appState.settings.workTime;
    let badgeText = "FOCUS TIME";

    if (mode === "shortBreak") {
      mins = appState.settings.shortBreak;
      badgeText = "SHORT BREAK ☕";
    } else if (mode === "longBreak") {
      mins = appState.settings.longBreak;
      badgeText = "LONG REST 🌿";
    }

    this.statusBadge.textContent = badgeText;
    this.totalSeconds = mins * 60;
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();

    if (autoStart) {
      this.start();
    }
  }

  applyCustomMinutes(mins) {
    this.pause();
    this.totalSeconds = mins * 60;
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    showToast(`Timer set to ${mins} minutes`, "⏱️");
  }

  toggleStart() {
    sounds.init();
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = Date.now();
    this.playPauseText.textContent = "Pause";
    this.startBtn.classList.add("btn-secondary");
    this.startBtn.classList.remove("btn-primary");

    // Interval with time delta check
    this.timerId = setInterval(() => {
      const now = Date.now();
      const deltaSec = Math.floor((now - this.lastTimestamp) / 1000);
      if (deltaSec >= 1) {
        this.remainingSeconds -= deltaSec;
        this.lastTimestamp = now;

        sounds.playTick();

        if (this.remainingSeconds <= 0) {
          this.remainingSeconds = 0;
          this.updateDisplay();
          this.onSessionComplete();
          return;
        }
        this.updateDisplay();
      }
    }, 250);
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerId);
    this.timerId = null;
    this.playPauseText.textContent = "Resume";
    this.startBtn.classList.add("btn-primary");
    this.startBtn.classList.remove("btn-secondary");
  }

  resetTimer() {
    this.pause();
    this.playPauseText.textContent = "Start Focus";
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    showToast("Timer reset", "🔄");
  }

  skipSession() {
    this.pause();
    this.advanceMode();
    showToast("Skipped to next session", "⏭️");
  }

  onSessionComplete() {
    this.pause();
    sounds.playTimerChime();
    launchConfetti();

    if (this.mode === "work") {
      const durationMins = Math.round(this.totalSeconds / 60);
      appState.recordCompletedSession(durationMins);
      this.updateStatsUI();
      showToast("Great work! Focus session finished!", "🎉");

      // Check if long break interval hit
      if (this.cycle >= appState.settings.cycles) {
        this.cycle = 1;
        this.cycleNum.textContent = this.cycle;
        this.setMode("longBreak", appState.settings.autoBreak);
      } else {
        this.cycle += 1;
        this.cycleNum.textContent = this.cycle;
        this.setMode("shortBreak", appState.settings.autoBreak);
      }
    } else {
      showToast("Break is over! Time to get focused.", "💪");
      this.setMode("work", appState.settings.autoBreak);
    }
  }

  advanceMode() {
    if (this.mode === "work") {
      if (this.cycle >= appState.settings.cycles) {
        this.cycle = 1;
        this.cycleNum.textContent = this.cycle;
        this.setMode("longBreak", false);
      } else {
        this.cycle += 1;
        this.cycleNum.textContent = this.cycle;
        this.setMode("shortBreak", false);
      }
    } else {
      this.setMode("work", false);
    }
  }

  updateDisplay() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.timeDisplay.textContent = timeStr;

    // Update document title
    document.title = `(${timeStr}) ${this.mode === 'work' ? 'Focus' : 'Break'} - StudyBuddy`;

    // Circular SVG Progress Ring
    if (this.progressBar && this.totalSeconds > 0) {
      const progressFraction = (this.totalSeconds - this.remainingSeconds) / this.totalSeconds;
      const offset = this.circumference * (1 - progressFraction);
      this.progressBar.style.strokeDashoffset = offset;
    }
  }

  updateStatsUI() {
    const sessElem = document.getElementById("stat-completed-sessions");
    const minElem = document.getElementById("stat-total-minutes");
    const streakElem = document.getElementById("streak-counter");

    if (sessElem) sessElem.textContent = appState.stats.completedSessions;
    if (minElem) minElem.textContent = appState.stats.totalMinutes;
    if (streakElem) streakElem.textContent = `${appState.stats.streak} Day Streak`;
  }
}

// ============================================================================
// 6. Tasks / Checklist Controller
// ============================================================================

class TasksController {
  constructor() {
    this.form = document.getElementById("add-task-form");
    this.input = document.getElementById("new-task-input");
    this.list = document.getElementById("session-tasks-list");
    this.ratioLabel = document.getElementById("task-completed-ratio");

    this.init();
  }

  init() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = this.input.value.trim();
      if (!text) return;

      const newTask = {
        id: "task_" + Date.now(),
        text: text,
        completed: false
      };
      appState.tasks.push(newTask);
      appState.save("sb_tasks", appState.tasks);
      this.input.value = "";
      this.render();
      showToast("Goal added to list", "📝");
    });

    this.render();
  }

  render() {
    this.list.innerHTML = "";
    const total = appState.tasks.length;
    const completed = appState.tasks.filter(t => t.completed).length;
    this.ratioLabel.textContent = `${completed}/${total} done`;

    if (total === 0) {
      this.list.innerHTML = `<li style="color:var(--text-dim);font-size:0.85rem;padding:6px 0;">No active goals. Add one above!</li>`;
      return;
    }

    appState.tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = `task-item ${task.completed ? "completed" : ""}`;

      li.innerHTML = `
        <label class="task-item-left">
          <input type="checkbox" ${task.completed ? "checked" : ""}>
          <span>${this.escapeHTML(task.text)}</span>
        </label>
        <button class="task-del-btn" title="Delete Task">&times;</button>
      `;

      // Checkbox toggle
      li.querySelector("input").addEventListener("change", (e) => {
        task.completed = e.target.checked;
        appState.save("sb_tasks", appState.tasks);
        this.render();
      });

      // Delete button
      li.querySelector(".task-del-btn").addEventListener("click", () => {
        appState.tasks = appState.tasks.filter(t => t.id !== task.id);
        appState.save("sb_tasks", appState.tasks);
        this.render();
      });

      this.list.appendChild(li);
    });
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

// ============================================================================
// 7. Flashcards 3D Interactive Controller
// ============================================================================

class FlashcardController {
  constructor() {
    this.currentIndex = 0;
    this.activeFilter = "all"; // 'all' | 'starred'
    this.activeDeck = "all";
    this.filteredCards = [];

    // DOM Elements
    this.cardContainer = document.getElementById("flashcard-3d");
    this.deckSelect = document.getElementById("deck-select");
    this.indexIndicator = document.getElementById("card-index-indicator");
    this.deckTag = document.getElementById("card-deck-tag");
    this.questionText = document.getElementById("card-question-text");
    this.hintText = document.getElementById("card-hint-text");
    this.answerText = document.getElementById("card-answer-text");
    this.starBtn = document.getElementById("card-star-btn");

    this.prevBtn = document.getElementById("prev-card-btn");
    this.nextBtn = document.getElementById("next-card-btn");
    this.hardBtn = document.getElementById("card-hard-btn");
    this.easyBtn = document.getElementById("card-easy-btn");
    this.shuffleBtn = document.getElementById("shuffle-deck-btn");
    this.filterAllBtn = document.getElementById("filter-all-btn");
    this.filterStarredBtn = document.getElementById("filter-starred-btn");

    this.init();
  }

  init() {
    this.populateDeckSelect();
    this.applyFilter();

    // 3D Flip on Click
    this.cardContainer.addEventListener("click", () => {
      this.flipCard();
    });

    // Spacebar to flip card
    window.addEventListener("keydown", (e) => {
      const activeTab = document.querySelector(".view-panel.active");
      if (activeTab && activeTab.id === "tab-flashcards") {
        if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          this.flipCard();
        } else if (e.code === "ArrowRight") {
          this.nextCard();
        } else if (e.code === "ArrowLeft") {
          this.prevCard();
        }
      }
    });

    this.prevBtn.addEventListener("click", () => this.prevCard());
    this.nextBtn.addEventListener("click", () => this.nextCard());

    this.hardBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.markCardDifficulty(true);
    });

    this.easyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.markCardDifficulty(false);
    });

    this.starBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleStarred();
    });

    this.shuffleBtn.addEventListener("click", () => this.shuffleCards());

    this.deckSelect.addEventListener("change", (e) => {
      this.activeDeck = e.target.value;
      this.applyFilter();
    });

    this.filterAllBtn.addEventListener("click", () => {
      this.activeFilter = "all";
      this.filterAllBtn.classList.add("active");
      this.filterStarredBtn.classList.remove("active");
      this.applyFilter();
    });

    this.filterStarredBtn.addEventListener("click", () => {
      this.activeFilter = "starred";
      this.filterStarredBtn.classList.add("active");
      this.filterAllBtn.classList.remove("active");
      this.applyFilter();
    });
  }

  populateDeckSelect() {
    const decks = [...new Set(appState.flashcards.map(c => c.deck))];
    const curVal = this.deckSelect.value;
    this.deckSelect.innerHTML = `<option value="all">All Flashcards</option>`;
    decks.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      this.deckSelect.appendChild(opt);
    });
    if (decks.includes(curVal)) {
      this.deckSelect.value = curVal;
    }
  }

  applyFilter() {
    this.filteredCards = appState.flashcards.filter(c => {
      const matchDeck = this.activeDeck === "all" || c.deck === this.activeDeck;
      const matchFilter = this.activeFilter === "all" || (this.activeFilter === "starred" && c.starred);
      return matchDeck && matchFilter;
    });

    this.currentIndex = 0;
    this.renderCurrentCard();
  }

  flipCard() {
    this.cardContainer.classList.toggle("flipped");
  }

  renderCurrentCard() {
    this.cardContainer.classList.remove("flipped");

    if (this.filteredCards.length === 0) {
      this.deckTag.textContent = "Empty";
      this.questionText.textContent = "No flashcards found in this view.";
      this.hintText.textContent = "Click '+ New Card' or change deck filters!";
      this.answerText.textContent = "Nothing to display.";
      this.indexIndicator.textContent = "0 of 0";
      this.starBtn.classList.remove("starred");
      return;
    }

    if (this.currentIndex >= this.filteredCards.length) {
      this.currentIndex = 0;
    }

    const card = this.filteredCards[this.currentIndex];
    this.deckTag.textContent = card.deck;
    this.questionText.textContent = card.front;
    this.hintText.textContent = card.hint ? `Hint: ${card.hint}` : "";
    this.answerText.textContent = card.back;
    this.indexIndicator.textContent = `Card ${this.currentIndex + 1} of ${this.filteredCards.length}`;

    if (card.starred) {
      this.starBtn.classList.add("starred");
    } else {
      this.starBtn.classList.remove("starred");
    }
  }

  nextCard() {
    if (this.filteredCards.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.filteredCards.length;
    this.renderCurrentCard();
  }

  prevCard() {
    if (this.filteredCards.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.filteredCards.length) % this.filteredCards.length;
    this.renderCurrentCard();
  }

  shuffleCards() {
    for (let i = this.filteredCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.filteredCards[i], this.filteredCards[j]] = [this.filteredCards[j], this.filteredCards[i]];
    }
    this.currentIndex = 0;
    this.renderCurrentCard();
    showToast("Cards shuffled!", "🔀");
  }

  toggleStarred() {
    if (this.filteredCards.length === 0) return;
    const card = this.filteredCards[this.currentIndex];
    card.starred = !card.starred;
    appState.save("sb_flashcards", appState.flashcards);
    this.renderCurrentCard();
    showToast(card.starred ? "Card marked for review ⭐" : "Unstarred card", "⭐");
  }

  markCardDifficulty(isHard) {
    if (this.filteredCards.length === 0) return;
    const card = this.filteredCards[this.currentIndex];
    card.starred = isHard;
    card.mastered = !isHard;
    appState.save("sb_flashcards", appState.flashcards);

    if (isHard) {
      showToast("Marked as Need Practice 🤔", "📚");
    } else {
      showToast("Awesome! Marked as Mastered 🎉", "✨");
    }

    setTimeout(() => this.nextCard(), 300);
  }
}

// ============================================================================
// 8. Quiz Engine Module
// ============================================================================

class QuizController {
  constructor() {
    this.activeQuestions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.timerInterval = null;
    this.secondsRemaining = 20;
    this.quizStartTime = null;
    this.userAnswers = []; // records question, picked option, correct option, isCorrect

    // Screens
    this.startView = document.getElementById("quiz-start-view");
    this.playView = document.getElementById("quiz-play-view");
    this.resultView = document.getElementById("quiz-result-view");

    // Setup elements
    this.topicSelect = document.getElementById("quiz-topic-select");
    this.availableCount = document.getElementById("quiz-available-count");
    this.timerToggle = document.getElementById("quiz-timer-toggle");
    this.shuffleToggle = document.getElementById("quiz-shuffle-toggle");
    this.startBtn = document.getElementById("start-quiz-btn");

    // Play elements
    this.currentNum = document.getElementById("quiz-current-num");
    this.totalNum = document.getElementById("quiz-total-num");
    this.timerBox = document.getElementById("quiz-timer-box");
    this.countdown = document.getElementById("quiz-countdown");
    this.liveScore = document.getElementById("quiz-current-score");
    this.barFill = document.getElementById("quiz-bar-fill");
    this.qCategory = document.getElementById("quiz-q-category");
    this.qTitle = document.getElementById("quiz-question-title");
    this.optionsContainer = document.getElementById("quiz-options-container");
    this.feedbackBanner = document.getElementById("quiz-feedback-banner");
    this.feedbackText = document.getElementById("quiz-feedback-text");
    this.nextQBtn = document.getElementById("quiz-next-q-btn");

    // Result elements
    this.resultScorePercent = document.getElementById("result-score-percent");
    this.resultCorrectRatio = document.getElementById("result-correct-ratio");
    this.resultTimeTaken = document.getElementById("result-time-taken");
    this.resultReviewList = document.getElementById("quiz-review-list");
    this.retryBtn = document.getElementById("quiz-retry-btn");
    this.returnHomeBtn = document.getElementById("quiz-return-home-btn");

    this.init();
  }

  init() {
    this.populateTopics();

    this.startBtn.addEventListener("click", () => this.startQuiz());
    this.nextQBtn.addEventListener("click", () => this.nextQuestion());
    this.retryBtn.addEventListener("click", () => this.startQuiz());
    this.returnHomeBtn.addEventListener("click", () => this.showStartView());

    this.topicSelect.addEventListener("change", () => {
      this.updateAvailableCount();
    });

    document.getElementById("create-quiz-q-btn").addEventListener("click", () => {
      openModal("modal-quiz");
    });
  }

  populateTopics() {
    const categories = [...new Set(appState.quizQuestions.map(q => q.category))];
    this.topicSelect.innerHTML = `<option value="all">All Topics (Mixed)</option>`;
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      this.topicSelect.appendChild(opt);
    });
    this.updateAvailableCount();
  }

  updateAvailableCount() {
    const topic = this.topicSelect.value;
    const count = topic === "all"
      ? appState.quizQuestions.length
      : appState.quizQuestions.filter(q => q.category === topic).length;
    this.availableCount.textContent = `${count} questions ready`;
  }

  startQuiz() {
    sounds.init();
    const topic = this.topicSelect.value;
    let questions = topic === "all"
      ? [...appState.quizQuestions]
      : appState.quizQuestions.filter(q => q.category === topic);

    if (questions.length === 0) {
      showToast("No questions available for this topic. Add one first!", "⚠️");
      return;
    }

    if (this.shuffleToggle.checked) {
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    }

    this.activeQuestions = questions;
    this.currentIndex = 0;
    this.score = 0;
    this.userAnswers = [];
    this.quizStartTime = Date.now();

    this.startView.style.display = "none";
    this.resultView.style.display = "none";
    this.playView.style.display = "block";

    this.totalNum.textContent = this.activeQuestions.length;
    this.liveScore.textContent = "0";

    this.renderQuestion();
  }

  renderQuestion() {
    clearInterval(this.timerInterval);
    const q = this.activeQuestions[this.currentIndex];

    this.currentNum.textContent = this.currentIndex + 1;
    this.qCategory.textContent = q.category;
    this.qTitle.textContent = q.question;
    this.feedbackBanner.style.display = "none";

    // Progress bar fill
    const progressPercent = ((this.currentIndex + 1) / this.activeQuestions.length) * 100;
    this.barFill.style.width = `${progressPercent}%`;

    // Render options
    this.optionsContainer.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    q.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option-btn";
      btn.innerHTML = `
        <span class="option-letter">${letters[idx] || (idx + 1)}</span>
        <span class="option-text">${this.escapeHTML(optText)}</span>
      `;
      btn.addEventListener("click", () => this.handleAnswerSelect(idx, btn));
      this.optionsContainer.appendChild(btn);
    });

    // 20-second timer handling
    if (this.timerToggle.checked) {
      this.timerBox.style.display = "flex";
      this.secondsRemaining = 20;
      this.countdown.textContent = this.secondsRemaining;

      this.timerInterval = setInterval(() => {
        this.secondsRemaining -= 1;
        this.countdown.textContent = this.secondsRemaining;

        if (this.secondsRemaining <= 0) {
          clearInterval(this.timerInterval);
          this.handleTimeout();
        }
      }, 1000);
    } else {
      this.timerBox.style.display = "none";
    }
  }

  handleAnswerSelect(selectedIndex, selectedBtn) {
    clearInterval(this.timerInterval);
    const q = this.activeQuestions[this.currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;

    // Disable all options
    const allBtns = this.optionsContainer.querySelectorAll(".quiz-option-btn");
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
      this.score += 100;
      this.liveScore.textContent = this.score;
      selectedBtn.classList.add("correct");
      sounds.playSuccess();
      this.feedbackText.innerHTML = `🎉 <strong>Correct!</strong> ${q.explanation || ""}`;
    } else {
      selectedBtn.classList.add("wrong");
      if (allBtns[q.correctIndex]) {
        allBtns[q.correctIndex].classList.add("correct");
      }
      sounds.playFail();
      this.feedbackText.innerHTML = `❌ <strong>Incorrect.</strong> The correct answer was <strong>${this.escapeHTML(q.options[q.correctIndex])}</strong>. ${q.explanation || ""}`;
    }

    this.userAnswers.push({
      question: q.question,
      userAnswer: q.options[selectedIndex],
      correctAnswer: q.options[q.correctIndex],
      isCorrect: isCorrect
    });

    this.feedbackBanner.style.display = "flex";
  }

  handleTimeout() {
    sounds.playFail();
    const q = this.activeQuestions[this.currentIndex];
    const allBtns = this.optionsContainer.querySelectorAll(".quiz-option-btn");
    allBtns.forEach(b => b.disabled = true);

    if (allBtns[q.correctIndex]) {
      allBtns[q.correctIndex].classList.add("correct");
    }

    this.userAnswers.push({
      question: q.question,
      userAnswer: "Timed out",
      correctAnswer: q.options[q.correctIndex],
      isCorrect: false
    });

    this.feedbackText.innerHTML = `⏰ <strong>Time's up!</strong> The correct answer was <strong>${this.escapeHTML(q.options[q.correctIndex])}</strong>.`;
    this.feedbackBanner.style.display = "flex";
  }

  nextQuestion() {
    this.currentIndex += 1;
    if (this.currentIndex < this.activeQuestions.length) {
      this.renderQuestion();
    } else {
      this.showResults();
    }
  }

  showResults() {
    clearInterval(this.timerInterval);
    this.playView.style.display = "none";
    this.resultView.style.display = "block";

    const total = this.activeQuestions.length;
    const correctCount = this.userAnswers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctCount / total) * 100);
    const durationSeconds = Math.round((Date.now() - this.quizStartTime) / 1000);

    this.resultScorePercent.textContent = `${percentage}%`;
    this.resultCorrectRatio.textContent = `${correctCount} / ${total}`;
    this.resultTimeTaken.textContent = `${durationSeconds}s`;

    const emojiElem = document.getElementById("result-emoji");
    const titleElem = document.getElementById("result-title");
    const subElem = document.getElementById("result-subtitle");

    if (percentage >= 80) {
      emojiElem.textContent = "🏆";
      titleElem.textContent = "Outstanding Performance!";
      subElem.textContent = "You've thoroughly mastered these concepts!";
      launchConfetti();
    } else if (percentage >= 50) {
      emojiElem.textContent = "👍";
      titleElem.textContent = "Solid Effort!";
      subElem.textContent = "Good understanding, keep reviewing the tricky ones.";
    } else {
      emojiElem.textContent = "🌱";
      titleElem.textContent = "Room for Growth";
      subElem.textContent = "Practice makes perfect. Flip through the flashcards and try again!";
    }

    // Build question breakdown
    this.resultReviewList.innerHTML = "";
    this.userAnswers.forEach((ans, i) => {
      const item = document.createElement("div");
      item.className = `review-item ${ans.isCorrect ? "was-correct" : ""}`;
      item.innerHTML = `
        <div class="review-q-title">Q${i + 1}: ${this.escapeHTML(ans.question)}</div>
        <div class="review-q-ans">
          ${ans.isCorrect
            ? `Your Answer: <span style="color:#34d399;">${this.escapeHTML(ans.userAnswer)}</span>`
            : `Your Answer: <span style="color:#f87171;">${this.escapeHTML(ans.userAnswer)}</span> | Correct: <span style="color:#34d399;">${this.escapeHTML(ans.correctAnswer)}</span>`
          }
        </div>
      `;
      this.resultReviewList.appendChild(item);
    });
  }

  showStartView() {
    this.resultView.style.display = "none";
    this.playView.style.display = "none";
    this.startView.style.display = "block";
    this.populateTopics();
  }

  escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

// ============================================================================
// 9. Manage Content & Settings Controller
// ============================================================================

class SettingsController {
  constructor() {
    this.form = document.getElementById("pomodoro-settings-form");
    this.workInput = document.getElementById("setting-work-time");
    this.shortBreakInput = document.getElementById("setting-short-break");
    this.longBreakInput = document.getElementById("setting-long-break");
    this.cyclesInput = document.getElementById("setting-cycles");
    this.autoBreakInput = document.getElementById("setting-auto-break");
    this.soundInput = document.getElementById("setting-sound-enabled");
    this.tickInput = document.getElementById("setting-tick-sound");
    this.resetTimerBtn = document.getElementById("btn-reset-timer-defaults");

    this.subtabCards = document.getElementById("subtab-cards-btn");
    this.subtabQuiz = document.getElementById("subtab-quiz-btn");
    this.panelCards = document.getElementById("panel-manage-cards");
    this.panelQuiz = document.getElementById("panel-manage-quiz");

    this.cardsTbody = document.getElementById("manage-cards-tbody");
    this.quizTbody = document.getElementById("manage-quiz-tbody");
    this.cardsBadge = document.getElementById("count-cards-badge");
    this.quizBadge = document.getElementById("count-quiz-badge");

    this.restoreBtn = document.getElementById("btn-restore-samples");
    this.exportBtn = document.getElementById("btn-export-data");
    this.importInput = document.getElementById("import-json-input");
    this.autoGenBtn = document.getElementById("btn-auto-gen-quiz");

    this.init();
  }

  init() {
    this.loadFormValues();

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      appState.settings.workTime = parseInt(this.workInput.value, 10) || 25;
      appState.settings.shortBreak = parseInt(this.shortBreakInput.value, 10) || 5;
      appState.settings.longBreak = parseInt(this.longBreakInput.value, 10) || 15;
      appState.settings.cycles = parseInt(this.cyclesInput.value, 10) || 4;
      appState.settings.autoBreak = this.autoBreakInput.checked;
      appState.settings.sound = this.soundInput.checked;
      appState.settings.tick = this.tickInput.checked;

      appState.save("sb_settings", appState.settings);
      pomodoro.totalCycles.textContent = appState.settings.cycles;
      pomodoro.setMode(pomodoro.mode);

      showToast("Timer settings saved successfully!", "💾");
    });

    this.resetTimerBtn.addEventListener("click", () => {
      appState.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      appState.save("sb_settings", appState.settings);
      this.loadFormValues();
      pomodoro.setMode("work");
      showToast("Settings reset to defaults", "🔄");
    });

    // Sub-tab toggles
    this.subtabCards.addEventListener("click", () => {
      this.subtabCards.classList.add("active");
      this.subtabQuiz.classList.remove("active");
      this.panelCards.style.display = "block";
      this.panelQuiz.style.display = "none";
    });

    this.subtabQuiz.addEventListener("click", () => {
      this.subtabQuiz.classList.add("active");
      this.subtabCards.classList.remove("active");
      this.panelQuiz.style.display = "block";
      this.panelCards.style.display = "none";
    });

    // Content management modal openers
    document.getElementById("open-add-card-modal-btn").addEventListener("click", () => {
      openCardModal();
    });

    document.getElementById("quick-add-card-btn").addEventListener("click", () => {
      openCardModal();
    });

    document.getElementById("open-add-quiz-modal-btn").addEventListener("click", () => {
      openQuizModal();
    });

    // Auto-convert cards to quiz
    this.autoGenBtn.addEventListener("click", () => {
      this.autoGenerateQuizzesFromCards();
    });

    // Export / Import
    this.exportBtn.addEventListener("click", () => this.exportData());
    this.importInput.addEventListener("change", (e) => this.importData(e));

    // Restore samples
    this.restoreBtn.addEventListener("click", () => {
      if (confirm("Restore all flashcards and quiz questions to factory defaults? Your custom items will be overwritten.")) {
        appState.flashcards = JSON.parse(JSON.stringify(DEFAULT_FLASHCARDS));
        appState.quizQuestions = JSON.parse(JSON.stringify(DEFAULT_QUIZ_QUESTIONS));
        appState.saveAll();
        flashcards.populateDeckSelect();
        flashcards.applyFilter();
        quiz.populateTopics();
        this.renderTables();
        showToast("Restored factory samples", "✨");
      }
    });

    this.renderTables();
  }

  loadFormValues() {
    this.workInput.value = appState.settings.workTime;
    this.shortBreakInput.value = appState.settings.shortBreak;
    this.longBreakInput.value = appState.settings.longBreak;
    this.cyclesInput.value = appState.settings.cycles;
    this.autoBreakInput.checked = appState.settings.autoBreak;
    this.soundInput.checked = appState.settings.sound;
    this.tickInput.checked = appState.settings.tick;
  }

  renderTables() {
    // Render Flashcards table
    this.cardsBadge.textContent = appState.flashcards.length;
    this.cardsTbody.innerHTML = "";
    appState.flashcards.forEach(card => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="category-tag">${this.escapeHTML(card.deck)}</span></td>
        <td><strong>${this.escapeHTML(card.front)}</strong></td>
        <td><span style="color:var(--text-muted);">${this.escapeHTML(card.back).substring(0, 75)}...</span></td>
        <td class="text-right">
          <button class="action-icon-btn edit-card-btn" title="Edit Card">✏️</button>
          <button class="action-icon-btn delete-btn delete-card-btn" title="Delete Card">🗑️</button>
        </td>
      `;

      tr.querySelector(".edit-card-btn").addEventListener("click", () => {
        openCardModal(card);
      });

      tr.querySelector(".delete-card-btn").addEventListener("click", () => {
        appState.flashcards = appState.flashcards.filter(c => c.id !== card.id);
        appState.save("sb_flashcards", appState.flashcards);
        flashcards.populateDeckSelect();
        flashcards.applyFilter();
        this.renderTables();
        showToast("Card deleted", "🗑️");
      });

      this.cardsTbody.appendChild(tr);
    });

    // Render Quiz Questions table
    this.quizBadge.textContent = appState.quizQuestions.length;
    this.quizTbody.innerHTML = "";
    appState.quizQuestions.forEach(q => {
      const tr = document.createElement("tr");
      const correctText = q.options[q.correctIndex] || "";
      tr.innerHTML = `
        <td><span class="category-tag">${this.escapeHTML(q.category)}</span></td>
        <td><strong>${this.escapeHTML(q.question)}</strong></td>
        <td><span style="color:#34d399;">${this.escapeHTML(correctText)}</span></td>
        <td class="text-right">
          <button class="action-icon-btn edit-quiz-btn" title="Edit Question">✏️</button>
          <button class="action-icon-btn delete-btn delete-quiz-btn" title="Delete Question">🗑️</button>
        </td>
      `;

      tr.querySelector(".edit-quiz-btn").addEventListener("click", () => {
        openQuizModal(q);
      });

      tr.querySelector(".delete-quiz-btn").addEventListener("click", () => {
        appState.quizQuestions = appState.quizQuestions.filter(item => item.id !== q.id);
        appState.save("sb_quizzes", appState.quizQuestions);
        quiz.populateTopics();
        this.renderTables();
        showToast("Quiz question deleted", "🗑️");
      });

      this.quizTbody.appendChild(tr);
    });
  }

  autoGenerateQuizzesFromCards() {
    if (appState.flashcards.length < 4) {
      showToast("Need at least 4 flashcards to auto-generate multiple choice quizzes!", "⚠️");
      return;
    }

    let addedCount = 0;
    appState.flashcards.forEach(card => {
      // Avoid duplicate question
      const exists = appState.quizQuestions.some(q => q.question === card.front);
      if (!exists) {
        // Collect 3 distractors from other flashcard answers
        const otherAnswers = appState.flashcards
          .filter(c => c.id !== card.id)
          .map(c => c.back);

        // Shuffle distractors
        for (let i = otherAnswers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [otherAnswers[i], otherAnswers[j]] = [otherAnswers[j], otherAnswers[i]];
        }

        const distractors = otherAnswers.slice(0, 3);
        const options = [card.back, ...distractors];

        // Shuffle choices and track correct index
        const correctText = card.back;
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }

        const correctIndex = options.indexOf(correctText);

        appState.quizQuestions.push({
          id: "quiz_gen_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
          category: card.deck,
          question: card.front,
          options: options,
          correctIndex: correctIndex,
          explanation: `Directly matches flashcard '${card.front}'.`
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      appState.save("sb_quizzes", appState.quizQuestions);
      quiz.populateTopics();
      this.renderTables();
      showToast(`Generated ${addedCount} new quiz questions!`, "🧠");
    } else {
      showToast("All flashcards are already converted to quiz questions!", "👍");
    }
  }

  exportData() {
    const data = {
      settings: appState.settings,
      flashcards: appState.flashcards,
      quizQuestions: appState.quizQuestions,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StudyBuddy_Export_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Study data exported!", "📦");
  }

  importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
          appState.flashcards = parsed.flashcards;
        }
        if (parsed.quizQuestions && Array.isArray(parsed.quizQuestions)) {
          appState.quizQuestions = parsed.quizQuestions;
        }
        if (parsed.settings) {
          appState.settings = { ...appState.settings, ...parsed.settings };
        }
        appState.saveAll();
        flashcards.populateDeckSelect();
        flashcards.applyFilter();
        quiz.populateTopics();
        this.renderTables();
        this.loadFormValues();
        showToast("Import successful!", "🎉");
      } catch (err) {
        showToast("Invalid JSON file", "❌");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

// ============================================================================
// 10. Modals Management (Add/Edit Flashcards & Quizzes)
// ============================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "flex";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}

// Flashcard Modal
function openCardModal(card = null) {
  const modal = document.getElementById("modal-card");
  const title = document.getElementById("modal-card-title");
  const editId = document.getElementById("card-edit-id");
  const deckInput = document.getElementById("card-input-deck");
  const frontInput = document.getElementById("card-input-front");
  const backInput = document.getElementById("card-input-back");
  const hintInput = document.getElementById("card-input-hint");

  // Populate datalist with existing decks
  const datalist = document.getElementById("deck-datalist");
  datalist.innerHTML = "";
  const existingDecks = [...new Set(appState.flashcards.map(c => c.deck))];
  existingDecks.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    datalist.appendChild(opt);
  });

  if (card) {
    title.textContent = "Edit Flashcard";
    editId.value = card.id;
    deckInput.value = card.deck;
    frontInput.value = card.front;
    backInput.value = card.back;
    hintInput.value = card.hint || "";
  } else {
    title.textContent = "Add New Flashcard";
    editId.value = "";
    deckInput.value = existingDecks[0] || "General";
    frontInput.value = "";
    backInput.value = "";
    hintInput.value = "";
  }

  modal.style.display = "flex";
  frontInput.focus();
}

// Flashcard Form Submit
document.getElementById("card-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const editId = document.getElementById("card-edit-id").value;
  const deck = document.getElementById("card-input-deck").value.trim();
  const front = document.getElementById("card-input-front").value.trim();
  const back = document.getElementById("card-input-back").value.trim();
  const hint = document.getElementById("card-input-hint").value.trim();

  if (editId) {
    const card = appState.flashcards.find(c => c.id === editId);
    if (card) {
      card.deck = deck;
      card.front = front;
      card.back = back;
      card.hint = hint;
    }
    showToast("Card updated", "✏️");
  } else {
    appState.flashcards.unshift({
      id: "card_" + Date.now(),
      deck,
      front,
      back,
      hint,
      starred: false,
      mastered: false
    });
    showToast("New card added!", "✨");
  }

  appState.save("sb_flashcards", appState.flashcards);
  flashcards.populateDeckSelect();
  flashcards.applyFilter();
  settings.renderTables();
  closeModal("modal-card");
});

// Quiz Modal
function openQuizModal(question = null) {
  const modal = document.getElementById("modal-quiz");
  const title = document.getElementById("modal-quiz-title");
  const editId = document.getElementById("quiz-edit-id");
  const catInput = document.getElementById("quiz-input-category");
  const qInput = document.getElementById("quiz-input-question");
  const expInput = document.getElementById("quiz-input-explanation");
  const radioChoices = document.querySelectorAll("input[name='correct-choice']");

  if (question) {
    title.textContent = "Edit Quiz Question";
    editId.value = question.id;
    catInput.value = question.category;
    qInput.value = question.question;
    expInput.value = question.explanation || "";

    question.options.forEach((opt, idx) => {
      const optElem = document.getElementById(`quiz-opt-${idx}`);
      if (optElem) optElem.value = opt;
    });

    radioChoices.forEach((r, idx) => {
      r.checked = idx === question.correctIndex;
    });
  } else {
    title.textContent = "Add Quiz Question";
    editId.value = "";
    catInput.value = "General Knowledge";
    qInput.value = "";
    expInput.value = "";
    for (let i = 0; i < 4; i++) {
      const optElem = document.getElementById(`quiz-opt-${i}`);
      if (optElem) optElem.value = "";
    }
    radioChoices[0].checked = true;
  }

  modal.style.display = "flex";
  qInput.focus();
}

// Quiz Form Submit
document.getElementById("quiz-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const editId = document.getElementById("quiz-edit-id").value;
  const category = document.getElementById("quiz-input-category").value.trim();
  const question = document.getElementById("quiz-input-question").value.trim();
  const explanation = document.getElementById("quiz-input-explanation").value.trim();

  const options = [];
  for (let i = 0; i < 4; i++) {
    options.push(document.getElementById(`quiz-opt-${i}`).value.trim());
  }

  let correctIndex = 0;
  document.querySelectorAll("input[name='correct-choice']").forEach((r, idx) => {
    if (r.checked) correctIndex = idx;
  });

  if (editId) {
    const q = appState.quizQuestions.find(item => item.id === editId);
    if (q) {
      q.category = category;
      q.question = question;
      q.options = options;
      q.correctIndex = correctIndex;
      q.explanation = explanation;
    }
    showToast("Quiz question updated", "✏️");
  } else {
    appState.quizQuestions.unshift({
      id: "quiz_" + Date.now(),
      category,
      question,
      options,
      correctIndex,
      explanation
    });
    showToast("New quiz question created!", "🧠");
  }

  appState.save("sb_quizzes", appState.quizQuestions);
  quiz.populateTopics();
  settings.renderTables();
  closeModal("modal-quiz");
});

// Modal close button handlers
document.querySelectorAll(".modal-close-btn, [data-close]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const modalId = btn.getAttribute("data-close") || btn.closest(".modal-backdrop").id;
    closeModal(modalId);
  });
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) {
    e.target.style.display = "none";
  }
});

// ============================================================================
// 11. Tab Navigation & Ambient Audio Button
// ============================================================================

function setupNavigation() {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".view-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = `tab-${tab.getAttribute("data-tab")}`;

      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });

  // Ambient Study Noise Button
  const ambientBtn = document.getElementById("toggle-ambient-btn");
  const ambientLabel = ambientBtn.querySelector(".ambient-label");

  ambientBtn.addEventListener("click", () => {
    const isPlaying = sounds.toggleAmbient();
    if (isPlaying) {
      ambientBtn.classList.add("active");
      ambientLabel.textContent = "Ambient: Rain 🌧️";
      showToast("Gentle rain & white noise started", "🌧️");
    } else {
      ambientBtn.classList.remove("active");
      ambientLabel.textContent = "Ambient: Off";
      showToast("Ambient sound stopped", "🔇");
    }
  });
}

// ============================================================================
// 12. App Bootstrap
// ============================================================================

let pomodoro, tasks, flashcards, quiz, settings;

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();

  pomodoro = new PomodoroController();
  tasks = new TasksController();
  flashcards = new FlashcardController();
  quiz = new QuizController();
  settings = new SettingsController();

  console.log("StudyBuddy application loaded successfully!");
});
