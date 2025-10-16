# Diotrix: AI Art Generator

AI-Powered Image Generation Mobile App built with React Native, Expo,
and TypeScript. It transforms text prompts into stunning artwork using
Google's Gemini Imagen API.

Diotrix is a creative mobile application that features a freemium
monetization model via RevenueCat, with an option for users to input
their own Gemini API key for unrestricted use. All generated images are
stored locally, ensuring an offline-first experience.

------------------------------------------------------------------------

## 📖 Table of Contents

-   🎯 Overview
-   ✨ Features
-   🛠 Tech Stack
-   🏗 Architecture
-   📁 Project Structure
-   🎨 Design Patterns
-   🚀 Key Implementation Details
-   🔧 Development Setup
-   📦 Building & Deployment
-   📄 License
-   📞 Support

------------------------------------------------------------------------

## 🎯 Overview

### Key Objectives

-   **AI-First Experience:** Seamless integration with Google Gemini
    Imagen API for state-of-the-art image generation.
-   **Local-First Architecture:** All generated images and metadata
    stored locally for offline access and privacy.
-   **Flexible Monetization:** Freemium model with trial credits, Pro
    subscriptions, and a bring-your-own-API-key option.
-   **Cross-Platform:** Single codebase for both iOS and Android using
    Expo's managed workflow.
-   **Type Safety:** Full TypeScript implementation across the entire
    codebase for robust development.

### Project Metadata

-   **Version:** 0.7.0
-   **Platform:** iOS, Android
-   **Framework:** React Native (0.81.4) + Expo (SDK 54)
-   **Language:** TypeScript 5.9+
-   **Bundle ID:** com.bugrarslan.diotrix

------------------------------------------------------------------------

## ✨ Features

### 🖼️ AI Image Generation

-   **Text-to-Image:** Generate images from natural language prompts
    using Gemini Imagen 4.0.
-   **Customizable Parameters:**
    -   Aspect Ratios: 1:1, 3:4, 4:3, 16:9, 9:16
    -   Image Sizes: 1K, 2K resolution options
    -   Guidance Scale: Control adherence to the prompt (1--10)
    -   Negative Prompts: Specify elements to avoid in the generation.
-   **Real-time Progress:** Visual feedback during the generation
    process.
-   **Error Handling:** Comprehensive error states with clear messages
    and retry mechanisms.

### 🗂️ Local Gallery Management

-   Masonry Grid Layout: A responsive and high-performance
    FlashList-powered gallery.
-   Full-Screen Viewer: Pinch-to-zoom image viewer with gesture
    controls.
-   Detailed Metadata: View the original prompt, parameters, and
    creation timestamp for each image.
-   Image Operations: Save to device, delete from the gallery, and share
    via the system share sheet.
-   Persistent Storage: SQLite database for metadata combined with the
    local FileSystem for image files.

### 💳 Monetization & Access Control

-   **Trial System:** New users receive 5 free generation credits.
-   **Pro Subscription:** Unlimited generations via RevenueCat for a
    recurring fee.
-   **Custom API Key:** Users can bring their own Gemini API key for
    unlimited access, bypassing subscriptions.
-   **Access Flow:**
    The app intelligently checks for a custom key, then a Pro
    subscription, and finally trial credits before showing the promotion
    screen.
-   **Subscription Management:** Native iOS/Android purchase,
    restoration, and management flows.

### ⚙️ Settings & Customization

-   Theme System: Light & Dark mode with automatic detection of system
    preference.
-   API Key Management: Securely enter and store a custom Gemini API key
    locally.
-   Data Management: Options to clear the entire gallery or reset the
    app to its initial state.
-   Subscription Controls: View subscription status, restore purchases,
    and manage the current plan.

------------------------------------------------------------------------

## 🛠 Tech Stack

  -----------------------------------------------------------------------
  Category               Technology                  Purpose
  ---------------------- --------------------------- --------------------
  Core Framework         React Native 0.81.4, Expo   Cross-platform
                         SDK 54, TypeScript          development and type
                                                     safety

  Navigation & Routing   Expo Router                 File-based routing
                                                     for native apps

  State Management       React Context API, Custom   Global state for
                         Hooks                       settings and
                                                     subscriptions

  AI & API Integration   @google/genai (Gemini       AI image generation
                         Imagen 4.0)                 from text prompts

  Storage & Persistence  Expo SQLite, Expo           Metadata, image
                         FileSystem, AsyncStorage    files, and user
                                                     preferences

  Monetization           react-native-purchases      In-app subscriptions
                         (RevenueCat)                and purchase
                                                     management

  UI Components &        NativeWind, Tailwind CSS,   Modern styling and
  Styling                @shopify/flash-list         high-performance
                                                     lists

  Media & Permissions    Expo Media Library, Expo    Saving files,
                         Haptics, Expo Image         tactile feedback,
                                                     optimized images

  Developer Experience   ESLint, Prettier, Expo Dev  Code quality,
                         Client                      formatting, and
                                                     custom builds
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 🏗 Architecture

Diotrix follows a **feature-based, layered architecture** with a clear
separation of concerns to ensure maintainability and scalability.

    ┌─────────────────────────────────────────────┐
    │           Presentation Layer                │
    │  (Screens, Components, Navigation)          │
    └─────────────────┬───────────────────────────┘
                      │
    ┌─────────────────▼───────────────────────────┐
    │         Application Layer                   │
    │  (Context Providers, Custom Hooks)          │
    └─────────────────┬───────────────────────────┘
                      │
    ┌─────────────────▼───────────────────────────┐
    │           Service Layer                     │
    │  (AI, Database, Storage, AsyncStorage)      │
    └─────────────────┬───────────────────────────┘
                      │
    ┌─────────────────▼───────────────────────────┐
    │           Data Layer                        │
    │  (SQLite, FileSystem, AsyncStorage)         │
    └─────────────────────────────────────────────┘

### Layer Responsibilities

-   **Presentation Layer (app/, components/):** Renders UI, handles user
    input, and navigates between screens.
-   **Application Layer (context/, hooks/):** Manages global state and
    encapsulates business logic.
-   **Service Layer (services/):** Handles API calls and data
    operations.
-   **Data Layer:** Manages the underlying storage mechanisms (SQLite,
    FileSystem, AsyncStorage).

------------------------------------------------------------------------

## 📁 Project Structure

    diotrix/
    ├── app/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── (tabs)/
    │   │   ├── _layout.tsx
    │   │   ├── home.tsx
    │   │   └── settings.tsx
    │   ├── createImageModal.tsx
    │   ├── promotionScreen.tsx
    │   └── image/[id].tsx
    ├── assets/
    ├── components/
    ├── context/
    ├── hooks/
    ├── services/
    ├── utils/
    ├── app.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── package.json

**File Naming Conventions** - Screens: `camelCase.tsx`
- Components: `PascalCase.tsx`
- Hooks: `use*.ts`
- Services: `*Service.ts`

------------------------------------------------------------------------

## 🎨 Design Patterns

-   **Context + Hook Pattern:** Global state management through Context
    API and custom hooks.
-   **Service Layer Pattern:** Decouples UI from data logic.
-   **Repository Pattern:** Custom hooks orchestrate between storage and
    UI layers.
-   **Optimistic UI Pattern:** Immediate UI updates for better UX with
    rollback on failure.
-   **Singleton Pattern:** Shared database connection reused app-wide.

------------------------------------------------------------------------

## 🚀 Key Implementation Details

### Database Schema

``` sql
CREATE TABLE IF NOT EXISTS generated_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uri TEXT NOT NULL,
  prompt TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_created_at ON generated_images(created_at DESC);
```

### AI Service Implementation

**API Endpoint:** Google Gemini Imagen 4.0 (`imagen-4.0-generate-001`).

**Flow:** 1. Construct request with prompt and parameters.
2. Send to Gemini endpoint.
3. Receive base64 image data.
4. Save to local file system.
5. Store metadata in SQLite.

Handles invalid keys, rate limits, and network errors gracefully.

### Subscription & Access Control

``` typescript
const canGenerateImage = async (): Promise<boolean> => {
  if (settings?.aiApiKey?.trim()) return true;
  const customerInfo = await Purchases.getCustomerInfo();
  if (customerInfo.entitlements.active["Diotrix Pro"]) return true;
  if (settings?.isTrialVersion && (settings?.remainingCredits ?? 0) > 0) return true;
  return false;
};
```

------------------------------------------------------------------------

## 🔧 Development Setup

### Prerequisites

-   Node.js 18+
-   Expo CLI
-   Xcode / Android Studio

### Installation

``` bash
git clone https://github.com/bugrarslan/diotrix.git
cd diotrix
npm install
```

### Environment Configuration

Create a `.env` file:

    EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
    EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key_here
    EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key_here

### Running the App

``` bash
npx expo start
# or for native builds
npx expo run:ios
npx expo run:android
```

------------------------------------------------------------------------

## 📦 Building & Deployment

Uses **EAS (Expo Application Services)**.

``` bash
npm install -g eas-cli
eas login
eas build --profile production --platform all
eas submit --platform ios
```

------------------------------------------------------------------------

## 📄 License

This project is proprietary software.
All rights reserved.
© 2025 Bugra Arslan

------------------------------------------------------------------------

## 📞 Support

For issues or feedback:
**GitHub Issues:**
[github.com/bugrarslan/diotrix/issues](https://github.com/bugrarslan/diotrix/issues)

Built with ❤️ using React Native, Expo, and Google Gemini.
