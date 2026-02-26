import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from '../../context/SocketContext';

export default function ScribbleCreate() {
  const router = useRouter();
  const { createRoom } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!playerName.trim() || !roomName.trim()) return;
    setLoading(true);
    const room = await createRoom(roomName, playerName, 'scribble');
    setLoading(false);
    if (room) {
      router.replace('/scribble/game');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create Room 🎨</Text>
        <Text style={styles.subtitle}>Start a new Scribble game</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#6b7280"
              value={playerName}
              onChangeText={setPlayerName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Room Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter room name"
              placeholderTextColor="#6b7280"
              value={roomName}
              onChangeText={setRoomName}
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (!playerName.trim() || !roomName.trim() || loading) && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={!playerName.trim() || !roomName.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Create Room 🚀</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { flex: 1, padding: 24, paddingTop: 60, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9ca3af', textAlign: 'center', marginBottom: 40 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#d1d5db' },
  input: { backgroundColor: '#374151', borderRadius: 12, padding: 16, fontSize: 16, color: '#ffffff', borderWidth: 1, borderColor: '#4b5563' },
  button: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  cancelButton: { padding: 16, alignItems: 'center' },
  cancelText: { fontSize: 16, color: '#9ca3af' },
});
