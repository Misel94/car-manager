import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../src/constants/theme';

/**
 * Home screen.
 *
 * WHAT: the first screen you see when the app opens.
 * WHY: this step only proves the app starts, navigation works, and the
 *      theme is applied. The real car list is added in the next step.
 */
export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>My Cars</Text>
        <Text style={styles.body}>
          The app is running. Your car list will appear on this screen.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.screen,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.card,
    gap: theme.spacing.gap,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.text.title,
    fontWeight: '700',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.text.body,
    lineHeight: 22,
  },
});
