import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { listCars, updateCar } from '../../../src/api/sheets';
import { CarForm } from '../../../src/components/CarForm';
import { theme } from '../../../src/constants/theme';
import type { Car, CarFields } from '../../../src/types/car';

/**
 * Edit car screen.
 *
 * WHAT: load this car, fill the same form as Add, then save with updateCar.
 * WHY: there is no "get one car" call. We load the list and keep the matching id.
 *      The details screen comes later, so the list opens this screen for now.
 */
export default function EditCarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setError('This car has no id, so it cannot be edited.');
        setLoading(false);
        return;
      }

      try {
        const cars = await listCars();
        const match = cars.find((item) => item.id === id) ?? null;
        if (cancelled) {
          return;
        }
        if (!match) {
          setError('This car is not in the sheet.');
        } else {
          setCar(match);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Could not load this car.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(fields: CarFields) {
    if (!id) {
      throw new Error('This car has no id, so it cannot be saved.');
    }
    await updateCar(id, fields);
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit car' }} />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.message}>Loading car…</Text>
        </View>
      ) : error || !car ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error ?? 'This car is not in the sheet.'}</Text>
        </View>
      ) : (
        <CarForm initialCar={car} submitLabel="Save changes" onSubmit={handleSubmit} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.screen,
    gap: theme.spacing.gap,
    backgroundColor: theme.colors.background,
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: theme.text.body,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.text.body,
    textAlign: 'center',
  },
});
