import { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';
import { useSocket } from '../../context/SocketContext';

const COLORS = [
  '#1a1a2e', '#ffffff', '#e74c3c', '#2ecc71', '#3498db',
  '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22', '#e91e63',
];

const BRUSH_SIZES = [4, 8, 12, 20];

interface DrawPathData {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 40;
const CANVAS_HEIGHT = CANVAS_WIDTH * 0.75;

export default function ScribbleGame() {
  const router = useRouter();
  const {
    room, players, currentPlayerId, messages, currentWord, timeLeft,
    isDrawer, isGameStarted, isHost, round,
    leaveRoom, startGame, sendDraw, sendGuess, clearDrawPoints, drawPoints,
  } = useSocket();

  const [paths, setPaths] = useState<DrawPathData[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [currentColor, setCurrentColor] = useState('#1a1a2e');
  const [brushSize, setBrushSize] = useState(8);
  const [guess, setGuess] = useState('');
  const messagesScrollRef = useRef<ScrollView>(null);

  const handleTouchStart = useCallback((event: any) => {
    if (!isDrawer || !isGameStarted) return;
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath([{ x: locationX, y: locationY }]);
    sendDraw({ x: locationX, y: locationY, color: currentColor, width: brushSize });
  }, [isDrawer, isGameStarted, currentColor, brushSize, sendDraw]);

  const handleTouchMove = useCallback((event: any) => {
    if (!isDrawer || !isGameStarted || currentPath.length === 0) return;
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
    sendDraw({ x: locationX, y: locationY, color: currentColor, width: brushSize });
  }, [isDrawer, isGameStarted, currentPath.length, currentColor, brushSize, sendDraw]);

  const handleTouchEnd = useCallback(() => {
    if (currentPath.length > 0) {
      setPaths(prev => [...prev, {
        id: Date.now().toString(),
        points: currentPath,
        color: currentColor,
        width: brushSize,
      }]);
    }
    setCurrentPath([]);
  }, [currentPath, currentColor, brushSize]);

  const handleClear = () => {
    setPaths([]);
    clearDrawPoints();
  };

  const handleGuess = () => {
    if (!guess.trim()) return;
    sendGuess(guess.trim());
    setGuess('');
  };

  const handleLeave = () => {
    Alert.alert('Leave Room', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => { leaveRoom(); router.replace('/(tabs)'); } },
    ]);
  };

  const getHint = () => {
    if (!currentWord || isDrawer) return '';
    const len = currentWord.length;
    if (timeLeft > 60) return `${len} letters`;
    if (timeLeft > 40) return `Starts with "${currentWord[0]}"`;
    if (timeLeft > 20 && len > 1) return `Ends with "${currentWord[len - 1]}"`;
    return '';
  };

  const pointsToPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return `M ${pts.map(p => `${p.x} ${p.y}`).join(' L ')}`;
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
          <Text style={styles.roomName}>🎨 {room.name}</Text>
          <Text style={styles.roomId}>{room.id}</Text>
        </View>
        <View style={styles.headerRight}>
          {isGameStarted && (
            <>
              <View style={styles.roundBadge}>
                <Text style={styles.roundText}>R{round}</Text>
              </View>
              <View style={styles.timerBadge}>
                <Text style={[styles.timerText, timeLeft <= 10 && styles.timerUrgent]}>
                  ⏱️ {timeLeft}s
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Word Display */}
        {isGameStarted && (
          <View style={[styles.wordBar, isDrawer ? styles.wordBarDrawer : styles.wordBarGuesser]}>
            <Text style={styles.wordLabel}>{isDrawer ? '✏️ Draw this:' : '🤔 Guess the word!'}</Text>
            <Text style={styles.word}>
              {isDrawer ? currentWord : (currentWord ? currentWord.replace(/[A-Za-z]/g, '_ ') : '')}
            </Text>
            {!isDrawer && getHint() && <Text style={styles.hint}>💡 {getHint()}</Text>}
          </View>
        )}

        {/* Canvas */}
        <View style={styles.canvasWrapper}>
          <View
            style={styles.canvas}
            onStartShouldSetResponder={() => isDrawer && isGameStarted}
            onMoveShouldSetResponder={() => isDrawer && isGameStarted}
            onResponderGrant={handleTouchStart}
            onResponderMove={handleTouchMove}
            onResponderRelease={handleTouchEnd}
          >
            <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
              <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="white" />
              {/* Remote drawing */}
              {drawPoints.map((pt, i) => (
                <Path
                  key={`remote-${i}`}
                  d={`M ${pt.x} ${pt.y} L ${pt.x + 0.5} ${pt.y + 0.5}`}
                  stroke={pt.color}
                  strokeWidth={pt.width}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
              {/* Local paths */}
              {paths.map((path) => (
                <Path
                  key={path.id}
                  d={pointsToPath(path.points)}
                  stroke={path.color}
                  strokeWidth={path.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {/* Current drawing */}
              {currentPath.length > 0 && (
                <Path
                  d={pointsToPath(currentPath)}
                  stroke={currentColor}
                  strokeWidth={brushSize}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
        </View>

        {/* Drawing Tools */}
        {isDrawer && isGameStarted && (
          <View style={styles.tools}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorsRow}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorBtn,
                    { backgroundColor: color },
                    currentColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setCurrentColor(color)}
                />
              ))}
            </ScrollView>
            <View style={styles.brushRow}>
              {BRUSH_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.brushBtn, brushSize === size && styles.brushSelected]}
                  onPress={() => setBrushSize(size)}
                >
                  <View style={[styles.brushDot, { width: Math.min(size, 20), height: Math.min(size, 20) }]} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Text style={styles.clearText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Players */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players ({players.length})</Text>
          <View style={styles.playersList}>
            {players.map((p) => (
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

        {/* Chat / Guesses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isGameStarted && !isDrawer ? '💬 Guess Here' : '💬 Chat'}
          </Text>
          <ScrollView
            ref={messagesScrollRef}
            style={styles.messagesList}
            onContentSizeChange={() => messagesScrollRef.current?.scrollToEnd()}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.message, msg.isCorrect && styles.correctMessage]}
              >
                <Text style={styles.msgSender}>{msg.playerName}</Text>
                <Text style={[styles.msgText, msg.isCorrect && styles.correctText]}>
                  {msg.message} {msg.isCorrect && '✅'}
                </Text>
              </View>
            ))}
          </ScrollView>
          {(!isDrawer || !isGameStarted) && (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder={isGameStarted ? 'Type your guess...' : 'Message...'}
                placeholderTextColor="#6b7280"
                value={guess}
                onChangeText={setGuess}
                onSubmitEditing={handleGuess}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleGuess}>
                <Text style={styles.sendText}>➤</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Lobby Overlay */}
      {!isGameStarted && (
        <View style={styles.overlay}>
          <View style={styles.lobby}>
            <Text style={styles.lobbyTitle}>🎨 Scribble Lobby</Text>

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
                onPress={startGame}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roundBadge: { backgroundColor: '#7c3aed', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roundText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  timerBadge: { backgroundColor: '#374151', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  timerText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  timerUrgent: { color: '#ef4444' },

  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  wordBar: { padding: 14, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  wordBarDrawer: { backgroundColor: 'rgba(124, 58, 237, 0.3)', borderWidth: 1, borderColor: '#7c3aed' },
  wordBarGuesser: { backgroundColor: 'rgba(59, 130, 246, 0.3)', borderWidth: 1, borderColor: '#3b82f6' },
  wordLabel: { fontSize: 12, color: '#d1d5db' },
  word: { fontSize: 26, fontWeight: 'bold', color: '#fff', letterSpacing: 4, marginTop: 4 },
  hint: { fontSize: 13, color: '#fbbf24', marginTop: 4 },

  canvasWrapper: { borderRadius: 12, overflow: 'hidden', marginBottom: 12, elevation: 4 },
  canvas: { backgroundColor: '#fff' },

  tools: { marginBottom: 16, gap: 10 },
  colorsRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  colorBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  colorSelected: { borderColor: '#fff', transform: [{ scale: 1.15 }] },
  brushRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brushBtn: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  brushSelected: { backgroundColor: '#7c3aed' },
  brushDot: { backgroundColor: '#fff', borderRadius: 50 },
  clearBtn: { backgroundColor: '#ef4444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginLeft: 'auto' },
  clearText: { fontSize: 18 },

  section: { backgroundColor: '#1f2937', borderRadius: 12, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10 },

  playersList: { gap: 4 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playerName: { color: '#d1d5db', fontSize: 14 },
  youBadge: { backgroundColor: '#7c3aed', color: '#fff', fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  hostBadge: { fontSize: 14 },
  playerScore: { color: '#a78bfa', fontWeight: 'bold', fontSize: 16 },

  messagesList: { maxHeight: 160, marginBottom: 10 },
  message: { backgroundColor: '#374151', padding: 8, borderRadius: 8, marginBottom: 4 },
  correctMessage: { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderWidth: 1, borderColor: '#22c55e' },
  msgSender: { color: '#a78bfa', fontSize: 11, fontWeight: 'bold' },
  msgText: { color: '#fff', fontSize: 13, marginTop: 2 },
  correctText: { color: '#22c55e' },

  inputRow: { flexDirection: 'row', gap: 8 },
  chatInput: { flex: 1, backgroundColor: '#374151', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 14 },
  sendBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8 },
  sendText: { fontSize: 18, color: '#fff' },

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
