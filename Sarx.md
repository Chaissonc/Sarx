# Sarx

**"Know your body."**
Wellness hub — not a fitness app. For everyone. No gym required.

**Status:** 🟢 Live — Phase 1 (Web App / PWA), in content/SEO maintenance mode
**Version:** v9.3
**Repo:** `~/Github/Body-Metric` (repo folder is named `Body-Metric`, product is `Sarx`)
**Live:** sarx.app
**Last commit:** Jun 13, 2026 — paused since to focus on CS 302 / JS fundamentals per [[Career/Career Plan V1]]

---

## Positioning

Wellness, not fitness. Broad audience — someone checking their BMI for the first time, a college student tracking calories, someone recovering from injury. Bold and confident without being "bro-y." Every tool is designed to give context, not just a number.

---

## Where This Sits in the Career Plan

[[Career/Career Plan V1]] schedules Sarx work in two places, and they're not adjacent:
- **Now (Phase 0–1, through Aug 2026):** not on the plan at all — priority is CS 302 and JS fundamentals (fCC cert + HiLo solo build).
- **Sep–Nov 2026 (Phase 2):** still not Sarx — Urtax backend, written solo, is the project where backend skill actually gets built.
- **Apr–May 2027 (Phase 4):** Sarx Phase 2 is scheduled here, after TypeScript/React — split into **2a: Accounts & cross-device sync** (the headline feature, do this) and **2b: AI Coach** (separate, only if 2a leaves room).

**Why the gap matters:** Sarx's HTML/CSS/JS was built with heavy Claude assistance — it's a working reference, not proof of independent backend skill. Urtax is deliberately the project where "I write every line." Pulling Supabase/AI Coach forward into Sarx now would jump that sequencing without the payoff (no backend reps gained, since it'd likely go the same assisted route).

**Current mode: low-lift content/SEO growth, no backend/auth work until spring 2027**, unless something concrete changes this calculus (e.g. real user traction that justifies accounts sooner). Revisit this note when Career Plan Phase 4 starts.

---

## Roadmap

### Shipped — Phase 1 core (Web App / PWA)
- [x] Health Index — BMI, TDEE, BMR, body fat %, weight range with gradient bars
- [x] Plan page — Cut / Maintain / Lean Bulk, aggression level, daily kcal, macros, time-to-goal, diet style
- [x] Learning Library — evidence-ranked cards and filters
- [x] Persistent profile via localStorage
- [x] PWA — installable on iOS and Android home screen
- [x] Side drawer menu, About page, Updates page

### Shipped — since v8.6 (not yet reflected anywhere but git log)
- [x] **Focus Cards** (May 2025 per in-app Updates page) — tap any Health Index metric for a detail breakdown: BMI gradient range bar, TDEE resting/activity split, BMR hour-by-hour burn
- [x] **Learn page overhaul** — rebuilt from hand-written topic pages into a data-driven system: `learning/items.js` holds all item data, `learning/item/` is a shared detail-page template, `scripts/generate_pages.js` generates static pages + sitemap entries from the data. Library grew from 6 broad topics to **18 individual evidence-tiered items** (protein target, fiber target, water target, creatine, magnesium, D3+K2, fish oil, whey, zinc, ashwagandha, caffeine, gut health, circadian rhythm, electrolytes, progressive overload, workout essentials, ACV trend-warning, etc.)
- [x] **SEO / AI-crawlability push** — `llms.txt`, expanded `sitemap.xml`, `robots.txt`, an SEO audit that was completed and its scratch file removed
- [x] Renamed `goal/` → `plan/` for clarity

### Still open (unscheduled until spring 2027 — see above)
- [ ] User Accounts — sync across devices, listed as "Coming Soon" — **this is Phase 2a, the headline feature**
- [ ] AI Coach — context-aware, wired to Claude API, listed as "Coming Soon" — **Phase 2b, separate and later**

### Phase 2a — Accounts & Cross-Device Sync (target: Apr 2027)
The actual product value here: your profile and plan are always there, on any device, no re-onboarding. Originally scoped as "plumbing for AI Coach" — reframed 2026-08-11 as a complete, shippable feature in its own right, decoupled from the coach. Est. **~32–53 hrs** (see magnified breakdown below).
- [ ] Supabase project setup (auth, database)
- [ ] Auth UI — sign up / login pages
- [ ] `profiles` table — migrate all `bm_*` localStorage keys to per-user DB rows
- [ ] Swap every `localStorage.getItem/setItem` → async Supabase reads/writes
- [ ] Loading states + error handling across all pages
- [ ] Row Level Security policies (users can only read their own data)

### Phase 2b — AI Coach (target: May 2027 or later — do not start until 2a ships)
Deliberately separate from 2a. If Apr–May 2027 window runs tight after 2a, this is the piece that slips first — it's additive, not required for accounts to be useful. Est. **~18–28 hrs**.
- [ ] Supabase Edge Function — proxies Anthropic API call (hides key)
- [ ] AI Coach UI — chat interface wired to Edge Function, injects user metrics as context

### Phase 3 — Capacitor Wrap
- [ ] Package web app into iOS shell
- [ ] Submit to App Store — soft launch

### Phase 4 — SwiftUI Rebuild
- [ ] Full native iOS app
- [ ] Indistinguishable from Apple Health
- [ ] Proper App Store presence and growth

---

## Pages

| Page | Path | Notes |
|------|------|-------|
| Onboarding | `index.html` | Intake form — age, weight, height, sex, activity. Calculates BMI/TDEE/BMR/body fat, saves to localStorage. Redirects returning users directly to healthindex. |
| Health Index | `healthindex/` | BMI card, swipeable TDEE↔BMR card, body fat % gradient bar, weight gradient bar. Tap any metric to open a Focus Card with a deeper breakdown. |
| Plan | `plan/` | Target weight → auto-selects Cut/Maintain/Bulk. Aggression level (Slow/Moderate/Aggressive). Daily kcal input, deficit/surplus label, macro breakdown, time-to-goal estimate with projected date. |
| Learn | `learning/` | Grid of 18 individually evidence-tiered items, filterable by category/evidence. Each links to `learning/item/?id=...`, a shared template rendering that item's data from `items.js`. |
| About | `about/` | Why Sarx Exists, The Problem, The Science (formula pills). |
| Updates | `updates/` | New features (with date) and coming soon features (AI Coach, User Accounts), sorted nearest-first. |

---

## Content Pipeline (new since v8.6)

- All Learning Library content lives as data in `learning/items.js` (one object per item: id, title, emoji, topic, evidence tier, dosage, timing, description).
- `scripts/generate_pages.js` (Node, run manually) reads that data and generates each item's static detail page plus updates `sitemap.xml` — this is how the library scaled from 6 to 18 items without hand-writing HTML each time.
- This is the fastest lever to grow the site right now: adding a new item to `items.js` + re-running the generator is a content-only change, no backend needed, and directly extends the SEO/AI-crawlability investment (`llms.txt`, sitemap).

---

## Design System

- **Font:** DM Sans only (400, 500, 600, 700, 800)
- **Background:** `#fafafa` (page), `#fff` (cards)
- **Red accent:** `#CC2325` (primary UI) / `#E8192C` (about page, evidence labels, PWA theme color)
- **Style:** Ultra minimal, iOS 17 / Apple HIG feel. No gradients on UI. White cards on off-white background. Strong red on white contrast.
- **Logo:** sarx wordmark (`assets/logo.png`), red favicon (`assets/favicon.png`), home screen icon (`assets/icon.png`), `assets/socialImage.png` for link previews

---

## File Structure

```
Body-Metric/                # repo folder name; product name is Sarx
├── index.html               # Onboarding / intake form
├── style.css                # Shared styles for all pages
├── manifest.json            # PWA manifest
├── robots.txt, sitemap.xml, llms.txt, 404.html, CNAME
├── js/
│   ├── script.js            # Intake form logic + all health calculations
│   ├── menu.js               # Side drawer open/close + PWA install prompt
│   └── pwa.js                # iOS standalone link interception
├── healthindex/
│   ├── index.html
│   ├── style.css
│   └── healthindex.js        # Reads localStorage, renders metrics, Focus Cards
├── plan/                     # (renamed from goal/)
│   ├── index.html
│   ├── style.css
│   └── goal.js                # Plan logic — goal select, calorie calc, macros, time-to-goal
├── learning/
│   ├── index.html
│   ├── style.css
│   ├── learning.js           # Topic list render + category filter
│   ├── items.js               # Single source of truth for all 18 learning items
│   ├── item/                  # Shared detail-page template (index.html, item.js, item.css)
│   └── [item-slug]/           # 18 generated static pages, one per item
├── about/
│   ├── index.html
│   └── style.css
├── updates/
│   ├── index.html
│   └── style.css
├── scripts/
│   └── generate_pages.js      # Generates learning item pages + sitemap from items.js
└── assets/                    # logo, favicon, icon, socialImage
```

---

## Key Technical Decisions

- **All localStorage keys prefixed `bm_`** — age, weight, heightFt, heightIn, sex, activity, bmi, bmiCat, bmr, tdee, bodyfat, idealMin, idealMax, minWeight, status, goal, intensity, diet, targetCal, goalWeight
- **Formulas used:** Mifflin-St Jeor (BMR), Harris-Benedict multipliers (TDEE), Deurenberg (body fat estimate), Devine (ideal body weight)
- **PWA:** manifest.json at root, standalone display-mode, safe-area-inset handling for Dynamic Island
- **No build tools, no frameworks** — vanilla HTML/CSS/JS, GitHub Pages deploy. The one exception is `scripts/generate_pages.js`, a manually-run Node script (not a build step in the deploy path) used to scale learning content.
- **Content-as-data pattern** — the learning library is the one place in the app that isn't hand-authored per-page; new items are data entries, not new files written by hand.

---

## Phase 2 Kickoff Plan (reference only — do not start before Career Plan Phase 4, ~Apr 2027)

**Scope check (2026-08-11):** the codebase today has **65 raw `localStorage.getItem/setItem` calls across 6 files** (`js/script.js` 22, `healthindex/healthindex.js` 18, `plan/goal.js` 15, `learning/learning.js` + `learning/item/item.js` 6, `scripts/generate_pages.js` 4), touching 20 distinct `bm_*` keys, with **zero existing helper abstraction**. "Migrate to Supabase" means touching every one of those 65 sites, converting sync reads to `await`, and replacing every page's "assume data is there instantly on load" pattern (e.g. `healthindex.js` redirects home immediately `if (!bmi)`) with an actual loading state. This is a real refactor, not a swap — budget for it accordingly, don't compress it into a weekend.

### Phase 2a — Session 1: Supabase Foundation (~12–18 hrs)
- Create Supabase project, install SDK (1–2 hrs)
- Design `profiles` table (`user_id, age, weight, height_ft, height_in, sex, activity, bmi, bmi_cat, bmr, tdee, body_fat, ideal_min, ideal_max, min_weight, status, goal, intensity, diet, target_cal, goal_weight`) + RLS policy — new territory, first time writing row-level auth logic (3–5 hrs)
- Signup/login UI + Supabase auth wiring (5–8 hrs)
- Gate app entry, redirect logic (2–3 hrs)

### Phase 2a — Session 2: localStorage → Supabase migration (~20–35 hrs, the sleeper)
- Abstract reads/writes into `getProfile`/`saveProfile` helpers (3–5 hrs)
- Migrate `script.js`'s 22 calls — onboarding + calc logic (5–8 hrs)
- Migrate `healthindex.js`'s 18 calls + add loading state (4–6 hrs)
- Migrate `goal.js`'s 15 calls + add loading state (4–6 hrs)
- Migrate `learning.js`/`item.js`'s 6 calls — lighter (2–3 hrs)
- End-to-end retest of every page (3–5 hrs)
- Keep localStorage as a local cache alongside Supabase for instant feel

**Phase 2a total: ~32–53 hrs.** Ships as a complete feature on its own — accounts, cross-device sync, done.

### Phase 2b — AI Coach (~18–28 hrs, separate effort, do not start until 2a ships)
- Edge Function scaffolding on Deno runtime — also new territory (4–6 hrs)
- System prompt design + calling Claude Haiku from the function (2–4 hrs)
- **Streaming response handling (SSE)** — this is squarely the async-JS gap the Career Plan flags as weak; consider shipping non-streaming (spinner, not stream) for v1 to cut ~6–8 hrs and defer streaming as a later polish pass (4–8 hrs full version)
- Chat UI — floating button, slide-up panel, message thread, wired to live profile (6–8 hrs)
- Edge-case testing — rate limits, error states, empty profile (2–4 hrs)

### Cost Estimate
- Supabase free tier (50k MAU, 500MB DB, 500k edge function calls) + Claude Haiku (~$0.003/turn, <$5/mo at current scale) = **~$0/month to start**.

### Budget reality
Career Plan Phase 4 (Apr 1 – May 31, 2027) is ~8.5 weeks at 10–15 hrs/week school-year pace = **~85–130 hrs total**, and that window is shared with "full stack integration, testing" generally — not exclusive to Sarx. Phase 2a alone (~32–53 hrs) fits comfortably. Phase 2a + 2b together (~50–81 hrs) can crowd out the rest of what Phase 4 is for — if the window is tight when it arrives, ship 2a and let 2b slip to Phase 5/summer or its own later slot rather than compressing it.

---

## Future Feature Ideas (unscheduled — no backend needed, could ship anytime)

Brainstormed 2026-08-11 while scoping Phase 2. Rejected trend/history tracking as the next feature — a phone's built-in Health app already owns that, and Sarx's edge per its own positioning is *"give context, not just a number,"* not tracking. These three lean into interpretation instead, reuse what's already built, and don't require Supabase/accounts — any of them could be picked up during the current content/SEO maintenance window if a good burst of energy shows up:

- **Personalized Action Plan** — a "what to actually do" panel that reads your Health Index + Plan numbers and surfaces a ranked top-3 checklist pulled from the 18 Learning Library items already written (e.g. "your fiber target isn't being hit at your calorie level → here's your #1 lever"). Turns the content library into active recommendation. Reuses `items.js`, no new data model.
- **Deepen Focus Cards** — Focus Cards currently show *what* a number is (gradient bar, breakdown). Add *so what*: e.g. the body fat % card says what's realistic at your stats and links straight to the 1–2 Learning items that move it fastest. Extends something already shipped rather than adding a new page.
- **Sample day of eating** — the Plan page already outputs a calorie target + macro split + diet style; turn that into a concrete "here's roughly what a day looks like" meal template. Bridges the common real gap between "here's your macros" and "I don't know what to actually eat." Similar-sized content effort to the Learning Library build.

---

## Notes

- Wellness not fitness — broader and stickier market
- Wrap with Capacitor first for App Store v1, then SwiftUI rebuild for the real launch
- Sarx + Urtax together = strong portfolio piece by graduation
- Vault note had drifted two minor versions and a full roadmap phase behind the repo (last synced at v8.6; repo was at v9.3) — reorganized 2026-08-11 to match actual shipped state and reconcile the roadmap with [[Career/Career Plan V1]] sequencing
