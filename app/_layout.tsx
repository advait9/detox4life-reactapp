import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync();
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={splash.container}>
        <StatusBar style="light" />
        <Image
          source={require('../assets/icon.png')}
          style={splash.logo}
          resizeMode="contain"
        />
        <Text style={splash.title}>Detox 4 Life</Text>
        <Text style={splash.tagline}>Know what's in your world</Text>
        <Text style={splash.credit}>Made with ♥ & care for a healthier world by Advait Thakur</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scan/product" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="scan/room" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="result/[id]" options={{ presentation: 'card', headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 40,
  },
  credit: {
    position: 'absolute',
    bottom: 48,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
  },
});
