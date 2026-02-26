import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SocketProvider } from '../context/SocketContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SocketProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1a1a2e' },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="hangman/create" 
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen 
            name="hangman/join" 
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen 
            name="hangman/game" 
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen 
            name="scribble/create" 
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen 
            name="scribble/join" 
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen 
            name="scribble/game" 
            options={{ gestureEnabled: false }}
          />
        </Stack>
      </SocketProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
