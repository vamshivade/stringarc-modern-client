# Telegram Mini-App Arcade Platform README

## Project Overview

This project is a high-performance **Telegram Mini App (TMA)** designed as an arcade gaming platform. Built on the **TON blockchain ecosystem**, it features multiple browser-based games, a robust economy system with daily rewards, user profiles, and social referral mechanics. The application is developed using **Next.js** for server-side rendering and routing, **React** for vibrant UI componentry, and leverages **Three.js** and **Canvas** for immersive gameplay experiences.

The platform is designed to run seamlessly within the Telegram environment, utilizing the `Telegram WebApp` SDK for native integration.

## Key Features

- **Multi-Game Arcade**: Includes three core games:
  - **Flappy Bird**: A skill-based obstacle game using custom Canvas rendering and physics.
  - **Doodle Jump**: A vertical platformer (implementation details in `src/pages/doodlejump`).
  - **Stack Game**: A 3D physics-based stacking game using `Three.js` and `Cannon-es`.
- **Economy & Monetization**:
  - **Daily Rewards**: Progressive login bonuses with reset logic.
  - **In-Game Store**: System for purchasing boosters and cosmetic upgrades.
  - **Ticket System**: Virtual currency for game entry.
- **User System**:
  - **Authentication**: Custom auth flow via Telegram `initData` verification.
  - **Profiles**: User statistics, game history, and high scores.
  - **Social Referrals**: Invite friends to earn bonuses.
- **Web3 Integration**:
  - **Wallet Connection**: Support for TON wallets via `@tonconnect/ui-react`.
  - **Withdrawals**: Secure withdrawal flow with 2FA and ReCaptcha.

## Tech Stack

- **Framework**: [Next.js 13](https://nextjs.org/) (Pages Router)
- **Language**: JavaScript (ES6+)
- **Styling**:
  - [Material UI (MUI)](https://mui.com/): Core component library.
  - [Bootstrap 5](https://getbootstrap.com/): Grid system and utilities.
  - [Styled Components](https://styled-components.com/): Component-level styling.
- **Game Engines**:
  - **Three.js**: 3D graphics rendering.
  - **Cannon-es**: 3D physics engine.
  - **HTML5 Canvas**: 2D game rendering.
- **State Management**: React Context API (`AppContext`).
- **Data Fetching**: Axios with custom interceptors (`ApiConfig/service.js`).
- **Forms**: Formik.

## Architecture & Folder Structure

The project follows a standard Next.js directory structure, organized by feature responsibility.

```
/
├── public/                 # Static assets (images, game sprites, audio)
├── src/
│   ├── ApiConfig/          # API endpoints and Axios service configuration
│   ├── AuthGuard/          # HOCs for route protection and auth checks
│   ├── components/         # Reusable UI components (Modals, Cards, Buttons)
│   ├── context/            # Global state (User data, Wallet, Theme)
│   ├── hooks/              # Custom React hooks
│   ├── layout/             # Page layouts (Dashboard, GameContainer)
│   ├── lib/                # Utility libraries
│   ├── pages/              # Next.js routes (File-system based routing)
│   │   ├── api/            # (Optional) Server-side API routes
│   │   ├── flappybird/     # Flappy Bird game logic
│   │   ├── doodlejump/     # Doodle Jump game logic
│   │   ├── stack/          # Stack game logic
│   │   ├── profile/        # User profile pages
│   │   ├── store/          # Item store pages
│   │   └── ...
│   └── Themes/             # MUI Theme configuration
└── next.config.js          # Next.js configuration
```

---

# Day-Wise GitHub Push Plan (Feature Branch Workflow)

This roadmap splits the development into logical phases, ensuring a stable and testable progression. Each day follows a strict **Feature Branch Workflow**:

1.  `git checkout -b feature/name-of-day`
2.  **Code**
3.  `git commit -m "feat: description"`
4.  `git push origin feature/name-of-day`
5.  **Pull Request & Merge** into `main`
6.  `git branch -d feature/name-of-day`

## Phase 1: Foundation & Core Infrastructure

### Day 1: Project Initialization & Configuration

**Goal**: Set up the Next.js environment, install dependencies, and configure essential tools.
**Files**: `package.json`, `next.config.js`, `.gitignore`, `jsconfig.json`.
**Commands**:

```bash
git checkout -b chore/init-projectt
npx create-next-app@latest .
npm install @mui/material @emotion/react @emotion/styled bootstrap react-bootstrap axios
# Add .gitignore and basic config
git add .
git commit -m "chore: init nextjs project with dependencies"
git push origin chore/init-project
```

### Day 2: Layout System & Theming

**Goal**: Create the global layout structure, integrate Bootstrap/MUI themes, and set up the main entry file (`_app.jsx`).
**Files**: `src/Themes/*`, `src/layout/DashboardLayout.jsx`, `src/pages/_app.jsx`.
**Commands**:

```bash
git checkout -b feat/layout-theme
# Implement MUI ThemeProvider and DashboardLayout
git add src/Themes src/layout
git commit -m "feat: add global layout and mui theme"
git push origin feat/layout-theme
```

### Day 3: Authentication & API Layer

**Goal**: Implement the API service wrapper and the Authentication logic using Telegram WebApp data.
**Files**: `src/ApiConfig/*`, `src/AuthGuard/*`, `src/context/AppContext.jsx`.
**Commands**:

```bash
git checkout -b feat/auth-api
# Create ApiConfig service and Context Provider
git add src/ApiConfig src/context
git commit -m "feat: implement api service and auth context"
git push origin feat/auth-api
```

## Phase 2: Core Game Modules

### Day 4: Flappy Bird - Assets & UI Wrapper

**Goal**: Set up the landing page for Flappy Bird, including the "Rules" modal and asset loading.
**Files**: `src/pages/flappybirdgame/index.jsx`, `src/components/Rules.jsx`, `public/images/flappybird/`.
**Commands**:

```bash
git checkout -b feat/flappy-ui
# Add game assets and landing page
git add public/images/flappybird src/pages/flappybirdgame
git commit -m "feat: add flappy bird assets and landing UI"
git push origin feat/flappy-ui
```

### Day 5: Flappy Bird - Game Logic (Canvas)

**Goal**: Implement the core game loop using HTML5 Canvas (`requestAnimationFrame`).
**Files**: `src/pages/flappybird/game.jsx`.
**Commands**:

```bash
git checkout -b feat/flappy-logic
# Implement Canvas rendering, physics, and collision detection
git add src/pages/flappybird/game.jsx
git commit -m "feat: implement flappy bird game loop"
git push origin feat/flappy-logic
```

### Day 6: Doodle Jump - Core Mechanics

**Goal**: Implement the Doodle Jump game logic and UI.
**Files**: `src/pages/doodlejump/*`, `src/pages/doodlejumpgame/`.
**Commands**:

```bash
git checkout -b feat/doodle-jump
# Add Doodle Jump game files
git add src/pages/doodlejump src/pages/doodlejumpgame
git commit -m "feat: add doodle jump game"
git push origin feat/doodle-jump
```

### Day 7: Stack Game - 3D Engine Setup

**Goal**: Initialize Three.js scene and Cannon-es physics world for the Stack game.
**Files**: `src/pages/stack/game.jsx` (Initial setup), `package.json` (add threejs deps).
**Commands**:

```bash
git checkout -b feat/stack-engine
# Install Three.js and setup basic scene
git add src/pages/stack
git commit -m "feat: setup threejs scene for stack game"
git push origin feat/stack-engine
```

### Day 8: Stack Game - Gameplay & Logic

**Goal**: Complete the Stack game mechanics (block slicing, physics, game over state).
**Files**: `src/pages/stack/*`, `src/pages/stackgame/`.
**Commands**:

```bash
git checkout -b feat/stack-gameplay
# Implement block stacking logic
git add src/pages/stack
git commit -m "feat: complete stack game mechanics"
git push origin feat/stack-gameplay
```

## Phase 3: Engagement & Economy

### Day 9: Dashboard & Game Selection

**Goal**: Build the main dashboard (`Home`) that lists available games and user stats.
**Files**: `src/pages/index.jsx`, `src/components/GamePlayNewCard.jsx`.
**Commands**:

```bash
git checkout -b feat/dashboard
# Create Home page and Game Cards
git add src/pages/index.jsx src/components/GamePlayNewCard.jsx
git commit -m "feat: add main dashboard and game list"
git push origin feat/dashboard
```

### Day 10: Daily Rewards System

**Goal**: Implement the daily login bonus logic, popup UI, and claim functionality.
**Files**: `src/pages/dailyPopup.module.css`, `src/pages/index.jsx` (integration).
**Commands**:

```bash
git checkout -b feat/daily-rewards
# Add Daily Reward Popup and API integration
git add src/pages/dailyPopup.module.css
git commit -m "feat: implement daily reward system"
git push origin feat/daily-rewards
```

### Day 11: Task & Referral System

**Goal**: Create the "Earn" section where users complete tasks and invite friends.
**Files**: `src/pages/tasks/*`, `src/pages/invitefriends/*`.
**Commands**:

```bash
git checkout -b feat/tasks-referrals
# Add Task list and Invite Friends page
git add src/pages/tasks src/pages/invitefriends
git commit -m "feat: add social tasks and referral system"
git push origin feat/tasks-referrals
```

## Phase 4: User System & Monetization

### Day 12: In-Game Store (Boosters)

**Goal**: Build the store interface for purchasing game boosters and items.
**Files**: `src/pages/store/*`, `src/components/NeonButton`.
**Commands**:

```bash
git checkout -b feat/store-system
# Add Store page and purchase logic
git add src/pages/store
git commit -m "feat: implement in-game store"
git push origin feat/store-system
```

### Day 13: User Profile & History

**Goal**: Create user profile pages showing game history, wallet balance, and settings.
**Files**: `src/pages/profile/*`.
**Commands**:

```bash
git checkout -b feat/user-profile
# Add Profile UI and Stats integration
git add src/pages/profile
git commit -m "feat: add user profile and history"
git push origin feat/user-profile
```

### Day 14: Wallet & Withdrawals

**Goal**: Integrate TON Connect for wallet linking and implement withdrawal requests.
**Files**: `src/components/withdrawModel.jsx`, `src/components/RecaptchaModal.jsx`.
**Commands**:

```bash
git checkout -b feat/wallet-connect
# Add Wallet Connect button and Withdrawal Modal
git add src/components/withdrawModel.jsx
git commit -m "feat: integrate wallet and withdrawal flow"
git push origin feat/wallet-connect
```

## Phase 5: Optimization & Polish

### Day 15: Final Polish & SEO

**Goal**: Optimize images, add SEO metadata, clean up logs, and finalize `_document.js`.
**Files**: `src/pages/_document.js`, `public/*`.
**Commands**:

```bash
git checkout -b chore/polish
# Add meta tags, optimize assets, remove console logs
git add .
git commit -m "chore: final polish and optimization"
git push origin chore/polish
```

---

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
4.  **Open in Telegram**: Use `@BotFather` to create a new Web App and point it to your deployed URL.
