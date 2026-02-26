import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Alert } from 'react-native';

const SERVER_URL = 'https://mini-games-hub.onrender.com';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Message {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  isCorrect?: boolean;
}

interface Room {
  id: string;
  name: string;
  hostId: string;
  gameType: string;
  players: Player[];
  gameStarted: boolean;
  currentWord: string | null;
  isDrawer: string | null;
  round: number;
  totalRounds: number;
  timeLeft: number;
  guessedLetters: string[];
  wrongGuesses: number;
}

interface DrawPoint {
  x: number;
  y: number;
  color: string;
  width: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  room: Room | null;
  players: Player[];
  currentPlayer: Player | null;
  currentPlayerId: string | null;
  messages: Message[];
  currentWord: string;
  timeLeft: number;
  isGameStarted: boolean;
  isHost: boolean;
  isDrawer: boolean;
  guessedLetters: string[];
  wrongGuesses: number;
  round: number;
  totalRounds: number;
  drawPoints: DrawPoint[];
  createRoom: (roomName: string, playerName: string, gameType: string) => Promise<Room | null>;
  joinRoom: (roomId: string, playerName: string) => Promise<Room | null>;
  leaveRoom: () => void;
  startGame: () => void;
  sendHangmanGuess: (letter: string) => void;
  sendDraw: (data: DrawPoint) => void;
  sendGuess: (guess: string) => void;
  sendMessage: (message: string) => void;
  clearDrawPoints: () => void;
  clearCanvas: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isDrawer, setIsDrawer] = useState(false);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [drawPoints, setDrawPoints] = useState<DrawPoint[]>([]);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      setIsConnected(true);
      setCurrentPlayerId(socket.id || null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Player events
    socket.on('player-joined', (data: { players: Player[]; playerId: string; playerName: string }) => {
      setPlayers(data.players);
    });

    socket.on('player-left', (data: { playerId: string; playerName: string; players: Player[] }) => {
      setPlayers(data.players);
    });

    socket.on('new-host', (data: { hostId: string }) => {
      setRoom(prev => prev ? { ...prev, hostId: data.hostId } : null);
      setIsHost(data.hostId === socket.id);
    });

    // Game started
    socket.on('game-started', (data: { room: Room; word: string; round: number; timeLeft: number }) => {
      setIsGameStarted(true);
      setCurrentWord(data.word);
      setRound(data.round);
      setTimeLeft(data.timeLeft);
      setRoom(data.room);
      setPlayers(data.room.players);
      setGuessedLetters([]);
      setWrongGuesses(0);
      setMessages([]);
      setDrawPoints([]);
      
      // Determine if current player is drawer (scribble)
      if (data.room.gameType === 'scribble') {
        setIsDrawer(data.room.isDrawer === socket.id);
      }
    });

    // Timer
    socket.on('timer-update', (data: { timeLeft: number }) => {
      setTimeLeft(data.timeLeft);
    });

    // Drawing
    socket.on('draw', (point: DrawPoint) => {
      setDrawPoints(prev => [...prev, point]);
    });

    // Chat / guess messages
    socket.on('new-message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    // Correct guess (scribble)
    socket.on('correct-guess', (data: { playerId: string; playerName: string; score: number; word: string }) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        playerId: data.playerId,
        playerName: data.playerName,
        message: `Guessed correctly! (+${data.score} pts)`,
        isCorrect: true,
      }]);
    });

    // Hangman update
    socket.on('hangman-update', (data: { guessedLetters: string[]; wrongGuesses: number; playerId: string; playerName: string; letter: string; isCorrect: boolean }) => {
      setGuessedLetters(data.guessedLetters);
      if (!data.isCorrect) {
        setWrongGuesses(prev => prev + 1);
      }
    });

    // Hangman round over
    socket.on('hangman-round-over', (data: { word: string; winner: any; round: number; totalRounds: number }) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        playerId: 'system',
        playerName: 'System',
        message: data.winner 
          ? `${data.winner.name} guessed it! Word: ${data.word}` 
          : `Time's up! Word was: ${data.word}`,
      }]);
    });

    // Next round
    socket.on('next-round', (data: { round: number; word: string; timeLeft?: number }) => {
      setRound(data.round);
      setCurrentWord(data.word);
      setGuessedLetters([]);
      setWrongGuesses(0);
      setDrawPoints([]);
      if (data.timeLeft) setTimeLeft(data.timeLeft);
    });

    // Game over
    socket.on('game-over', (data: { winner: Player; scores: Player[] }) => {
      setIsGameStarted(false);
      setPlayers(data.scores);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        playerId: 'system',
        playerName: 'System',
        message: `🏆 Game Over! ${data.winner.name} wins with ${data.winner.score} points!`,
      }]);
    });

    // Room updated
    socket.on('room-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setPlayers(updatedRoom.players);
    });

    socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback(async (roomName: string, playerName: string, gameType: string): Promise<Room | null> => {
    return new Promise((resolve) => {
      socketRef.current?.emit('create-room', { roomName, playerName, gameType }, (response: any) => {
        if (response.success) {
          const newRoom = response.room;
          setRoom(newRoom);
          setPlayers(newRoom.players);
          setCurrentPlayerId(response.playerId);
          setIsHost(true);
          setMessages([]);
          resolve(newRoom);
        } else {
          Alert.alert('Error', response.error || 'Failed to create room');
          resolve(null);
        }
      });
    });
  }, []);

  const joinRoom = useCallback(async (roomId: string, playerName: string): Promise<Room | null> => {
    return new Promise((resolve) => {
      socketRef.current?.emit('join-room', { roomId, playerName }, (response: any) => {
        if (response.success) {
          const joinedRoom = response.room;
          setRoom(joinedRoom);
          setPlayers(joinedRoom.players);
          setCurrentPlayerId(response.playerId);
          setIsHost(joinedRoom.hostId === response.playerId);
          setMessages([]);
          resolve(joinedRoom);
        } else {
          Alert.alert('Error', response.error || 'Failed to join room');
          resolve(null);
        }
      });
    });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leave-room');
    setRoom(null);
    setPlayers([]);
    setMessages([]);
    setIsGameStarted(false);
    setIsHost(false);
    setIsDrawer(false);
    setCurrentWord('');
    setGuessedLetters([]);
    setWrongGuesses(0);
    setRound(1);
    setDrawPoints([]);
  }, []);

  const startGame = useCallback(() => {
    if (!room) return;
    socketRef.current?.emit('start-game', { roomId: room.id }, (response: any) => {
      if (!response.success) {
        Alert.alert('Error', response.error || 'Failed to start game');
      }
    });
  }, [room]);

  const sendHangmanGuess = useCallback((letter: string) => {
    if (!room) return;
    socketRef.current?.emit('hangman-guess', { roomId: room.id, letter }, (response: any) => {
      // Response handled
    });
  }, [room]);

  const sendDraw = useCallback((data: DrawPoint) => {
    if (!room) return;
    socketRef.current?.emit('draw', { roomId: room.id, point: data });
  }, [room]);

  const sendGuess = useCallback((guess: string) => {
    if (!room) return;
    socketRef.current?.emit('guess', { roomId: room.id, guess }, (response: any) => {
      // Response handled
    });
  }, [room]);

  const clearDrawPoints = useCallback(() => {
    setDrawPoints([]);
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      room,
      players,
      currentPlayerId,
      messages,
      currentWord,
      timeLeft,
      isGameStarted,
      isHost,
      isDrawer,
      guessedLetters,
      wrongGuesses,
      round,
      totalRounds,
      drawPoints,
      createRoom,
      joinRoom,
      leaveRoom,
      startGame,
      sendHangmanGuess,
      sendDraw,
      sendGuess,
      clearDrawPoints,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
