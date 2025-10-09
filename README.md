# Diotrix: AI Art Generator

## 📄 Overview

**Diotrix** is a creative AI art generation mobile application built with **React Native**, **Expo**, and **TypeScript**. The app leverages **Google Gemini's Image Generation API** to produce unique visuals from user prompts and parameters such as resolution, aspect ratio, style, and guidance scale. Diotrix features a freemium monetization model via RevenueCat, with the option for users to input their own Gemini API key for unrestricted use.

**Why this application?**

1. Demonstrate expertise in React Native, Expo, and TypeScript.
2. Showcase AI-driven visual generation using Gemini's capabilities.
3. Implement freemium monetization with RevenueCat and optional API key access.
4. Build an elegant, local-first creative app architecture.
5. Deliver an intuitive UX for AI image generation and gallery management.
6. Apply modern styling with NativeWind and a dynamic theme system.

---

## 🎯 Core Features

### 1. **Prompt-Based Image Generation**

- User inputs prompt and selects image generation parameters:
  - Resolution
  - Aspect ratio
  - Style presets (e.g., realistic, digital art, watercolor)
  - Guidance scale and other Gemini-supported parameters
- Gemini Image Generation API used exclusively for AI output.
- Real-time progress feedback and error handling.

### 2. **Gallery Management**

- **Local Gallery Tab** displaying generated images with metadata:
  - Prompt text
  - Image parameters (style, aspect ratio, etc.)
  - Creation date
- **Image Actions**:
  - Save to device
  - Delete
  - View details or regenerate with same prompt
- Gallery data persisted via SQLite.

### 3. **Subscription & Monetization System**

- **Freemium Model**: Free users have limited daily generations.
- **Pro Tier (RevenueCat Integration)**: Unlimited generations and priority access.
- **Custom API Key Option**: Users can enter their own Gemini API key to bypass subscription limits.
- **Promotion Screen**:
  - Feature comparison and benefits highlight
  - Native RevenueCat purchase flow
  - Secure App Store / Play Store billing

### 4. **Comprehensive Settings**

- **Settings Tab** featuring:
  - API key management (AsyncStorage persistence)
  - Subscription management (via RevenueCat)
  - Theme configuration (light/dark)
  - Data management controls (clear gallery, reset app)
  - App information, version, and support links

### 5. **Conditional Access Control**

1. Check for custom API key → Allow image generation.
2. Check for Pro subscription → Allow image generation.
3. Neither available → Redirect to promotion screen.

---

## 🧮 Tech Stack & Architecture

### **Core Technologies**

1. **React Native + Expo + TypeScript**

   - Expo SDK 51+
   - File-based navigation via Expo Router
   - Functional components with React Hooks
   - TypeScript for static typing and safety

2. **Database & Storage**

   - **Expo SQLite**: Stores metadata for generated images (prompt, parameters, URI)
   - **Expo FileSystem**: Stores generated image files locally
   - **AsyncStorage**: Persists user API key and app preferences
   - Offline-first persistence and retrieval architecture

3. **Subscription & Monetization**

   - **RevenueCat (react-native-purchases)** integration
   - Free tier with generation limits
   - Pro tier with unlimited generations
   - API key-based access control

4. **AI Integration**

   - **Google Gemini Image Generation API**
   - Custom prompt construction and parameter handling
   - Custom API key support for power users
   - Advanced error handling and fallback responses

5. **Native Components & UI**

   - **NativeWind** for Tailwind-like styling
   - **Expo Haptics** for tactile feedback
   - **Expo StatusBar** for adaptive theming
   - Reusable UI components for prompt forms and galleries

6. **State Management & Architecture**

   - **React Context API** for Settings and Subscription states
   - **Custom Hooks** (`useSettingsStorage`, `useGalleryStorage`)
   - Strongly typed models for prompts, images, and user settings

### **Project Structure**

```
diotrix/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   └── settings.tsx
│   ├── image/
│   │   └── [id].tsx
│   ├── createImageModal.tsx
│   ├── promotionScreen.tsx
│   └── onboardingScreen.tsx
├── components/
│   └── ui/
│       └── PromptInput.tsx
├── context/
│   ├── SettingsContext.tsx
│   └── SubscriptionContext.tsx
├── hooks/
│   ├── useSettingsStorage.ts
│   └── useGalleryStorage.ts
├── services/
│   ├── aiService.ts
│   ├── asyncStorage.ts
│   ├── databaseService.ts
│   └── types.ts
├── utils/
│   └── buildPrompt.ts
├── assets/
│   └── images/...
├── global.css
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Key Implementation Details

### **Database Schema**

```sql
CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uri TEXT NOT NULL,
  prompt TEXT NOT NULL,
  parameters TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Images are saved in Expo FileSystem; SQLite stores only metadata and references.

### **AI Generation Flow**

1. **Pre-checks**: Validate API key or subscription.
2. **Prompt Input**: User enters text and selects parameters.
3. **API Call**: Request sent to Gemini Image Generation endpoint.
4. **Response Handling**: Display generated image, handle errors.
5. **Persistence**: Save file via FileSystem, metadata via SQLite.
6. **Feedback**: Haptic response and success toast.

### **Subscription Flow**

```typescript
const handleGenerateImage = async () => {
  const hasApiKey = settings?.geminiApiKey?.trim();

  if (!hasApiKey) {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasPro = !!customerInfo.entitlements.active["Diotrix Pro"];

    if (!hasPro) {
      router.push("/promotionScreen");
      return;
    }
  }

  // Proceed with generation logic...
};
```

### **Navigation Structure**

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="onboardingScreen" />
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="createImageModal" />
  <Stack.Screen name="promotionScreen" />
</Stack>

<Tabs screenOptions={{
  headerShown: false,
  tabBarActiveTintColor: Colors.primary,
}}>
  <Tabs.Screen name="home" options={{ title: 'Create', tabBarIcon: ({ color }) => <Ionicons name="sparkles" color={color} /> }} />
  <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Ionicons name="settings" color={color} /> }} />
</Tabs>
```

---

## 🎨 Design System

### **Color Palette** (`tailwind.config.js`)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          900: '#4c1d95',
        },
        background: {
          light: '#ffffff',
          dark: '#0f0f10',
        }
      }
    }
  }
}
```

### **Reusable Components**

- `PromptInput`: Structured input for prompt and parameters.
- `GalleryCard`: Displays image thumbnail and metadata.
- `PromotionCTA`: Upsell component for subscription upgrade.
- `ThemeSwitch`: Toggle for dark/light mode.

---

## 📱 User Experience Flow

### **First-Time Experience**

1. App checks for existing settings or API key.
2. Onboarding introduces Diotrix’s AI art capabilities.
3. Redirects to Home tab for prompt-based creation.

### **Image Creation Flow**

1. Check API key or subscription status.
2. Input prompt and parameters.
3. Generate image using Gemini API.
4. Display result with save/regenerate options.
5. Store image reference in SQLite.

### **Gallery Flow**

1. View all generated images.
2. Open image details (prompt + parameters).
3. Regenerate or delete stored images.

### **Settings & Monetization**

1. Manage Gemini API key.
2. Upgrade to Pro for unlimited generations.
3. Configure theme (dark/light).
4. Manage stored data and preferences.

---

## 🔧 Development Setup

### **Prerequisites**

- Node.js 18+
- Expo CLI (latest)
- Google Gemini API key (optional)
- RevenueCat account for subscription setup

### **Installation**

```bash
npm install
```

### **Environment Setup**

Create `.env` file:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_android_key
EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY=your_ios_key
```

### **Running the App**

```bash
npx expo start
```

### **Building for Production**

```bash
eas build --profile production --platform all
```

---

## 🔹 Technical Evaluation

| Feature Category           | Implementation                             |   |
| -------------------------- | ------------------------------------------ | - |
| **TypeScript Integration** | Strong typing across contexts and services | ✅ |
| **Database Architecture**  | SQLite metadata + FileSystem for images    | ✅ |
| **Subscription System**    | RevenueCat Freemium + API key fallback     | ✅ |
| **AI Integration**         | Gemini Image Generation API only           | ✅ |
| **UI/UX Design**           | NativeWind styling, theme system           | ✅ |
| **State Management**       | Context API + custom hooks                 | ✅ |
| **Security**               | Local API key storage via AsyncStorage     | ✅ |
| **Performance**            | Optimized caching and local rendering      | ✅ |

---

## 🌟 Production Readiness

- ✅ Complete local-first architecture
- ✅ RevenueCat monetization system
- ✅ Gemini AI image generation integration
- ✅ Theme system (dark/light)
- ✅ Offline gallery storage
- ✅ Subscription and API key control

Diotrix empowers users to unleash creativity through AI-generated visuals, blending cutting-edge Gemini technology with a sleek, mobile-first experience.

