import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CouponsProvider } from './src/context/CouponsContext';
import { UserProfileProvider } from './src/context/UserProfileContext';
import { AppTabs } from './src/navigation/AppTabs';
import { darkPaperTheme } from './src/theme/paperTheme';

/** Ikony Material dla komponentów react-native-paper (Expo). */
function PaperIcon(props: any) {
  return (
    <MaterialCommunityIcons
      name={props.name}
      size={props.size || 24}
      color={props.color}
    />
  );
}

/** Aplikacja tylko w trybie ciemnym (bez przełącznika motywu). */
export default function App() {
  const [showStartscreen, setShowStartscreen] = React.useState(true);
  const { width: winW, height: winH } = useWindowDimensions();
  const paper = darkPaperTheme;

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: paper.colors.primary,
      background: paper.colors.background,
      card: paper.colors.surface,
      text: paper.colors.onSurface,
      border: paper.colors.outline,
    },
  };

  React.useEffect(() => {
    const t = setTimeout(() => setShowStartscreen(false), 2200);
    return () => clearTimeout(t);
  }, []);

  const splashLogoSize = React.useMemo(() => {
    const maxW = Math.min(winW * 0.78, 360);
    const maxH = Math.min(winH * 0.5, 520);
    return { width: maxW, height: maxH };
  }, [winW, winH]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {showStartscreen ? (
          <View style={styles.startscreen} pointerEvents="box-none">
            <SafeAreaView style={styles.startscreenSafe} edges={['top', 'bottom']}>
              <Image
                source={require('./assets/splash-logo.png')}
                style={splashLogoSize}
                resizeMode="contain"
              />
            </SafeAreaView>
            <StatusBar style="light" />
          </View>
        ) : null}
        <UserProfileProvider>
          <CouponsProvider>
            <PaperProvider
              theme={paper}
              settings={{
                icon: PaperIcon,
              }}
            >
              <NavigationContainer theme={navTheme}>
                <AppTabs />
              </NavigationContainer>
              <StatusBar style="light" />
            </PaperProvider>
          </CouponsProvider>
        </UserProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  startscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
    zIndex: 1000,
  },
  startscreenSafe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
