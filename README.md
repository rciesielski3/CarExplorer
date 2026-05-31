# 🚗 Car Explorer

Car Explorer is a React Native mobile app built with **Expo** that allows users to explore car models, check VIN details, view automotive news, take quizzes, and manage favorite vehicles. The app integrates multiple APIs to provide real-time data and offers a modern, theme-adaptive UI.

## 📌 Features

- **Explore Cars**: View car makes, models, and details using the NHTSA API.
- **Discover**: Search for car descriptions and images via Wikipedia.
- **VIN Checker**: Decode VIN numbers to retrieve car details.
- **Favorites**: Save and manage favorite cars.
- **News**: Read the latest automotive news from the News API.
- **Quiz**: Test car knowledge with randomly generated quizzes.
- **Theme Support**: Light and dark mode options.
- **Multi-Language Support**: Available in English, German, Polish, and French.

---

## 🏗 Project Structure

The project follows a **modular structure** for better maintainability.

```
carExplorer/
   │── assets/ # Images, animations, and static assets
   │── src/
   │   ├── api/ # API service modules
   │   ├── components/ # Reusable UI components (CarCard, NewsCard, etc.)
   │   ├── constants/ # Global constants (colors, assets, etc.)
   │   ├── context/ # Context providers (ThemeContext, LanguageContext, etc.)
   │   ├── hooks/ # Custom React hooks
   │   ├── navigation/ # App navigation setup
   │   ├── screens/ # App screens (Explore, Discover, News, Settings, etc.)
   │   ├── services/ # Utility services (translations, logos, quiz questions)
   │   ├── config/ # App configuration (API keys, environment settings)
   │── .env # Environment variables (API keys)
   │── package.json  # Dependencies and scripts
   │── README.md # Project documentation
```

---

## 🔗 API Integrations

- **NHTSA Vehicle API** – Fetches car makes, models, and VIN details.
- **Wikipedia API** – Retrieves car descriptions and images.
- **News API** – Fetches automotive news articles.
- **Open Trivia DB** – Provides quiz questions.
- **Google Translate API** – Translates quiz questions dynamically.

**API Configuration:**

- API keys are stored in the `.env` file and accessed via `expo-constants`.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16+)
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** / **Xcode** (for emulators)
- **VS Code** (recommended IDE)

### 🔧 Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/rciesielski3/CarExplorer.git
   ```

   ```sh
   cd CarExplorer
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Set up environment variables**

   - Create a `.env` file in the root directory:
     ```sh
     NEWS_API_KEY=your_api_key_here
     ```
   - Make sure `expo-constants` is configured to access environment variables.

4. **Run the app**

   ```sh
   npx expo start
   ```

   - **Android:** Press `a` to open in Android Emulator.
   - **iOS:** Press `i` to open in iOS Simulator.

---

## 🎨 Best Practices & Development Approach

- **📦 Modular Components:** UI elements are reusable and stored in `/components`.
- **🔄 React Hooks:** Uses `useState`, `useEffect`, and custom hooks for data fetching.
- **🌎 i18n Support:** Translations handled via `react-i18next`.
- **🎭 Theming:** Dark/light mode via `ThemeContext`.
- **💾 State Management:** Uses `React Context API` for global state (e.g., favorites, themes).
- **🛠 TypeScript Support:** Ensures type safety across the app.

---

## 🛠 Troubleshooting

### API Key Issues

- Ensure `.env` contains valid API keys.
- Restart Expo after adding `.env`:
  ```sh
  expo r -c
  ```

### Metro Bundler Issues

- Clear cache:
  ```sh
  npx expo start --clear
  ```

### Android Emulator Not Starting

- Ensure **Android Studio** and **AVD Manager** are properly configured.

---

## 👨‍💻 Author

**Rafał Ciesielski**  
🚀 [Portfolio](https://rciesielski3.github.io/portfolio/)

© 2025 Car Explorer. All rights reserved.

---

# Building the Project Locally

To build the project locally and get detailed logs, follow these steps:

1. **Install Expo CLI**: Ensure you have the Expo CLI installed globally.

   ```sh
   npm install -g expo-cli
   ```

2. **Install EAS CLI**: Ensure you have the EAS CLI installed globally.

   ```sh
   npm install -g eas-cli
   ```

3. **Login to Expo**: Make sure you are logged into your Expo account.

   ```sh
   expo login
   ```

4. **Run the Gradle build with detailed logging**:

   ```sh
   eas build --platform android --local --profile development --log-level debug
   ```

   Alternatively, you can use the `--stacktrace`, `--info`, or `--debug` options directly with the Gradle command:

   ```sh
   ./gradlew assembleRelease --stacktrace --info
   ```

5. **Check the logs**: Review the logs to identify the root cause of the compilation error.

By following these steps, you should be able to get more detailed information about the build failure and diagnose the issue.
