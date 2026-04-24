# Sarx

**Know your body.**

A personal wellness hub — not a fitness app. Enter your stats once and get a full picture of your health: what your numbers mean, where your goals should be, and the knowledge to back it up.

**[Live Demo →](https://chaissonc.github.io/Body-Metric/)**

---

## What's Inside

Sarx is a multi-page web app with a persistent profile and a bottom tab nav.

### Health Index
Your core metrics at a glance.
- **BMI** — with healthy range indicator
- **Body Fat %** — estimated via Deurenberg formula, visualized on a gradient bar (Athletic → Healthy → Obese)
- **BMR** — calories burned at rest (Mifflin-St Jeor)
- **TDEE** — total daily burn based on activity level
- **Weight range** — where you fall on the healthy weight spectrum

### Objective
Set a goal, get a real plan.
- Enter a target weight — Cut / Maintain / Lean Bulk auto-selects based on direction
- Choose your aggression level
- Outputs: daily calorie target, macro split (protein / carbs / fat), and estimated time to goal

### Learn *(coming soon)*
Wellness education, topic by topic. The knowledge you need to make your numbers mean something — not just tracking, but understanding.

Topics dropping soon:
- Gut Health & Microbiome
- Supplements That Actually Work
- Workout Foundations
- Fiber & Nutrition Basics
- Sleep & Recovery
- Hydration

> **Beta notice:** Sarx is currently in beta. UI, features, and content are actively evolving. Feedback shapes what comes next.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 |
| Logic | Vanilla JavaScript |
| Storage | localStorage |
| Hosting | GitHub Pages |

No frameworks, no dependencies, no build step.

---

## Project Structure

```
Body-Metric/
├── index.html          # Onboarding form — age, weight, height, sex, activity
├── healthindex/        # Health Index — BMI, TDEE/BMR, body fat, weight bar
├── objective/          # Goal planner — target weight, macros, time-to-goal
├── learning/           # Learn tab — topic cards (content in progress)
├── script.js           # Shared calc logic
├── style.css           # Global styles
└── assets/             # Logo, icon, favicon
```

---

## Roadmap

### Now — Phase 1 (Web App)
- [x] Health Index — BMI, TDEE, BMR, body fat %, weight range
- [x] Goal planner — Cut / Maintain / Lean Bulk, macros, time-to-goal
- [x] Persistent profile via localStorage
- [ ] **Learn tab** — full wellness education content
- [ ] **AI Coach** — floating, context-aware assistant wired to the Claude API

### Next — Phase 2 (Backend)
- [ ] Node.js + Express + PostgreSQL
- [ ] Real accounts and persistent profiles
- [ ] Deploy on Render / Railway

### Later — Phase 3 & 4 (Mobile)
- [ ] Capacitor wrap → App Store v1
- [ ] SwiftUI rebuild → full native iOS launch

---

## Getting Started

```bash
git clone https://github.com/Chaissonc/Body-Metric.git
cd Body-Metric
open index.html
```

Or just hit the [live site](https://chaissonc.github.io/Body-Metric/).

---

## License

MIT
