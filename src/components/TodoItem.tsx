import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Todo } from '../types/todo';

type TodoItemProps = {
  todo: Todo;
  /** True while a save is running, so a second tap does not send twice. */
  disabled: boolean;
  onToggle: (todo: Todo) => void;
};

/**
 * One to-do row.
 *
 * WHAT: a checkbox, the title, and the day it was finished when it is done.
 * WHY: tapping the row ticks or unticks it. The details screen does the save.
 */
export function TodoItem({ todo, disabled, onToggle }: TodoItemProps) {
  return (
    <Pressable
      style={[styles.row, disabled && styles.disabled]}
      onPress={() => onToggle(todo)}
      disabled={disabled}
    >
      <View style={[styles.box, todo.done && styles.boxDone]}>
        {todo.done ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, todo.done && styles.titleDone]}>{todo.title}</Text>
        {todo.done && todo.done_at !== '' ? (
          <Text style={styles.doneAt}>Done {todo.done_at}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.gap,
    paddingVertical: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  box: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  boxDone: {
    backgroundColor: theme.colors.primary,
  },
  check: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.text.body,
  },
  titleDone: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  doneAt: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
});
