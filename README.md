# 📅 Wall Calendar

A high-fidelity, interactive page-flip wall calendar built with **Next.js 16**, **React 19**, and **react-pageflip**. Features realistic 3D page-turning animations, date range selection, per-date notes with localStorage persistence, and a fully responsive layout that adapts between portrait (mobile) and landscape (desktop) modes.

---

## ✨ Features

| Feature | Description |
|---|---|
| **3D Page Flip** | Physically realistic page-turn animation powered by `react-pageflip` with configurable swipe distance, flip speed, and shadow depth |
| **5-Year Span** | Browse 60 months of calendar pages (current year ± 2 years) without limits |
| **Date Range Selection** | Click a start date, hover to preview the range, then click an end date — with visual highlighting across the grid |
| **Notes System** | Add, view, and delete notes scoped to a specific day, date range, or entire month — all persisted to `localStorage` |
| **Monthly Themes** | Each month has a unique color accent, hero image, and scene name (e.g., *"Alpine Ascent"* for January, *"Forest Blaze"* for October) |
| **Responsive Layout** | Portrait mode on mobile (stacked hero + grid) · Landscape on desktop (side-by-side hero + grid) |
| **Spiral Binding** | Decorative spiral-binding element at the top for a realistic wall-calendar feel |
| **Premium Typography** | Playfair Display for headings and DM Sans for body text, served via `next/font` |

---

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Page Flip:** [react-pageflip](https://github.com/nickatnight/react-pageflip)
- **Language:** TypeScript 5
- **Fonts:** Playfair Display, DM Sans (Google Fonts via `next/font`)

---

## 📁 Project Structure

```
calendar/
├── app/
│   ├── layout.tsx          # Root layout — fonts, metadata
│   ├── page.tsx            # Home page — renders WallCalendar
│   └── globals.css         # Global styles
├── components/
│   └── Calendar/
│       ├── index.ts        # Barrel export
│       ├── WallCalendar.tsx # Main orchestrator — flipbook, layout, state
│       ├── HeroPage.tsx    # Full-bleed month photo with overlay & nav
│       ├── GridPage.tsx    # Calendar grid, range status bar, notes panel
│       ├── CalendarGrid.tsx# 7×6 day grid with range highlighting
│       ├── DayCell.tsx     # Individual day cell with hover/selection styles
│       ├── NotesPanel.tsx  # Note input, list, and delete UI
│       ├── RangeStatusBar.tsx # Shows active date range & clear button
│       └── SpiralBinding.tsx  # Decorative spiral binding rings
├── hooks/
│   ├── useCalendar.ts      # Date range selection & navigation state
│   └── useNotes.ts         # Notes CRUD with localStorage persistence
├── constants/
│   └── calendar.ts         # Month themes, weekday labels, storage key
├── types/
│   └── calendar.ts         # TypeScript interfaces (MonthTheme, Note, etc.)
├── utils/
│   └── dateUtils.ts        # Calendar grid builder, date formatting helpers
└── public/
    └── images/             # Monthly hero photographs (jan.jpg – dec.jpg)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd calendar

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the calendar.

### Production Build

```bash
npm run build
npm start
```

---

## 🎨 Monthly Themes

Each month is styled with a unique accent color and paired with a scenic hero image:

| Month | Accent | Scene |
|---|---|---|
| January | `#2563EB` 🔵 | Alpine Ascent |
| February | `#9333EA` 🟣 | Frozen Stillness |
| March | `#16A34A` 🟢 | First Bloom |
| April | `#0891B2` 🔷 | Spring Rain |
| May | `#65A30D` 🍀 | Meadow Hour |
| June | `#EA580C` 🟠 | Golden Solstice |
| July | `#DC2626` 🔴 | Peak Summer |
| August | `#D97706` 🟡 | Late Light |
| September | `#B45309` 🟤 | Amber Turn |
| October | `#C2410C` 🍂 | Forest Blaze |
| November | `#475569` ⚫ | Grey Quiet |
| December | `#0F172A` 🌑 | Year's End |

---

## 🗒 Notes System

Notes are scoped dynamically based on the current selection:

- **No selection →** notes are scoped to the entire month
- **Single date selected →** notes are scoped to that specific day
- **Date range selected →** notes are scoped to that exact range

All notes are persisted to `localStorage` under the key `wall-calendar-notes` and survive page refreshes.

---

## 📱 Responsive Behavior

| Viewport | Layout | Details |
|---|---|---|
| **< 880px** (mobile) | Portrait | Hero image on top, calendar grid below; full-width flipbook |
| **≥ 880px** (desktop) | Landscape | Hero image on the left, calendar grid on the right; fixed 840px width |

The layout automatically recalculates on window resize and remounts the flipbook to ensure correct page dimensions.

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## 📄 License

This project is private.
