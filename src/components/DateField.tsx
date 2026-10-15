import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

type DateFieldProps = {
  label: string;
  /** A date as YYYY-MM-DD, or "" when there is no date. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/**
 * Turn a Date into the text the sheet stores.
 * We use the phone's local day, not UTC, so the day does not shift by one.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Read YYYY-MM-DD back into a Date. An empty or broken value opens the picker on today. */
function parseDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return new Date();
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * A date box.
 *
 * WHAT: shows YYYY-MM-DD and opens the Android date picker.
 * WHY: the sheet stores dates as text in that exact shape.
 */
export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  function onPick(event: DateTimePickerEvent, selected?: Date) {
    // Android closes the dialog itself. We hide our copy of the picker too.
    setOpen(false);
    if (event.type === 'set' && selected) {
      onChange(formatDate(selected));
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable style={[styles.closed, error ? styles.closedError : null]} onPress={() => setOpen(true)}>
          <Text style={value === '' ? styles.placeholder : styles.value}>
            {value === '' ? 'Choose a date' : value}
          </Text>
        </Pressable>
        {value !== '' ? (
          <Pressable onPress={() => onChange('')} hitSlop={8}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
      {open ? <DateTimePicker value={parseDate(value)} mode="date" onChange={onPick} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.text.body,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.gap,
  },
  closed: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  closedError: {
    borderColor: theme.colors.danger,
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.text.body,
  },
  placeholder: {
    color: theme.colors.textMuted,
    fontSize: theme.text.body,
  },
  clear: {
    color: theme.colors.primary,
    fontSize: theme.text.body,
    fontWeight: '600',
  },
  error: {
    color: theme.colors.danger,
    fontSize: 14,
  },
});
