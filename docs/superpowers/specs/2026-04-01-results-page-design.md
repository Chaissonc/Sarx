# Results Page Design

**Date:** 2026-04-01  
**Project:** fit — body metrics calculator

## Overview

Add an in-page results view to `index.html` that replaces the form on submit, displaying computed body stats around a body diagram image with connecting lines. No page navigation — a single-page transition hides the form and reveals the results panel.

## Layout

### Results Panel

- **Center:** male or female body image (`assets/maleBody_removed_bg.png` / `assets/femaleBody_removed_bg.png`), chosen based on the sex input
- **Stat cards** positioned around the image, connected to it via CSS lines/borders:
  - BMI (top-left or top-right)
  - Body Fat % (left or right)
  - Ideal Weight (left or right)
  - TDEE (bottom-left or bottom-right)
  - BMR (bottom-left or bottom-right)
- **Bottom strip:** read-only summary of user inputs — age, height, weight, sex, activity level
- **Back button:** returns the user to the form view (re-shows form, hides results)

## Transition

- On submit, the form panel fades/slides out and the results panel fades/slides in
- On back, the results panel fades/slides out and the form panel fades/slides in
- CSS transitions handle the animation (opacity + transform)

## Calculations

All computed in `script.js` using existing inputs:

| Stat | Formula |
|------|---------|
| BMR | Mifflin-St Jeor: `(10 × weightKg) + (6.25 × heightCm) − (5 × age) + 5` (male) or `− 161` (female) |
| TDEE | `BMR × activityFactor` |
| BMI | `weightKg / (heightM²)` |
| Body Fat % | BMI-based: `(1.2 × BMI) + (0.23 × age) − (10.8 × sexFactor) − 5.4` — sexFactor is 1 for male, 0 for female |
| Ideal Weight | Devine formula: `50 + 2.3 × (inchesOver5ft)` kg (male), `45.5 + 2.3 × (inchesOver5ft)` kg (female), converted to lbs |

## Files Changed

### `index.html`
- Add a `#results` panel alongside the existing `.statFourm` form panel
- Results panel contains: body image, stat cards, input summary strip, back button

### `script.js`
- Add body fat % and ideal weight calculations
- On submit: validate inputs, compute all stats, populate results panel, trigger transition
- On back: reverse transition
- Fix existing broken input validation (currently references undefined `inputWeightweight`)

### `style.css`
- Results panel layout using flexbox or grid
- Stat card styles (consistent with existing card aesthetic)
- Connecting line styles (CSS borders or pseudo-elements)
- Transition animations (opacity + transform)
- Hide/show classes for form and results panels

## Constraints

- No external dependencies — plain HTML/CSS/JS only
- Must work on mobile (existing responsive breakpoint at 480px)
- Uses existing body image assets
