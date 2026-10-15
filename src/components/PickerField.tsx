import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

type PickerFieldProps = {
  label: string;
  /** The saved word, or "" when nothing is chosen. */
  value: string;
  /** The exact words from src/constants/options.ts. */
  options: readonly string[];
  onChange: (value: string) => void;
  error?: string;
};

/**
 * A simple dropdown.
 *
 * WHAT: tap the field to show the choices. Tap one to save that word.
 * WHY: fuel, tires, rims, and transmission must use the spellings the sheet expects.
 *      "Not set" saves an empty cell, which the sheet stores as "".
 */
export function PickerField({ label, value, options, onChange, error }: PickerFieldProps) {
  const [open, setOpen] = useState(false);
  const known = value === '' || options.some((option) => option === value);
  // Keep an unexpected sheet value visible so editing does not wipe it by accident.
  const choices = known ? options : [value, ...options];

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.closed, error ? styles.closedError : null]}
        onPress={() => setOpen((current) => !current)}
      >
        <Text style={value === '' ? styles.placeholder : styles.value}>
          {value === '' ? 'Not set' : value}
        </Text>
        <Text style={styles.hint}>{open ? 'Hide' : 'Choose'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.list}>
          <Pressable
            style={styles.choice}
            onPress={() => {
              onChange('');
              setOpen(false);
            }}
          >
            <Text style={styles.choiceText}>Not set</Text>
          </Pressable>
          {choices.map((choice) => (
            <Pressable
              key={choice}
              style={[styles.choice, choice === value && styles.choiceSelected]}
              onPress={() => {
                onChange(choice);
                setOpen(false);
              }}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
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
  closed: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  hint: {
    color: theme.colors.primary,
    fontSize: theme.text.body,
    fontWeight: '600',
  },
  list: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  choice: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  choiceSelected: {
    backgroundColor: '#E8F0FE',
  },
  choiceText: {
    color: theme.colors.text,
    fontSize: theme.text.body,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 14,
  },
});
