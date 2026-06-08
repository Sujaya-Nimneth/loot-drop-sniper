# 🎯 Loot Drop Sniper

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.0-magenta?style=for-the-badge&logo=framer)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-yellow?style=for-the-badge)

**Loot Drop Sniper** is a lightning-fast, mobile-first web game built with React, Next.js, and Framer Motion. Featuring a high-energy neon esports aesthetic, players must tap falling supply crates to score points while dodging lag spikes. It features a robust headless simulation engine to ensure a locked 60fps experience.

---

## 🎮 Gameplay Mechanics

- **Supply Crates (+10 Points):** Tap these glowing cyan crates to score. If a crate hits the bottom of the screen un-tapped, you lose a life!
- **Lag Spikes (-15 Points):** Avoid tapping these pulsating red stars. Tapping them causes a violent screen shake, red flash, and point deduction. They are harmless if they fall past the screen.
- **Speed Ramping:** The game speeds up by 5% every 30 seconds.
- **Lives:** You start with 3 lives. Lose them all, and it's game over.
- **Victory Condition:** Reach 500 points to unlock the special Victory Screen and claim your (mock) rewards!

## ⚡ Technical Architecture

Loot Drop Sniper separates the game logic from the React render cycle to achieve maximum performance and avoid frame drops:

### Headless Zustand Engine
- **Fixed-Step Loop:** A `requestAnimationFrame` loop accumulates wall-clock time and executes discrete, fixed `1/60s` simulation ticks entirely outside of React.
- **State Management:** Uses a vanilla Zustand store (`createStore`) to track all entity positions, physics, and velocities. 
- **View Layer Bridge:** The store bumps an `entityVersion` integer on each tick. React components subscribe to this single integer, pulling the latest entity array on render.

### DOM-Based Rendering & Framer Motion
- Instead of using a traditional HTML5 `<canvas>`, the game leverages DOM elements animated by **Framer Motion**.
- `AnimatePresence` manages smooth spring mounting and exit scaling for all entities.
- Tap visual effects (particle bursts, floating scores, screen shakes) are driven by a queue of `TapEffects` emitted by the headless engine.

### Visual Aesthetic
- A custom, mobile-first **Dark Mode Esports UI**.
- Uses Tailwind CSS v4's inline theme variables for a rich neon palette (Cyan, Magenta, Amber, Red).
- Custom keyframe animations for scanlines, arena grids, screen-shakes, and pulsating entity glows.

## 🚀 Features

- **Dual End Screens:**
  - *Failed:* Red-tinted glitch screen if you score below 500 points.
  - *Victory:* Golden trophy screen with an interactive mock form to claim a "Dialog Gaming Data Bundle" if you score 500+.
- **Persistent Leaderboard:** A `localStorage`-backed leaderboard tracks the top 5 all-time high scores across sessions.
- **Glassmorphic HUD:** A sticky top bar displaying current lives (SVG hearts), score, high score, timer, and current speed tier multiplier.
- **Touch-Optimized:** `touch-action: manipulation` and generous tap hit-padding ensures it plays beautifully on mobile devices.

## 🛠️ Local Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to play the game. For the best experience, open your browser's Developer Tools and switch to a mobile device view (e.g., iPhone 14 Pro).

## 📁 Directory Structure

- `/src/engine`: The headless game engine.
  - `store.ts`: The core Zustand logic and state mutations.
  - `loop.ts`: The `requestAnimationFrame` fixed-step runner.
  - `constants.ts`: Physics parameters, spawn rates, and scoring values.
  - `types.ts`: Interface definitions.
- `/src/components`: React view-layer elements.
  - `GameArena.tsx`: The main play area, handling entity rendering and tap events.
  - `HUD.tsx`: The top navigation bar.
  - `MainMenu.tsx` & `GameOver.tsx`: Phase-based screens.
- `/src/hooks`: Zustand subscriptions tailored for React components.
- `/src/lib`: Utilities (UID generation, math helpers, localStorage leaderboard).
