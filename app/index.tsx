import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { listCars } from '../src/api/sheets';
import { CarCard } from '../src/components/CarCard';
import { theme } from '../src/constants/theme';
import type { Car } from '../src/types/car';

/**
 * Car list screen.
 *
 * WHAT: load every car from the Cars sheet and show one card each.
 * WHY: this is the home screen. Pull down to ask the sheet for a fresh list.
 *      Adding and editing a car comes in a later step.
 */
export default function HomeScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ask the sheet for the cars.
   * "first" is the spinner you see when the screen opens.
   * "refresh" is the spinner at the top when you pull down.
   */
  async function loadCars(kind: 'first' | 'refresh') {
    if (kind === 'first') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const nextCars = await listCars();
      setCars(nextCars);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load cars.';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCars('first');
  }, []);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => loadCars('refresh')}
      tintColor={theme.colors.primary}
      colors={[theme.colors.primary]}
    />
  );

  if (loading && cars.length === 0) {
    return (
      <View style={[styles.fill, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.message}>Loading cars…</Text>
      </View>
    );
  }

  if (cars.length === 0) {
    return (
      // ScrollView so pull-to-refresh still works when there is nothing to list.
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.centered}
        refreshControl={refreshControl}
      >
        <Text style={error ? styles.error : styles.message}>
          {error ?? 'No cars yet.'}
        </Text>
        <Pressable style={styles.button} onPress={() => loadCars('first')}>
          <Text style={styles.buttonText}>{error ? 'Try again' : 'Refresh'}</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={cars}
      keyExtractor={(car, index) => (car.id === '' ? `car-${index}` : car.id)}
      renderItem={({ item }) => <CarCard car={item} />}
      refreshControl={refreshControl}
      contentContainerStyle={styles.list}
      // A failed refresh keeps the cards and shows the message above them.
      ListHeaderComponent={
        error ? <Text style={styles.errorBanner}>{error}</Text> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.screen,
    gap: theme.spacing.gap,
  },
  fill: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.screen,
    gap: theme.spacing.gap,
    backgroundColor: theme.colors.background,
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: theme.text.body,
    textAlign: 'center',
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.text.body,
    textAlign: 'center',
  },
  errorBanner: {
    color: theme.colors.danger,
    fontSize: theme.text.body,
    marginBottom: theme.spacing.gap,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.text.body,
    fontWeight: '600',
  },
});
