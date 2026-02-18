# Dino Play 

Dino Play is a modern, responsive video streaming application built with React and TypeScript. It features a premium UI, dynamic content fetching from the Pexels API, infinite scrolling, and a custom video player experience.

## ✨ Features

-   **Dynamic Content**: Fetches high-quality videos from the Pexels API based on categories and search queries.
-   **Infinite Scroll**: Seamlessly loads more videos as you scroll, using efficient pagination.
-   **Custom Video Player**:
    -   **Persistent Playback**: Keep watching while browsing other content.
    -   **Mini-Player Mode**: Minimize the video to the corner and continue navigating.
    -   **Theater Mode**: Immersive full-screen viewing.
    -   **Auto-Play**: Automatically plays the next video in the queue.
-   **Smart Categorization**: Videos are automatically categorized (Nature, Technology, People, etc.) based on their source query.
-   **Responsive Design**: Fully responsive layout optimized for desktop, tablet, and mobile.
-   **Dark/Light Mode**: Built-in theme switching support.

## 🛠️ Tech Stack

-   **Frontend Framework**: [React](https://react.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **State Management**: React Context API
-   **Routing**: React Router DOM
-   **HTTP Client**: Axios

## 🏗️ Architecture

### Data Flow
1.  **API Layer (`src/data/videos.ts`)**: Handles interactions with the Pexels API.
    -   `fetchVideos(query, page)`: Fetches videos based on a search query and page number.
    -   Maps Pexels API response to the application's internal `Video` interface.
    -   Handles pagination and error fallbacks.

2.  **State Management (`src/contexts/VideoContext.tsx`)**:
    -   Manages global state: current video, playback status, video list, pagination, and loading states.
    -   Exposes actions: `playVideo`, `loadMore`, `filterByCategory`, etc.
    -   Implements randomization logic for "Up Next" videos to prevent playback loops.

3.  **UI Components**:
    -   **`Index.tsx`**: Main feed. Consumes `VideoContext` to display the grid and triggers `loadMore` via an Intersection Observer.
    -   **`GlobalVideoPlayer`**: A persistent component that resides at the root level. It handles the video element ensuring playback isn't interrupted during navigation. It switches between "Full" and "Mini" modes using Framer Motion for smooth transitions.

### Type System (`src/types/video.ts`)
-   Centralized type definitions for `Video`, `VideoCategory`, and Pexels API contracts (`PexelsVideo`, `PexelsResponse`).
-   Ensures type safety across the data layer and UI components.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v16 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd Dino_Ventures_Task
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    -   Create a `.env` file in the root directory.
    -   Add your Pexels API key:
        ```env
        VITE_PEXELS_API_KEY=your_pexels_api_key_here
        ```
    -   *Note: If no key is provided, the app will gracefully fallback to a limited set of demo videos.*

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:8080] to view it in the browser.

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── GlobalVideoPlayer.tsx  # The persistent player
│   ├── VideoCard.tsx          # Grid item
│   └── ...
├── contexts/           # React Context definitions
│   └── VideoContext.tsx       # Video state management
├── data/               # Data fetching and API services
│   └── videos.ts              # Pexels API logic
├── pages/              # Route components
│   ├── Index.tsx              # Home page
│   └── Watch.tsx              # Video details (routing wrapper)
├── types/              # TypeScript definitions
│   └── video.ts               # Video interfaces
└── index.css           # Global styles and Tailwind directives
```
