# Mini Games Mobile

A React Native (Expo) mobile app for playing multiplayer mini games - Scribble (Pictionary-style drawing game) and Hangman. Connect with the backend server at https://mini-games-hub.onrender.com to play with friends in real-time!

## Features

- **Scribble**: Draw pictures and let others guess what you're drawing!
- **Hangman**: Classic word-guessing game with multiplayer support
- **Real-time multiplayer** using Socket.io
- **Room system**: Create or join rooms with friends
- **Cross-platform**:OS and Works on i Android

## Tech Stack

- React Native with Expo
- Expo Router for navigation
- Socket.io-client for real-time communication
- react-native-svg for drawing canvas

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

### Building for Production

#### Android (APK)

```bash
# Using EAS Build (recommended)
npx eas build -p android --profile preview

# Or using legacy expo build
npx expo build:android
```

#### iOS

```bash
npx eas build -p ios
```

## How to Play

### Scribble

1. Create a room or join an existing one
2. Wait for players to join
3. If you're the drawer, you'll see a word to draw
4. Draw on the canvas using your finger
5. Other players guess what you're drawing
6. First to guess correctly gets points!
7. Take turns drawing

### Hangman

1. Create a room or join an existing one
2. Wait for players to join
3. The host starts the game
4. A random word is chosen
5. Guess letters by tapping on the keyboard
6. Be careful - 6 wrong guesses and it's game over!
7. Correct guess = 100 points

## Backend Server

This app connects to a backend server deployed at:
https://mini-games-hub.onrender.com

The backend source code is available at:
https://github.com/M-Destiny/mini-games-hub

## Project Structure

```
mini-games-mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── scribble.tsx   # Scribble game selection
│   │   └── hangman.tsx    # Hangman game selection
│   ├── scribble/          # Scribble game screens
│   │   ├── create.tsx
│   │   ├── join.tsx
│   │   └── game.tsx
│   └── hangman/           # Hangman game screens
│       ├── create.tsx
│       ├── join.tsx
│       └── game.tsx
├── context/               # React Context
│   └── SocketContext.tsx  # Socket.io context
├── package.json
└── app.json              # Expo configuration
```

## License

MIT
