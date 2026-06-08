# 📱 Loot Drop Sniper - Product Design Document

## 1. Executive Summary
**Loot Drop Sniper** is a hyper-casual, fast-paced mobile web game designed to drive user engagement and provide an interactive mechanism for promotional reward distribution. Built with a modern, high-energy esports aesthetic, the game challenges players' reflexes as they snipe (tap) falling supply crates while actively avoiding negative "lag spike" obstacles. The core objective is to reach a target score to unlock a real-world reward—specifically, a telecom data bundle.

## 2. Target Audience
- **Demographic:** Gen Z and Millennials (Ages 16-35).
- **Behavior:** Mobile-first users, frequent consumers of short-form content (TikTok, Reels), and casual mobile gamers.
- **Context of Use:** Short bursts of free time (commuting, waiting in line). Designed to be played entirely with one hand (thumb).

## 3. Core Gameplay Loop
The game is built around a simple, intuitive, and progressively difficult reflex loop:
1. **Spawn:** Entities spawn at random X-coordinates at the top of the screen and fall downwards.
2. **React:**
   - **Target:** "Supply Crates" (Cyan glowing boxes with crosshairs). Tapping these awards **+10 Points**.
   - **Obstacle:** "Lag Spikes" (Pulsating Red Stars). Tapping these penalizes the player with **-15 Points** and a jarring screen-shake effect.
3. **Survive:** If a Supply Crate reaches the bottom of the screen un-tapped, the player loses **1 Life**. The player starts with 3 lives.
4. **Escalate:** To prevent infinite gameplay, the baseline falling speed increases by 5% every 30 seconds, naturally pushing the player towards an eventual fail state.

## 4. Visual Identity & Aesthetics
**Theme: "Neon Esports / Cyberpunk"**
- **Color Palette:** Deep, inky dark backgrounds (slate/black) heavily contrasted with vibrant, glowing neon accents:
  - `Cyan (#00f0ff)` for positive interactions and score.
  - `Red (#ff0044)` for negative interactions, lives, and failures.
  - `Amber (#ffaa00)` for high scores, speed boosts, and victory states.
- **Typography:** Bold, geometric sans-serif (Inter) with heavy tracking and uppercase styling for headers to mimic professional esports broadcasting overlays.
- **UI Design:** Glassmorphic HUD elements with subtle background blurs and neon borders.
- **Feedback:** Highly kinetic visual feedback. Every positive action triggers a multi-particle burst animation; every negative action triggers a violent screen shake and red flash overlay.

## 5. End States & Monetization / Call to Action
The game features two distinct end states based on performance, serving as the promotional funnel:

### State A: Mission Failed (Score < 500)
- **Visuals:** Harsh red glow, glitch-style "X" iconography.
- **Copy:** "Mission Failed: Retrying Operational Parameters." Shows exactly how many points short the player was.
- **Action:** Encourages the player to "Retry Mission" to drive longer session times and higher engagement.

### State B: Victory & Reward Claim (Score ≥ 500)
- **Visuals:** Warm amber/gold glow, Trophy iconography, "NEW HIGH SCORE" badges.
- **Copy:** "VICTORY: Dialog Gaming Data Bundle Unlocked!"
- **Action:** Presents a clean, minimalist form requesting the user's Full Name, Phone Number, and Email Address. This acts as a lead generation tool and reward distribution mechanism.
- **Post-Action:** Transitions to a satisfying green "Success" state to assure the user the reward is processing.

## 6. Retention Mechanics
- **Local Leaderboard:** A persistent top-5 leaderboard tracks the user's best sessions across page reloads using browser `localStorage`.
- **Immediate Restart:** Minimal friction between failing and restarting a game.

## 7. Technical Strategy
- **Platform:** Web-based (PWA capable), removing the friction of App Store downloads.
- **Mobile Constraints:** Explicit CSS handling (`touch-action: manipulation`, `overscroll-behavior: none`, `user-scalable=no`) to completely lock the viewport. This prevents accidental pull-to-refresh, pinch-to-zoom, or swipe-back gestures that would interrupt gameplay.
- **Performance:** A custom, headless fixed-step physics engine built in `Zustand` completely decouples the high-frequency entity movement calculations (60fps) from the React rendering cycle.
- **Rendering:** Framer Motion handles the DOM-based entity interpolation, resulting in buttery smooth 60fps animations even during intense particle bursts, circumventing the complexity of raw `<canvas>` manipulation while allowing rich CSS styling.
