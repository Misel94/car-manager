import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { Todo } from '../types/todo';

type TodoItemProps = {
  todo: Todo;
  /** True while a save is running, so a second tap does not send twice. */
  disabled: boolean;
  onToggle: (todo: Todo) => void;
  /** The details screen asks "Are you sure?" before it calls deleteTodo. */
  onDelete: (todo: Todo) => void;
};

/**
 * One to-do row.
 *
 * WHAT: a checkbox, the title, the finished day, and a small Delete button.
 * WHY: tapping the title ticks or unticks it. Delete is separate so a tick is not a delete.
 *      The details screen does the save.
 */
export function TodoItem({ todo, disabled, onToggle, onDelete }: TodoItemProps) {
  return (
    <View style={[styles.row, disabled && styles.disabled]}>
      <Pressable style={styles.main} onPress={() => onToggle(todo)} disabled={disabled}>
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
      <Pressable onPress={() => onDelete(todo)} disabled={disabled} hitSlop={8}>
        <Text style={styles.delete}>Delete</Text>
      </Pressable>
    </View>
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
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.gap,
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
  delete: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
