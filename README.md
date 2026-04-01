# Body Metric

A lightweight, client-side body metrics calculator built with vanilla HTML, CSS, and JavaScript. Enter your age, height, weight, sex, and activity level to instantly get a personalized breakdown of your key health numbers.

**[Live Demo →](https://chaissonc.github.io/Body-Metric/)**

---

## Features

- **BMI** – Body Mass Index with healthy range indicator
- **Body Fat %** – Estimated from BMI and age
- **BMR** – Basal Metabolic Rate (calories burned at rest)
- **TDEE** – Total Daily Energy Expenditure based on activity level
- **Ideal Weight** – Healthy weight range via the Devine formula
- Responsive two-screen layout: input form → results card
- Visual body diagram alongside metric readouts
- Plain-English explanations for every metric

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 |
| Logic | Vanilla JavaScript |
| Hosting | GitHub Pages |

No frameworks, no dependencies, no build step.

## Getting Started

```bash
git clone https://github.com/Chaissonc/Body-Metric.git
cd Body-Metric
# Open index.html in your browser
open index.html
```

Or just visit the [live site](https://chaissonc.github.io/Body-Metric/).

## Project Structure

```
Body-Metric/
├── index.html      # App markup and layout
├── style.css       # Styling and responsive design
├── script.js       # Metric calculations and UI logic
└── assets/         # Images (body diagram, etc.)
```

## Metrics & Formulas

| Metric | Formula |
|--------|---------|
| BMI | `weight (kg) / height (m)²` |
| Body Fat % | Deurenberg formula (BMI, age, sex) |
| BMR | Mifflin-St Jeor equation |
| TDEE | `BMR × activity multiplier` |
| Ideal Weight | Devine formula |

## Roadmap

- [ ] Imperial / metric unit toggle
- [ ] Macro calculator based on TDEE and goal (cut/maintain/bulk)
- [ ] Local storage to persist user data between sessions
- [ ] Dark mode

## License

MIT
