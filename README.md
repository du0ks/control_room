# Cockpit

A Matrix-inspired, offline-first PWA for daily/weekly/monthly/quarterly planning + anxiety "Calm Mode". Built with Next.js, TypeScript, Tailwind CSS, and Dexie (IndexedDB).

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

| Section | Description |
|---------|-------------|
| **Cockpit** | Dashboard with today/week/month/quarter panels, focus tracker, anxiety mini panel |
| **Plans** | Week/Month/Quarter views — manage focus items and outcomes |
| **Actions** | Quick capture + daily execution list with scope filters |
| **Parking Lot** | Parking lot with tags, search, archive, and review mode |
| **Calm Mode** | Emergency overlay with calming messages, anxiety score tracking |
| **Settings** | Scanlines, reduce motion, keyboard shortcuts |

## Keyboard Shortcuts

- `n` — New task (opens quick add modal)
- `/` — Focus search in Parking Lot
- `Esc` — Close modal or exit Emergency Mode
- `→` / `Space` — Next message in Emergency Mode
- `←` — Previous message in Emergency Mode

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** — strict typing throughout
- **Tailwind CSS v4** — Matrix-inspired theme tokens
- **Dexie** (IndexedDB) — offline-first local storage
- **next-pwa** — service worker + manifest for installability

## Architecture

```
src/
├── app/              # Pages (App Router)
├── components/
│   ├── ui/           # Reusable: Panel, Button, Input, Tabs, Modal, Toast, Tag, ListItem
│   └── layout/       # Sidebar, BottomNav, AppShell
├── lib/
│   ├── db/           # Dexie schema + seed data
│   ├── models/       # TypeScript interfaces
│   ├── repositories/ # Repository interfaces + Dexie implementations
│   └── utils/        # ID generation, date helpers
```

### Firebase-Ready Architecture

The app uses **repository interfaces** to abstract data access:

```
ITaskRepository → DexieTaskRepository (current)
                → FirebaseTaskRepository (future)
```

To add Firebase:
1. Create Firebase repository implementations (e.g., `FirebaseTaskRepository`)
2. Implement the same interfaces defined in `src/lib/repositories/interfaces.ts`
3. Add a repository factory that switches based on auth state
4. Add Firebase config + auth provider
5. All UI code remains unchanged — only the data layer swaps

## PWA

- Install from browser ("Add to Home Screen")
- Works offline — all data stored in IndexedDB
- Service worker handles caching (enabled in production builds)

## Build for Production

```bash
npm run build
npm start
```

## Data Model

- **Task** — scoped to today/week/month/quarter/someday
- **Objective** — week/month/quarter outcomes
- **ParkingLotItem** — parking lot with tags
- **AnxietyLog** — daily score + thought/body/notes
- **CalmMessage** — calming messages with pin + tags
- **Category** — task categories with icons
- **UserSettings** — display preferences
