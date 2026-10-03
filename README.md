# 📚 StudyBuddy

> **A simple, focused study workspace designed to help students plan, focus, revise, and track their progress — all in one place.**

StudyBuddy is a lightweight, browser-based study companion that combines **Pomodoro sessions, study tasks, flashcards, quizzes, progress tracking, and ambient sounds** into a single distraction-free workspace.

It is designed for students who want to spend less time switching between productivity tools and more time actually studying.

---

## ✨ Features

### ⏱️ Pomodoro Focus Timer

* Customizable focus and break durations
* Configurable study cycles
* Visual progress tracking
* Automatic session transitions
* Study session statistics

### 📝 Study Tasks

* Create and manage study tasks
* Track completed and pending tasks
* Organize your current study session
* Keep your daily goals visible while studying

### 🧠 Flashcards

* Create and manage flashcard decks
* Flip cards for active recall
* Add hints to difficult cards
* Star important cards
* Track card mastery
* Filter cards while revising

### 🎯 Interactive Quizzes

* Generate quizzes from flashcard content
* Timed questions
* Multiple-choice answers
* Instant answer feedback
* Explanations for questions
* Final score and performance breakdown

### 📊 Study Statistics

Track your study activity through:

* Completed focus sessions
* Total focus time
* Study streaks
* Quiz performance
* Flashcard mastery

### 🌧️ Ambient Study Sounds

Study with built-in ambient audio generated directly in the browser.

Includes browser-generated sounds such as:

* Rain
* White noise
* Timer sounds

No external audio files are required.

### ⚙️ Customization

Customize your study experience through settings for:

* Focus duration
* Break duration
* Study cycles
* Sound preferences
* Study content

### 📦 Import & Export

Export your StudyBuddy data as JSON and import it again whenever needed.

This makes it easier to back up or move your study data without requiring an account.

---

## 🎨 Why StudyBuddy?

Students often use separate applications for:

**Tasks → Pomodoro → Flashcards → Quizzes → Progress tracking**

StudyBuddy brings these core study activities together:

```text
                 ┌──────────────────┐
                 │    StudyBuddy    │
                 └────────┬─────────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
   ⏱️ Focus            📝 Plan             🧠 Revise
   Pomodoro            Tasks              Flashcards
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                     🎯 Practice
                        Quizzes
                          │
                          ▼
                    📊 Track Progress
```

The goal is simple:

> **Open the app → choose what to study → start focusing.**

---

## 🛠️ Tech Stack

| Category     | Technology                   |
| ------------ | ---------------------------- |
| Frontend     | HTML5                        |
| Styling      | CSS3                         |
| Logic        | JavaScript                   |
| Storage      | Browser LocalStorage         |
| Audio        | Web Audio API                |
| Architecture | Client-side / Static Web App |

No backend or database is required.

---

## 🤖 AI / Open Innovation

StudyBuddy intentionally keeps its core functionality **independent of external AI APIs**.

The quiz-generation feature works locally by transforming existing flashcard content into practice questions using JavaScript logic.

This means:

* No API key required
* No external AI service dependency
* No server required
* Study data can remain in the browser
* The logic is completely open for developers to inspect and modify

The project can therefore be extended later with open-source or local AI models without making AI a requirement for the basic study experience.

---

## 🔐 Privacy First

StudyBuddy uses the browser's **LocalStorage** for its study data.

Your:

* Tasks
* Flashcards
* Study progress
* Settings
* Quiz-related data

can remain stored locally in your browser instead of being uploaded to a remote database.

There is also no mandatory account or backend required to use the application.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ankitkumar810/StudyBuddy.git
```

### 2. Open the project

```bash
cd StudyBuddy
```

### 3. Run the application

Because StudyBuddy is a client-side application, you can simply open:

```text
index.html
```

in your browser.

For a better development experience, you can also use a local static server such as VS Code Live Server.

---

## 📂 Project Structure

```text
StudyBuddy/
│
├── index.html
│
├── css/
│   └── ...
│
├── js/
│   ├── ...
│   ├── PomodoroController
│   ├── TasksController
│   ├── FlashcardController
│   ├── QuizController
│   ├── SettingsController
│   └── SoundEngine
│
└── README.md
```

> The exact structure may evolve as the project continues to grow.

---

## 🧩 How It Works

### 1. Plan

Create the tasks you want to complete during your study session.

### 2. Focus

Start a Pomodoro session and work without leaving the study workspace.

### 3. Revise

Use flashcards to actively recall concepts.

### 4. Practice

Turn your flashcards into quizzes and test your understanding.

### 5. Track

Review your study time, completed sessions, streaks, and learning progress.

---

## 🔄 Study Flow

```text
        📝 PLAN
           │
           ▼
      ⏱️ FOCUS
           │
           ▼
      🧠 REVISE
           │
           ▼
      🎯 PRACTICE
           │
           ▼
      📊 TRACK
           │
           └──────────────► Repeat
```

---

## 🌐 Demo

**GitHub Repository:**
https://github.com/ankitkumar810/StudyBuddy

> 🚧 Add your deployed URL here when available.

---

## 📸 Screenshots

Add screenshots of the main StudyBuddy interfaces here:

```text
screenshots/
├── dashboard.png
├── pomodoro.png
├── flashcards.png
├── quiz.png
└── statistics.png
```

Example:

```markdown
![StudyBuddy Dashboard](screenshots/dashboard.png)
```

---

## 🛣️ Future Improvements

Some possible future improvements include:

* [ ] Cloud synchronization
* [ ] User accounts
* [ ] More advanced study analytics
* [ ] Spaced-repetition scheduling
* [ ] More quiz types
* [ ] Mobile/PWA support
* [ ] Offline-first improvements
* [ ] Optional open-source/local AI integration
* [ ] More ambient sound environments
* [ ] Calendar-based study planning

---

## 🤝 Contributing

Contributions are welcome!

If you have an idea for improving StudyBuddy:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "feat: add your feature"
```

5. Push the branch

```bash
git push origin feature/your-feature
```

6. Open a Pull Request

---

## 💡 Hacktoberfest

StudyBuddy was built as a submission for the:

**Hacktoberfest Weekend Challenge — Build for a Friend 2026**

The project focuses on a simple idea:

> **Build something useful for someone you know, and make it easy for others to build on it too.**

---

## 📄 License

Add your preferred open-source license here.

For example:

```text
MIT License
```

---

## 👨‍💻 Author

**Ankit Kumar**

GitHub:
https://github.com/ankitkumar810

---

<p align="center">
  📚 <strong>Study smarter. Focus better. Keep learning.</strong> 🚀
</p>
