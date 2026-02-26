import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Line, Circle } from 'react-native-svg';
import { useSocket } from '../../context/SocketContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 60, 300);

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function HangmanGame() {
  const router = useRouter();
  const {
    room, players, currentPlayerId, messages, currentWord, timeLeft,
    isGameStarted, isHost, guessedLetters, wrongGuesses,
    leaveRoom, startGame, sendHangmanGuess,
  } = useSocket();

  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const messagesScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.message?.includes('wins') || lastMsg?.message?.includes('Game Over')) {
      setIsGameOver(true);
      if (lastMsg.message.includes('wins')) {
        const name = lastMsg.message.split(' wins')[0].replace('🏆 ', '');
        setWinner(name);
      }
    }
  }, [messages]);

  const handleLeave = () => {
    Alert.alert('Leave Room', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => { leaveRoom(); router.replace('/(tabs)'); } },
    ]);
  };

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || isGameOver || !isGameStarted) return;
    sendHangmanGuess(letter);
  };

  const getDisplayWord = () => {
    if (!currentWord) return '';
    return currentWord.split('').map(l => guessedLetters.includes(l.toUpperCase()) ? l : '_').join(' ');
  };

  const handleStart = () => {
    setIsGameOver(false);
    setWinner(null);
    startGame();
  };

  // Hangman SVG parts based on wrong guesses
  const renderHangmanParts = () => {
    const cx = CANVAS_SIZE / 2;
    const parts = [];

    if (wrongGuesses >= 1) {
      // Head
      parts.push(<Circle key="head" cx={cx} cy={60} r={18} stroke="#e74c3c" strokeWidth={3} fill="none" />);
    }
    if (wrongGuesses >= 2) {
      // Body
      parts.push(<Line key="body" x1={cx} y1={78} x2={cx} y2={130} stroke="#e74c3c" strokeWidth={3} />);
    }
    if (wrongGuesses >= 3) {
      // Left arm
      parts.push(<Line key="larm" x1={cx} y1={90} x2={cx - 25} y2={110} stroke="#e74c3c" strokeWidth={3} />);
    }
    if (wrongGuesses >= 4) {
      // Right arm
      parts.push(<Line key="rarm" x1={cx} y1={90} x2={cx + 25} y2={110} stroke="#e74c3c" strokeWidth={3} />);
    }
    if (wrongGuesses >= 5) {
      // Left leg
      parts.push(<Line key="lleg" x1={cx} y1={130} x2={cx - 20} y2={160} stroke="#e74c3c" strokeWidth={3} />);
    }
    if (wrongGuesses >= 6) {
      // Right leg
      parts.push(<Line key="rleg" x1={cx} y1={130} x2={cx + 20} y2={160} stroke="#e74c3c" strokeWidth={3} />);
    }

    return parts;
  };

  if (!room) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleLeave} style={styles.exitBtn}>
            <Text style={styles.exitText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.roomName}>🏴 {room.name}</Text>
          <Text style={styles.roomId}>{room.id}</Text>
        </View>
        <View style={styles.headerRight}>
          {isGameStarted && (
            <View style={styles.timerBadge}>
              <Text style={[styles.timerText, timeLeft <= 10 && styles.timerUrgent]}>
                ⏱️ {timeLeft}s
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Word Display */}
        {isGameStarted && (
          <View style={styles.wordSection}>
            <Text style={styles.wordLabel}>Guess the word:</Text>
            <Text style={styles.word}>{getDisplayWord()}</Text>
            <Text style={styles.wrongLabel}>Wrong: {wrongGuesses}/6</Text>
          </View>
        )}

        {/* Hangman Canvas */}
        <View style={styles.canvasWrapper}>
          <Svg width={CANVAS_SIZE} height={200} style={styles.canvas}>
            {/* Gallows */}
            <Line x1={20} y1={185} x2={CANVAS_SIZE - 20} y2={185} stroke="#9ca3af" strokeWidth={3} />
            <Line x1={40} y1={185} x2={40} y2={20} stroke="#9ca3af" strokeWidth={3} />
            <Line x1={40} y1={20} x2={CANVAS_SIZE / 2} y2={20} stroke="#9ca3af" strokeWidth={3} />
            <Line x1={CANVAS_SIZE / 2} y1={20} x2={CANVAS_SIZE / 2} y2={42} stroke="#9ca3af" strokeWidth={2} />
            
            {/* Hangman parts */}
            {renderHangmanParts()}
          </Svg>
        </View>

        {/* Keyboard */}
        {isGameStarted && !isGameOver && (
          <View style={styles.keyboard}>
            {ALPHABET.map((letter) => {
              const isGuessed = guessedLetters.includes(letter);
              const isWrong = currentWord ? !currentWord.toUpperCase().includes(letter) && isGuessed : false;
              const isCorrectGuess = currentWord ? currentWord.toUpperCase().includes(letter) && isGuessed : false;

              return (
                <TouchableOpacity
                  key={letter}
                  style={[
                    styles.key,
                    isCorrectGuess && styles.keyCorrect,
                    isWrong && styles.keyWrong,
                  ]}
                  onPress={() => handleGuess(letter)}
                  disabled={isGuessed || isGameOver}
                >
                  <Text style={styles.keyText}>{letter}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Game Over */}
        {isGameOver && (
          <View style={styles.gameOverSection}>
            <Text style={styles.gameOverText}>
              {winner ? `🎉 ${winner} wins!` : '💀 Game Over!'}
            </Text>
            {currentWord && <Text style={styles.wordReveal}>Word: {currentWord}</Text>}
            {isHost && (
              <TouchableOpacity style={styles.playAgainBtn} onPress={handleStart}>
                <Text style={styles.playAgainText}>Play Again 🔄</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Players */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players ({players.length})</Text>
          <View style={styles.playersList}>
            {[...players].sort((a, b) => b.score - a.score).map((p) => (
              <View key={p.id} style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{p.name}</Text>
                  {p.id === currentPlayerId && <Text style={styles.youBadge}>You</Text>}
                </View>
                <Text style={styles.playerScore}>{p.score}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Chat</Text>
          <ScrollView
            ref={messagesScrollRef}
            style={styles.messagesList}
            onContentSizeChange={() => messagesScrollRef.current?.scrollToEnd()}
          >
            {messages.map((msg) => (
              <View key={msg.id} style={styles.message}>
                <Text style={styles.msgSender}>{msg.playerName}</Text>
                <Text style={styles.msgText}>{msg.message}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Lobby Overlay */}
      {!isGameStarted && !isGameOver && (
        <View style={styles.overlay}>
          <View style={styles.lobby}>
            <Text style={styles.lobbyTitle}>🏴 Hangman Lobby</Text>

            <View style={styles.codeSection}>
              <Text style={styles.codeLabel}>Room Code</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{room.id}</Text>
              </View>
            </View>

            <View style={styles.lobbyPlayersSection}>
              <Text style={styles.lobbyPlayersLabel}>Players ({players.length})</Text>
              {players.map((p) => (
                <View key={p.id} style={styles.lobbyPlayerRow}>
                  <Text style={styles.lobbyPlayerName}>{p.name}</Text>
                  {p.id === currentPlayerId && <Text style={styles.youBadge}>You</Text>}
                  {p.id === room.hostId && <Text style={styles.hostBadge}>👑</Text>}
                </View>
              ))}
            </View>

            {isHost ? (
              <TouchableOpacity
                style={[styles.startBtn, players.length < 1 && styles.startDisabled]}
                onPress={handleStart}
                disabled={players.length < 1}
              >
                <Text style={styles.startText}>Start Game 🚀</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.waitingBox}>
                <Text style={styles.waitingText}>Waiting for host to start...</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 18 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 48, backgroundColor: '#1f2937' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exitBtn: { padding: 6 },
  exitText: { fontSize: 18, color: '#ef4444', fontWeight: 'bold' },
  roomName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  roomId: { fontSize: 12, color: '#9ca3af', backgroundColor: '#374151', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  timerBadge: { backgroundColor: '#374151', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  timerText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  timerUrgent: { color: '#ef4444' },

  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, alignItems: 'center' },

  wordSection: { alignItems: 'center', marginBottom: 16 },
  wordLabel: { fontSize: 14, color: '#9ca3af' },
  word: { fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 6, marginTop: 8 },
  wrongLabel: { fontSize: 14, color: '#ef4444', marginTop: 8 },

  canvasWrapper: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 20, elevation: 4 },
  canvas: { backgroundColor: '#fff' },

  keyboard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 20, maxWidth: 360 },
  key: { width: 42, height: 42, backgroundColor: '#374151', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  keyCorrect: { backgroundColor: '#22c55e' },
  keyWrong: { backgroundColor: '#ef4444' },
  keyText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

  gameOverSection: { alignItems: 'center', marginBottom: 20, padding: 20 },
  gameOverText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  wordReveal: { fontSize: 18, color: '#9ca3af', marginTop: 8 },
  playAgainBtn: { marginTop: 16, backgroundColor: '#22c55e', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  playAgainText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  section: { backgroundColor: '#1f2937', borderRadius: 12, padding: 14, marginBottom: 12, width: '100%' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10 },

  playersList: { gap: 4 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playerName: { color: '#d1d5db', fontSize: 14 },
  youBadge: { backgroundColor: '#7c3aed', color: '#fff', fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  hostBadge: { fontSize: 14 },
  playerScore: { color: '#a78bfa', fontWeight: 'bold', fontSize: 16 },

  messagesList: { maxHeight: 120 },
  message: { backgroundColor: '#374151', padding: 8, borderRadius: 8, marginBottom: 4 },
  msgSender: { color: '#a78bfa', fontSize: 11, fontWeight: 'bold' },
  msgText: { color: '#fff', fontSize: 13, marginTop: 2 },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 100 },
  lobby: { backgroundColor: '#1f2937', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  lobbyTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  codeSection: { alignItems: 'center', marginBottom: 20 },
  codeLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 8 },
  codeBox: { backgroundColor: '#374151', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  codeText: { fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 6, fontFamily: 'monospace' },
  lobbyPlayersSection: { marginBottom: 20 },
  lobbyPlayersLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 8 },
  lobbyPlayerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#374151', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, marginBottom: 4 },
  lobbyPlayerName: { color: '#fff', fontSize: 15, flex: 1 },
  startBtn: { backgroundColor: '#22c55e', padding: 16, borderRadius: 12, alignItems: 'center' },
  startDisabled: { opacity: 0.5 },
  startText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  waitingBox: { backgroundColor: '#374151', padding: 16, borderRadius: 12, alignItems: 'center' },
  waitingText: { color: '#9ca3af', fontSize: 14 },
});
