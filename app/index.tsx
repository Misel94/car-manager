import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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
 * WHY: this is the home screen. Pull down to refresh. Tap + to add a car.
 *      Tap a card to open its details. Edit is a button on that screen.
 *      Coming back from Add or Edit focuses this screen, which reloads the list.
 */
export default function HomeScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstLoad = useRef(true);

  /**
   * Ask the sheet for the cars.
   * "first" is the spinner you see when the screen opens.
   * "refresh" is the spinner at the top when you pull down or come back from a save.
   */
  const loadCars = useCallback(async (kind: 'first' | 'refresh') => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      const kind = firstLoad.current ? 'first' : 'refresh';
      firstLoad.current = false;
      loadCars(kind);
    }, [loadCars]),
  );

  function openNewCar() {
    router.push('/car/new');
  }

  function openDetails(car: Car) {
    if (car.id === '') {
      return;
    }
    router.push({ pathname: '/car/[id]', params: { id: car.id } });
  }

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => loadCars('refresh')}
      tintColor={theme.colors.primary}
      colors={[theme.colors.primary]}
    />
  );

  let body;
  if (loading && cars.length === 0) {
    body = (
      <View style={[styles.fill, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.message}>Loading cars…</Text>
      </View>
    );
  } else if (cars.length === 0) {
    body = (
      // ScrollView so pull-to-refresh still works when there is nothing to list.
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.centered}
        refreshControl={refreshControl}
      >
        <Text style={error ? styles.error : styles.message}>
          {error ?? 'No cars yet. Tap + to add one.'}
        </Text>
        <Pressable style={styles.button} onPress={() => loadCars('first')}>
          <Text style={styles.buttonText}>{error ? 'Try again' : 'Refresh'}</Text>
        </Pressable>
      </ScrollView>
    );
  } else {
    body = (
      <FlatList
        data={cars}
        keyExtractor={(car, index) => (car.id === '' ? `car-${index}` : car.id)}
        renderItem={({ item }) => (
          <Pressable onPress={() => openDetails(item)}>
            <CarCard car={item} />
          </Pressable>
        )}
        refreshControl={refreshControl}
        contentContainerStyle={styles.list}
        // A failed refresh keeps the cards and shows the message above them.
        ListHeaderComponent={error ? <Text style={styles.errorBanner}>{error}</Text> : null}
      />
    );
  }

  return (
    <>
      {/* The + stays in the top bar on every state of this screen. */}
      <Stack.Screen
        options={{
          title: 'My Cars',
          headerRight: () => <AddButton onPress={openNewCar} />,
        }}
      />
      {body}
    </>
  );
}

/** The + in the top bar. It opens the empty Add form. */
function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.addButton}>
      <Text style={styles.addButtonText}>+</Text>
    </Pressable>
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
  addButton: {
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 36,
  },
});
