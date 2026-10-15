import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '../src/constants/theme';

/**
 * Root layout.
 *
 * WHAT: the shell around every screen. Expo Router reads the files in `app/`
 *       and shows them inside this stack (a screen that can push the next
 *       screen on top, with a back button).
 * WHY: one place sets the top bar and the page background, so later screens
 *      do not each invent their own colours.
 */
export default function RootLayout() {
  return (
    <>
      {/* Dark icons in the phone status bar, because our pages are light. */}
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { color: theme.colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {/* The file `app/index.tsx` is the first screen. */}
        <Stack.Screen name="index" options={{ title: 'My Cars' }} />
      </Stack>
    </>
  );
}
