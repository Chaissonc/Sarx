# Sarx

**Know your body.**

A personal wellness hub — not a fitness app. Enter your stats once and get a full picture of your health: what your numbers mean, where your goals should be, and the knowledge to back it up.

**[Live Now→](https://sarx.app)**

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

### Plan
Set a goal, get a real plan.
- Enter a target weight — Cut / Maintain / Lean Bulk auto-selects based on direction
- Choose your aggression level
- Outputs: daily calorie target, macro split (protein / carbs / fat), and estimated time to goal

### Learn
Wellness education, evidence-tiered item by item. The knowledge you need to make your numbers mean something — not just tracking, but understanding.

18 items and counting, spanning:
- Supplements (creatine, magnesium, D3+K2, fish oil, whey, zinc, ashwagandha, caffeine)
- Daily targets (protein, fiber, water)
- Gut health, circadian rhythm, electrolytes, progressive overload, workout essentials
- Trend warnings on popular but weakly-evidenced claims (e.g. apple cider vinegar)

Each item is evidence-tiered (High / Medium / Trend) with dosage and timing where relevant.

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
Body-Metric/            # repo folder name; product is Sarx
├── index.html          # Onboarding form — age, weight, height, sex, activity
├── style.css            # Global styles
├── js/                   # Onboarding logic, side drawer, PWA install
├── healthindex/         # Health Index — BMI, TDEE/BMR, body fat, weight bar, Focus Cards
├── plan/                # Goal planner — target weight, macros, time-to-goal
├── learning/            # Learn tab — 18 evidence-tiered items, data-driven
├── scripts/              # generate_pages.js — builds learning pages from learning/items.js
└── assets/              # Logo, icon, favicon
```

---

## Roadmap

### Done — Phase 1 (Web App)
- [x] Health Index — BMI, TDEE, BMR, body fat %, weight range, Focus Cards
- [x] Goal planner — Cut / Maintain / Lean Bulk, macros, time-to-goal
- [x] Persistent profile via localStorage
- [x] Learn tab — 18-item evidence-tiered wellness library

### Next — Phase 2 (Supabase)
- [ ] **Accounts & cross-device sync** — Supabase auth + Postgres, real accounts, profile persists across devices
- [ ] **AI Coach** — floating, context-aware assistant wired to the Claude API, built after accounts ship

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

Or just hit the [live site](https://sarx.app).

---

## License

MIT
