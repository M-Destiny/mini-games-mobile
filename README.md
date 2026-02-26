# Mini Games Hub - Mobile App 📱🎮

A React Native (Expo) mobile app for the **Mini Games Hub** - play Scribble and Hangman with friends in real-time!

## Games

### 🎨 Scribble
- One player draws, others guess
- Real-time canvas drawing with color picker & brush sizes
- Points based on time remaining
- Take turns being the drawer

### 🏴 Hangman
- Guess the hidden word letter by letter
- 6 wrong guesses and it's game over!
- Words from categories: animals, fruits, countries, movies, sports
- 100 points per correct guess

## Features

- **Room System**: Create or join rooms with a 6-character code
- **Real-time Multiplayer**: Socket.io for instant communication
- **Score Tracking**: Live leaderboard during games
- **Clean Mobile UI**: Dark theme, smooth animations
- **Cross-platform**: Works on Android and iOS

## Tech Stack

- **React Native** with **Expo** (SDK 55)
- **Expo Router** for file-based navigation
- **Socket.io-client** for real-time communication
- **react-native-svg** for canvas drawing & hangman rendering
- **TypeScript** throughout

## Backend

Connects to: `https://mini-games-hub.onrender.com`

The backend is a Node.js Socket.io server handling:
- Room management (create/join/leave)
- Game state (rounds, timers, words)
- Real-time drawing sync
- Score calculations

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios
```

## Building APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Build APK
eas build --platform android --profile preview
```

## Project Structure

```
app/
├── _layout.tsx              # Root layout with SocketProvider
├── (tabs)/
│   ├── _layout.tsx          # Tab navigation
│   ├── index.tsx            # Home screen
│   ├── scribble.tsx         # Scribble menu
│   └── hangman.tsx          # Hangman menu
├── scribble/
│   ├── create.tsx           # Create scribble room
│   ├── join.tsx             # Join scribble room
│   └── game.tsx             # Scribble game screen
└── hangman/
    ├── create.tsx           # Create hangman room
    ├── join.tsx             # Join hangman room
    └── game.tsx             # Hangman game screen
context/
└── SocketContext.tsx         # Socket.io connection & game state
```

## License

MIT
