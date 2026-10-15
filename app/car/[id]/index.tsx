import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createTodo, deleteCar, deleteTodo, listCars, listTodosForCar, setTodoDone } from '../../../src/api/sheets';
import { TodoItem } from '../../../src/components/TodoItem';
import { getCarIcon } from '../../../src/constants/carIcons';
import { theme } from '../../../src/constants/theme';
import type { Car } from '../../../src/types/car';
import type { Todo } from '../../../src/types/todo';

/**
 * Car details screen.
 *
 * WHAT: the main facts for one car, Edit, Delete, and that car's to-dos.
 * WHY: the list stays short. Tap a card to land here. Edit still uses the shared form.
 *      Pull down to reload the car and its to-dos from the sheet.
 */
export default function CarDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [car, setCar] = useState<Car | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todoError, setTodoError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const firstLoad = useRef(true);

  const load = useCallback(
    async (kind: 'first' | 'refresh') => {
      if (!id) {
        setError('This car has no id.');
        setLoading(false);
        return;
      }

      if (kind === 'first') {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Ask for the car and its to-dos together. One failure should not hide the other.
      const [carResult, todoResult] = await Promise.allSettled([listCars(), listTodosForCar(id)]);

      if (carResult.status === 'fulfilled') {
        const match = carResult.value.find((item) => item.id === id) ?? null;
        if (!match) {
          setCar(null);
          setError('This car is not in the sheet.');
        } else {
          setCar(match);
          setError(null);
        }
      } else {
        const message = carResult.reason instanceof Error ? carResult.reason.message : 'Could not load this car.';
        setError(message);
      }

      if (todoResult.status === 'fulfilled') {
        setTodos(openFirst(todoResult.value));
        setTodoError(null);
      } else {
        const message = todoResult.reason instanceof Error ? todoResult.reason.message : 'Could not load to-dos.';
        setTodoError(message);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      const kind = firstLoad.current ? 'first' : 'refresh';
      firstLoad.current = false;
      load(kind);
    }, [load]),
  );

  async function addTodo() {
    if (busy || !id) {
      return;
    }
    if (title.trim() === '') {
      setTodoError('Please enter what needs doing.');
      return;
    }

    setBusy(true);
    setTodoError(null);
    try {
      await createTodo({
        car_id: id,
        title: title.trim(),
        done: false,
        done_at: '',
      });
      setTitle('');
      setTodos(openFirst(await listTodosForCar(id)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not add this to-do.';
      setTodoError(message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    if (busy || !id) {
      return;
    }

    setBusy(true);
    setTodoError(null);
    try {
      await setTodoDone(todo.id, !todo.done);
      setTodos(openFirst(await listTodosForCar(id)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not update this to-do.';
      setTodoError(message);
    } finally {
      setBusy(false);
    }
  }

  function openEdit() {
    if (busy || !car || car.id === '') {
      return;
    }
    router.push({ pathname: '/car/[id]/edit', params: { id: car.id } });
  }

  function askDeleteTodo(todo: Todo) {
    if (busy) {
      return;
    }
    Alert.alert('Delete this to-do?', `"${todo.title}" will be removed from the sheet.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeTodo(todo) },
    ]);
  }

  async function removeTodo(todo: Todo) {
    if (busy || !id) {
      return;
    }
    if (todo.id === '') {
      setTodoError('This to-do has no id, so it cannot be deleted.');
      return;
    }

    setBusy(true);
    setTodoError(null);
    try {
      await deleteTodo(todo.id);
      setTodos(openFirst(await listTodosForCar(id)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete this to-do.';
      setTodoError(message);
    } finally {
      setBusy(false);
    }
  }

  function askDeleteCar() {
    if (busy || !car) {
      return;
    }
    const name = car.name.trim() === '' ? 'this car' : car.name.trim();
    Alert.alert(
      `Delete ${name}?`,
      'This also deletes its to-dos. You cannot undo this.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete car', style: 'destructive', onPress: () => removeCar() },
      ],
    );
  }

  /**
   * Delete the to-dos one by one, then the car.
   * If a to-do delete fails, the car stays. If the car delete fails, we stay on this screen.
   */
  async function removeCar() {
    if (busy || !id) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const currentTodos = await listTodosForCar(id);
      for (const todo of currentTodos) {
        if (todo.id === '') {
          throw new Error('One to-do has no id, so the car was not deleted.');
        }
        await deleteTodo(todo.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete the to-dos.';
      setError(`The car was not deleted. ${message}`);
      try {
        setTodos(openFirst(await listTodosForCar(id)));
      } catch {
        // The first error is the one we show. A second failure just leaves the list as it is.
      }
      setBusy(false);
      return;
    }

    try {
      await deleteCar(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete this car.';
      setError(`The to-dos were deleted, but the car is still in the sheet. ${message}`);
      setTodos([]);
      setBusy(false);
      return;
    }

    setBusy(false);
    router.back();
  }

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        if (!busy) {
          load('refresh');
        }
      }}
      tintColor={theme.colors.primary}
      colors={[theme.colors.primary]}
    />
  );

  if (loading && !car) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Car' }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.muted}>Loading car…</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <ScrollView style={styles.fill} contentContainerStyle={styles.centered} refreshControl={refreshControl}>
        <Stack.Screen options={{ title: 'Car' }} />
        <Text style={styles.error}>{error ?? 'This car is not in the sheet.'}</Text>
      </ScrollView>
    );
  }

  const brandAndModel = `${car.brand} ${car.model}`.trim();

  return (
    <>
      <Stack.Screen options={{ title: car.name.trim() === '' ? 'Car' : car.name.trim() }} />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.content}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.card}>
          <View style={styles.header}>
            <Image source={getCarIcon(car.icon_key)} style={styles.icon} />
            <View style={styles.headerText}>
              <Text style={styles.name}>{car.name.trim() === '' ? 'Unnamed car' : car.name.trim()}</Text>
              {brandAndModel !== '' ? <Text style={styles.muted}>{brandAndModel}</Text> : null}
            </View>
          </View>
          <Pressable style={[styles.edit, busy && styles.disabled]} onPress={openEdit} disabled={busy}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>

        <Facts car={car} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>To-dos</Text>
          <View style={styles.addRow}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What needs doing?"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              editable={!busy}
            />
            <Pressable
              style={[styles.add, busy && styles.disabled]}
              onPress={addTodo}
              disabled={busy}
            >
              <Text style={styles.addText}>Add</Text>
            </Pressable>
          </View>

          {busy ? <Text style={styles.muted}>Please wait…</Text> : null}
          {todoError ? <Text style={styles.error}>{todoError}</Text> : null}

          {todos.length === 0 && !todoError ? (
            <Text style={styles.muted}>No to-dos yet.</Text>
          ) : (
            todos.map((todo, index) => (
              <TodoItem
                key={todo.id === '' ? `todo-${index}` : todo.id}
                todo={todo}
                disabled={busy}
                onToggle={toggleTodo}
                onDelete={askDeleteTodo}
              />
            ))
          )}
        </View>

        {/* Kept apart from Edit so a delete is a deliberate second step. */}
        <Pressable
          style={[styles.deleteCar, busy && styles.disabled]}
          onPress={askDeleteCar}
          disabled={busy}
        >
          <Text style={styles.deleteCarText}>Delete car</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

/** Open to-dos first, finished ones after them. Order inside each group stays as the sheet sent it. */
function openFirst(todos: Todo[]): Todo[] {
  const open = todos.filter((todo) => !todo.done);
  const done = todos.filter((todo) => todo.done);
  return [...open, ...done];
}

/**
 * The short list of facts. Empty cells are skipped.
 * Tires, oil, and deadlines are their own groups, and a group is hidden when every field is empty.
 */
function Facts({ car }: { car: Car }) {
  const main = [
    fact('Year', car.year === '' ? '' : String(car.year)),
    fact('Mileage', car.mileage === '' ? '' : `${car.mileage.toLocaleString('en-US')} km`),
    fact('Plate', car.plate),
    fact('Fuel', car.fuel_type),
  ].filter((item) => item.value !== '');

  const tires = [
    fact('Tire type', car.tire_type),
    fact('Rims', car.rim_type),
    fact('Tire size', car.tire_size),
    fact('Tire change', car.tire_change_date),
  ].filter((item) => item.value !== '');

  const oilMileage = car.oil_change_mileage === '' ? '' : `${car.oil_change_mileage.toLocaleString('en-US')} km`;
  const oil = [
    fact('Oil type', car.oil_type),
    fact('Oil change', car.oil_change_date),
    fact('Oil change mileage', oilMileage),
  ].filter((item) => item.value !== '');

  const deadlines = [
    fact('Inspection', car.inspection_date),
    fact('Insurance', car.insurance_date),
  ].filter((item) => item.value !== '');

  if (main.length === 0 && tires.length === 0 && oil.length === 0 && deadlines.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      {main.map((item) => (
        <FactLine key={item.label} label={item.label} value={item.value} />
      ))}
      <FactGroup title="Tires" items={tires} />
      <FactGroup title="Oil" items={oil} />
      <FactGroup title="Deadlines" items={deadlines} />
    </View>
  );
}

function fact(label: string, value: string): { label: string; value: string } {
  return { label, value: value.trim() };
}

function FactGroup({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {items.map((item) => (
        <FactLine key={item.label} label={item.label} value={item.value} />
      ))}
    </View>
  );
}

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.screen,
    gap: theme.spacing.gap,
    paddingBottom: 32,
  },
  centered: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.screen,
    gap: theme.spacing.gap,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.card,
    gap: theme.spacing.gap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.gap,
  },
  icon: {
    width: 72,
    height: 72,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  muted: {
    color: theme.colors.textMuted,
    fontSize: theme.text.body,
  },
  edit: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editText: {
    color: theme.colors.onPrimary,
    fontSize: theme.text.body,
    fontWeight: '700',
  },
  fact: {
    gap: 2,
  },
  factLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  factValue: {
    color: theme.colors.text,
    fontSize: theme.text.body,
  },
  group: {
    gap: 8,
    marginTop: 4,
  },
  groupTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: theme.text.body,
  },
  add: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addText: {
    color: theme.colors.onPrimary,
    fontSize: theme.text.body,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.text.body,
  },
  deleteCar: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
  deleteCarText: {
    color: theme.colors.danger,
    fontSize: theme.text.body,
    fontWeight: '700',
  },
});
