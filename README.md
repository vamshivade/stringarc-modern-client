# String Modern

String Modern is a production-grade Telegram Mini App (TMA) Arcade Platform built with Next.js. It functions as a centralized hub for HTML5 mini-games, featuring a ticket-based economy, daily rewards system, and seamless integration with the Telegram Web App ecosystem and TON wallet infrastructure.

## Project Overview

This application serves as the user-facing client for the String Modern gaming ecosystem. It is designed specifically for mobile usage within the Telegram environment (`window.Telegram.WebApp`).

**Core Purpose:**

- Provide a seamless "Play-to-Earn" or "Play-for-Fun" experience directly within Telegram.
- Manage user identity via Telegram `initData`.
- Handle game currencies (Tickets) and boosters.
- Serve as a launcher for multiple integrated game modules (Doodle Jump, Flappy Bird, Stack).

**Target Audience:**

- Mobile gamers on the Telegram platform.
- Users interacting with the TON ecosystem.

## 🛠 Complete Technology Stack

### Runtime & Framework

- **Node.js**: Runtime environment for building and serving the Next.js application.
- **Next.js 13**: The core React framework used for file-based routing (`pages/`), API handling, and server-side logic integration.
- **React 18**: View library for building the component-based UI.

### State Management

- **React Context API**: Used in `src/context/ContextWrapper.js` to manage global application state, including:
  - User Authentication (`isLogin`, `userData`)
  - Wallet connection status
  - Ticket balances and transaction history
  - Active Booster timers and expiration logic

### Architecture & Security

- **Higher-Order Components (HOC)**: `AuthGuard` is used to wrap protected routes, preventing unauthorized access.
- **Client-Side Encryption**: `crypto-js` is used to generate a dynamic `clientid` header (AES-encrypted timestamp) for every API request, preventing replay attacks.
- **Telegram Integration**:
  - `@telegram-apps/sdk` & `@twa-dev/sdk`: For interacting with the native Telegram client (Main Button, Back Button, Theme params).
  - `window.Telegram.WebApp`: Used for extracting `initData` during authentication.

### UI & Styling

- **Material UI (@mui/material)**: Primary component library for layout grids and interactive elements.
- **Bootstrap 5**: Used for responsive containers and utility classes.
- **Styled Components / Emotion**: Used for component-level styling isolation.
- **Framer Motion / CSS Modules**: Used for animations (e.g., Daily Reward popups).

### Game Development

- **Three.js**: Renders 3D graphics for mini-games.
- **Cannon-es**: Handles physics simulations (collision detection, gravity) for games like "Stack".

### Web3 & Wallet

- **@tonconnect/ui-react**: Provides the UI and logic for connecting TON wallets.
- **@ton/core**: Core utilities for interacting with the TON blockchain.

### Utilities

- **Axios**: Centralized HTTP client for all API communication.
- **Nookies**: Manages authentication cookies.
- **React Hot Toast**: Displays ephemeral success/error notifications.
- **Formik**: Manages form state for user input (e.g., Profile editing).

## 🏗 Architecture Overview

The application follows a **Monolithic Frontend Architecture** structured around Next.js pages, with a heavy emphasis on client-side state management for real-time game data.

### 1. Application Boot Process (`_app.jsx`)

1.  **Platform Check**: The app first checks `isValidTelegram`. If the user is not in a Telegram environment, a "Play on Telegram Mobile" fallback screen is rendered.
2.  **Context Initialization**: `TonConnectUIProvider` and `ContextWrapper` are initialized to provide global state.
3.  **Telegram Configuration**: The Telegram Back Button is programmatically hidden/handled based on route changes.
4.  **Route Protection**: `AuthGuard` middleware intercepts navigation to redirect unauthenticated users to the Login flow.

### 2. Authentication Flow

Authentication is handled via a hybrid of Telegram data and custom JWT tokens:

1.  **Entry**: User opens the Mini App. `index.jsx` captures `window.Telegram.WebApp.initData`.
2.  **Login Attempt**: A request is sent to `/api/v1/user/login` with signed headers.
3.  **Registration Fallback**: If login fails (400), the app automatically triggers `/api/v1/user/signup` using the Telegram `chatId` and referrer params (`tgWebAppStartParam`).
4.  **Session Persistence**: Successful login stores a `modernToken3` in `localStorage` and Cookies via `nookies`.

### 3. Data Flow

- **API Layer**: All requests are routed through `src/ApiConfig/service/index.js`.
- **Request Interception**: Before any request is sent, the service layer:
  - Retrieves `NEXT_PUBLIC_SECRET_KEY`.
  - Generates a timestamp.
  - Encrypts the timestamp to create the `clientid` header.
  - Attaches the `token` (JWT) and `initdata`.
- **Response Handling**: Responses populate the `AppContext`, which triggers UI updates (e.g., updating Ticket Balance after a game).

## 📂 Project Structure Breakdown

```
src/
├── ApiConfig/
│   ├── ApiConfig.js       # Centralized registry of all backend API endpoints.
│   └── service/           # Axios instance configuration and request signing logic.
├── AuthGuard/             # Route protection logic (Redirects unauthenticated users).
├── Themes/                # Custom Material UI theme definitions.
├── components/            # Reusable UI widgets.
│   ├── GamePlayNewCard.jsx # Displays game thumbnails and stats.
│   ├── SessionManage...    # Handles session timeouts.
│   └── ...
├── context/
│   ├── AppContext.js      # Context definition.
│   └── ContextWrapper.js  # Implementation of global state (User, Tickets, Boosters).
├── hooks/                 # Custom React hooks (e.g., useTelegram).
├── layout/                # Dashboard layout wrapper (Sidebar, Header).
├── lib/                   # Utility functions (e.g. class name merging).
├── pages/                 # Next.js Pages (Routes).
│   ├── _app.jsx           # Application Entry Point & Global Providers.
│   ├── index.jsx          # Home/Dashboard Page.
│   ├── profile/           # User Profile Management.
│   ├── tasks/             # Task Center (Social rewards).
│   ├── doodlejump/        # Game Module.
│   ├── flappybird/        # Game Module.
│   └── stack/             # Game Module.
└── styles/                # Global CSS and CSS Modules.
```

## 🚀 Features

- **Multi-Game Arcade**:
  - **Doodle Jump**: Integrated platformer logic.
  - **Flappy Bird**: Tap-to-fly mechanics.
  - **Stack**: Physics-based block stacking using `cannon-es`.
- **Economy System**:
  - **Ticket Balance**: Real-time tracking of user game tickets.
  - **Daily Rewards**: Progressive login bonus system with "Claim" functionality.
  - **Boosters**: Logic to handle active/inactive score multipliers with visual countdowns.
- **Social Integration**:
  - **Referral System**: Generates extraction links with `tgWebAppStartParam`.
  - **Task System**: Lists verifiable tasks for users to complete for rewards.
  - **Leaderboards**: Visualizes user rankings.
- **Wallet**:
  - **TON Connect**: Native integration for wallet linking.

## 🛠 Installation & Setup

### Prerequisites

- **Node.js**: v16 or higher (Required for Next.js 13).
- **npm** or **yarn**: Package manager.

### Installation Steps

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd String-Modern/Frontend
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` or `.env.local` file in the root directory.
    Based on the code validation (`service/index.js`), the following variable is critical for API signing:

    ```env
    NEXT_PUBLIC_SECRET_KEY=your_secret_key_here
    ```

    _Note: Other configuration values like `clientSecret` and `googleLoginClientId` are referenced in `ApiConfig.js` but may not be fully integrated depending on the backend requirements._

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The application will launch on **port 3001** (configured in `package.json`).

### Production Build

To build the application for deployment:

```bash
npm run build
```

**Note**: The build script explicitly removes source maps (`find .next -name '*.map' -type f -delete`) for security purposes.

## 📜 Scripts

defined in `package.json`:

- `dev`: `next -p 3001` - Starts the development server on port 3001.
- `build`: `next build && find .next -name '*.map' -type f -delete` - Builds the app and deletes `.map` files to hide source code in production.
- `start`: `next start -p 3001` - Starts the production build on port 3001.
- `lint`: `next lint` - Runs the ESLint configuration.

## 🛡 Security Implementation

1.  **Request Signing**:
    - Location: `src/ApiConfig/service/index.js`
    - Mechanism: Generates a `clientid` header by encrypting the current timestamp with `NEXT_PUBLIC_SECRET_KEY`. The backend validates this to ensure request timeliness and authenticity.
2.  **Source Map Protection**:
    - Location: `next.config.js` & `package.json`
    - Mechanism: `productionBrowserSourceMaps: false` and post-build deletion script ensure no source logic is exposed to the client browser.
3.  **Route Guards**:
    - Location: `src/AuthGuard/index.js`
    - Mechanism: Checks for `modernToken3`. If missing, redirects strictly to the landing page, except for whitelisted routes like `/static/about`.

## ⚠️ Performance Considerations

- **Code Splitting**: Next.js automatically splits code per page (`src/pages/`).
- **Lazy Loading**: Game modules and heavy assets are loaded only when the specific game route is accessed.
- **Asset Optimization**: `next/image` is used for optimized image serving (e.g., Daily Reward icons).
