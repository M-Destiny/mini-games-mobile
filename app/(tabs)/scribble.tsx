import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ScribbleScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 Scribble</Text>
        <Text style={styles.subtitle}>Draw and let others guess!</Text>
      </View>

      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.option, styles.createOption]}
          onPress={() => router.push('/scribble/create')}
        >
          <Text style={styles.optionIcon}>➕</Text>
          <Text style={styles.optionTitle}>Create Room</Text>
          <Text style={styles.optionDesc}>Start a new game room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, styles.joinOption]}
          onPress={() => router.push('/scribble/join')}
        >
          <Text style={styles.optionIcon}>🔗</Text>
          <Text style={styles.optionTitle}>Join Room</Text>
          <Text style={styles.optionDesc}>Enter a room code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rules}>
        <Text style={styles.rulesTitle}>How to Play</Text>
        <Text style={styles.ruleText}>• One player gets a word to draw</Text>
        <Text style={styles.ruleText}>• Others try to guess what it is</Text>
        <Text style={styles.ruleText}>• First to guess correctly wins!</Text>
        <Text style={styles.ruleText}>• Take turns drawing</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  options: {
    gap: 16,
    marginBottom: 40,
  },
  option: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  createOption: {
    backgroundColor: '#7c3aed',
  },
  joinOption: {
    backgroundColor: '#059669',
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rules: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 6,
  },
});
