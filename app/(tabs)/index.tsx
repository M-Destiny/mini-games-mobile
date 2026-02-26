import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '../../context/SocketContext';

export default function HomeScreen() {
  const router = useRouter();
  const { isConnected } = useSocket();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Mini Games Hub</Text>
        <Text style={styles.subtitle}>Choose a game to play!</Text>
        <View style={[styles.status, isConnected ? styles.connected : styles.disconnected]}>
          <Text style={styles.statusText}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </Text>
        </View>
      </View>

      <View style={styles.gamesGrid}>
        <TouchableOpacity
          style={[styles.gameCard, styles.scribbleCard]}
          onPress={() => router.push('/scribble')}
        >
          <Text style={styles.gameIcon}>🎨</Text>
          <Text style={styles.gameTitle}>Scribble</Text>
          <Text style={styles.gameDesc}>Draw and guess!</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameCard, styles.hangmanCard]}
          onPress={() => router.push('/hangman')}
        >
          <Text style={styles.gameIcon}>🏴</Text>
          <Text style={styles.gameTitle}>Hangman</Text>
          <Text style={styles.gameDesc}>Guess the word!</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How to Play</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>1. Create or join a room</Text>
          <Text style={styles.infoText}>2. Wait for players to join</Text>
          <Text style={styles.infoText}>3. Start the game!</Text>
          <Text style={styles.infoText}>4. Play and earn points</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Server: mini-games-hub.onrender.com</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 16,
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connected: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  disconnected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gamesGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  gameCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  scribbleCard: {
    backgroundColor: '#7c3aed',
  },
  hangmanCard: {
    backgroundColor: '#dc2626',
  },
  gameIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoSection: {
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
