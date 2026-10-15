import { StyleSheet, Text, TextInput, View } from 'react-native';

import { theme } from '../constants/theme';

type FormFieldProps = {
  /** The words above the box, such as "Nickname". */
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Shown in red under the box when the value is not allowed. */
  error?: string;
  placeholder?: string;
  /** Adds a * so the person knows this box cannot be left empty. */
  required?: boolean;
  /** "number" for kilometres and years. Leave unset for normal text. */
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  /** Notes need a tall box. Other fields stay one line. */
  multiline?: boolean;
};

/**
 * A labelled text box.
 *
 * WHAT: label, input, and an optional error under it.
 * WHY: every text field on the car form should look and behave the same way.
 */
export function FormField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  required = false,
  keyboardType = 'default',
  multiline = false,
}: FormFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null]}
      />
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
  input: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: theme.colors.text,
    fontSize: theme.text.body,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 14,
  },
});
