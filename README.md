# **Diotrix: AI Art Generator**

**AI-Powered Image Generation Mobile App** built with React Native, Expo, and TypeScript. It transforms text prompts into stunning artwork using Google's Gemini Imagen API.  
**Diotrix** is a creative mobile application that features a freemium monetization model via RevenueCat, with an option for users to input their own Gemini API key for unrestricted use. All generated images are stored locally, ensuring an offline-first experience.

## **📖 Table of Contents**

* 🎯 Overview  
* ✨ Features  
* 🛠 Tech Stack  
* 🏗 Architecture  
* 📁 Project Structure  
* 🎨 Design Patterns  
* 🚀 Key Implementation Details  
* 🔧 Development Setup  
* 📦 Building & Deployment  
* 📄 License  
* 📞 Support

## **🎯 Overview**

### **Key Objectives**

* **AI-First Experience**: Seamless integration with Google Gemini Imagen API for state-of-the-art image generation.  
* **Local-First Architecture**: All generated images and metadata stored locally for offline access and privacy.  
* **Flexible Monetization**: Freemium model with trial credits, Pro subscriptions, and a bring-your-own-API-key option.  
* **Cross-Platform**: Single codebase for both iOS and Android using Expo's managed workflow.  
* **Type Safety**: Full TypeScript implementation across the entire codebase for robust development.

### **Project Metadata**

* **Version**: 0.7.0  
* **Platform**: iOS, Android  
* **Framework**: React Native (0.81.4) \+ Expo (SDK 54\)  
* **Language**: TypeScript 5.9+  
* **Bundle ID**: com.bugrarslan.diotrix

## **✨ Features**

### **🖼️ AI Image Generation**

* **Text-to-Image**: Generate images from natural language prompts using Gemini Imagen 4.0.  
* **Customizable Parameters**:  
  * **Aspect Ratios**: 1:1, 3:4, 4:3, 16:9, 9:16  
  * **Image Sizes**: 1K, 2K resolution options  
  * **Guidance Scale**: Control adherence to the prompt (1-10)  
  * **Negative Prompts**: Specify elements to avoid in the generation.  
* **Real-time Progress**: Visual feedback during the generation process.  
* **Error Handling**: Comprehensive error states with clear messages and retry mechanisms.

### **🗂️ Local Gallery Management**

* **Masonry Grid Layout**: A responsive and high-performance FlashList-powered gallery.  
* **Full-Screen Viewer**: Pinch-to-zoom image viewer with gesture controls.  
* **Detailed Metadata**: View the original prompt, parameters, and creation timestamp for each image.  
* **Image Operations**: Save to device, delete from the gallery, and share via the system share sheet.  
* **Persistent Storage**: SQLite database for metadata combined with the local FileSystem for image files.

### **💳 Monetization & Access Control**

* **Trial System**: New users receive 5 free generation credits.  
* **Pro Subscription**: Unlimited generations via RevenueCat for a recurring fee.  
* **Custom API Key**: Users can bring their own Gemini API key for unlimited access, bypassing subscriptions.  
* **Access Flow**: The app intelligently checks for a custom key, then a Pro subscription, and finally trial credits before showing the promotion screen.  
* **Subscription Management**: Native iOS/Android purchase, restoration, and management flows.

### **⚙️ Settings & Customization**

* **Theme System**: Light & Dark mode with automatic detection of system preference.  
* **API Key Management**: Securely enter and store a custom Gemini API key locally.  
* **Data Management**: Options to clear the entire gallery or reset the app to its initial state.  
* **Subscription Controls**: View subscription status, restore purchases, and manage the current plan.

## **🛠 Tech Stack**

| Category | Technology | Purpose |
| :---- | :---- | :---- |
| **Core Framework** | React Native 0.81.4, Expo SDK 54, TypeScript | Cross-platform development and type safety |
| **Navigation & Routing** | Expo Router | File-based routing for native apps |
| **State Management** | React Context API, Custom Hooks | Global state for settings and subscriptions |
| **AI & API Integration** | @google/genai (Gemini Imagen 4.0) | AI image generation from text prompts |
| **Storage & Persistence** | Expo SQLite, Expo FileSystem, AsyncStorage | Metadata, image files, and user preferences |
| **Monetization** | react-native-purchases (RevenueCat) | In-app subscriptions and purchase management |
| **UI Components & Styling** | NativeWind, Tailwind CSS, @shopify/flash-list | Modern styling and high-performance lists |
| **Media & Permissions** | Expo Media Library, Expo Haptics, Expo Image | Saving files, tactile feedback, optimized images |
| **Developer Experience** | ESLint, Prettier, Expo Dev Client | Code quality, formatting, and custom builds |

## **🏗 Architecture**

Diotrix follows a **feature-based, layered architecture** with a clear separation of concerns to ensure maintainability and scalability.  
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

### **Layer Responsibilities**

* **Presentation Layer (app/, components/)**: Renders UI, handles user input, and navigates between screens.  
* **Application Layer (context/, hooks/)**: Manages global state (e.g., settings, subscription status) and encapsulates business logic.  
* **Service Layer (services/)**: Abstracts external communications and data operations (e.g., calling the Gemini API, querying the database).  
* **Data Layer**: The underlying storage mechanisms, including the SQLite database, local file system, and AsyncStorage.

## **📁 Project Structure**

diotrix/  
├── app/                          \# Expo Router screens  
│   ├── \_layout.tsx               \# Root layout with context providers  
│   ├── index.tsx                 \# Entry/splash screen  
│   ├── (tabs)/                   \# Tab navigation group  
│   │   ├── \_layout.tsx           \# Tab layout configuration  
│   │   ├── home.tsx              \# Gallery/creation screen  
│   │   └── settings.tsx          \# Settings screen  
│   ├── createImageModal.tsx      \# Image generation modal  
│   ├── promotionScreen.tsx       \# Subscription upsell screen  
│   └── image/\[id\].tsx            \# Dynamic image detail screen  
├── assets/                       \# Static resources (images, icons, fonts)  
├── components/                   \# Reusable UI components  
├── context/                      \# React Context providers for global state  
├── hooks/                        \# Custom React hooks for stateful logic  
├── services/                     \# Business logic and API integration layer  
├── utils/                        \# Utility functions  
├── app.json                      \# Expo configuration file  
├── tailwind.config.js            \# NativeWind styling configuration  
├── tsconfig.json                 \# TypeScript configuration  
└── package.json                  \# Project dependencies and scripts

### **File Naming Conventions**

* **Screens**: camelCase.tsx (e.g., onboardingScreen.tsx)  
* **Components**: PascalCase.tsx (e.g., BackgroundStars.tsx)  
* **Hooks**: use\*.ts (e.g., useGalleryStorage.ts)  
* **Services**: \*Service.ts (e.g., databaseService.ts)

## **🎨 Design Patterns**

* **Context \+ Hook Pattern**: Global state (settings, subscriptions) is managed in a React Context and consumed cleanly via custom hooks (useSettingsContext).  
* **Service Layer Pattern**: Data operations (API calls, database queries) are abstracted into service modules to decouple them from the UI.  
* **Repository Pattern**: Custom hooks like useGalleryStorage act as repositories, orchestrating calls between different services (e.g., saving an image to the file system and then writing its metadata to the database).  
* **Optimistic UI Pattern**: For actions like deleting an image, the UI updates immediately for a fluid user experience, and then rolls back only if the underlying operation fails.  
* **Singleton Pattern**: The database connection is initialized once and reused throughout the app's lifecycle to conserve resources.

## **🚀 Key Implementation Details**

### **Database Schema**

A simple schema is used to store image metadata, while the image files themselves are stored on the file system.  
CREATE TABLE IF NOT EXISTS generated\_images (  
  id INTEGER PRIMARY KEY AUTOINCREMENT,  
  uri TEXT NOT NULL,  
  prompt TEXT NOT NULL,  
  metadata TEXT, \-- JSON string with generation parameters  
  created\_at TEXT NOT NULL DEFAULT (datetime('now'))  
);

CREATE INDEX IF NOT EXISTS idx\_created\_at ON generated\_images(created\_at DESC);

### **AI Service Implementation**

* **API Endpoint**: Google Gemini Imagen 4.0 (imagen-4.0-generate-001).  
* **Flow**:  
  1. The client constructs a request with the user's prompt and parameters.  
  2. The service sends the request to the Gemini endpoint.  
  3. On success, it receives base64-encoded image data.  
  4. The data is saved to the local file system.  
  5. The file's URI and other metadata are stored in the SQLite database.  
* **Error Handling**: The service handles invalid API keys, rate limits (with exponential backoff), network errors, and content policy violations gracefully.

### **Subscription & Access Control Flow**

The logic to determine if a user can generate an image is centralized and follows a clear priority order.  
const canGenerateImage \= async (): Promise\<boolean\> \=\> {  
  // 1\. Check for a custom API key first.  
  if (settings?.aiApiKey?.trim()) {  
    return true;  
  }

  // 2\. Check for an active Pro subscription via RevenueCat.  
  const customerInfo \= await Purchases.getCustomerInfo();  
  if (customerInfo.entitlements.active\["Diotrix Pro"\]) {  
    return true;  
  }

  // 3\. Check for remaining trial credits.  
  if (settings?.isTrialVersion && (settings?.remainingCredits ?? 0\) \> 0\) {  
    return true;  
  }

  // 4\. If none of the above, user cannot generate.  
  return false;  
};

## **🔧 Development Setup**

### **Prerequisites**

* Node.js 18+  
* Expo CLI (npm install \-g expo-cli)  
* Xcode (for iOS on macOS) / Android Studio (for Android)

### **Installation**

1. **Clone the repository:**  
   git clone \[https://github.com/bugrarslan/diotrix.git\](https://github.com/bugrarslan/diotrix.git)  
   cd diotrix

2. **Install dependencies:**  
   npm install

### **Environment Configuration**

Create a .env file in the project root to store your API keys:  
\# Google Gemini API Key (optional, can be added in-app)  
EXPO\_PUBLIC\_GEMINI\_API\_KEY=your\_gemini\_api\_key\_here

\# RevenueCat API Keys (required for subscription features)  
EXPO\_PUBLIC\_REVENUECAT\_IOS\_KEY=your\_ios\_key\_here  
EXPO\_PUBLIC\_REVENUECAT\_ANDROID\_KEY=your\_android\_key\_here

### **Running the App**

* **Using Expo Go (for quick previews, some native features may not work):**  
  npx expo start

* **Using a Development Build (Recommended for full functionality):**  
  \# For iOS  
  npx expo run:ios

  \# For Android  
  npx expo run:android

## **📦 Building & Deployment**

This project uses **Expo Application Services (EAS)** for building and deploying.

### **Prerequisites**

1. Install EAS CLI: npm install \-g eas-cli  
2. Login to your Expo account: eas login

### **Build Command**

Run the following command to build for production:  
\# Build for both iOS and Android  
eas build \--profile production \--platform all

\# Build for a specific platform  
eas build \--platform ios

### **Submission to Stores**

Once the build is complete, you can submit it to the app stores:  
eas submit \--platform ios

## **📄 License**

This project is proprietary software. All rights reserved.  
© 2025 Bugra Arslan

## **📞 Support**

For questions or issues, please open an issue on the GitHub repository:

* **GitHub Issues**: [github.com/bugrarslan/diotrix/issues](https://github.com/bugrarslan/diotrix/issues)

**Built with ❤️ using React Native, Expo, and Google Gemini.**