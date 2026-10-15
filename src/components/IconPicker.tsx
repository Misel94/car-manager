import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { carIconKeys, getCarIcon, type CarIconKey } from '../constants/carIcons';
import { theme } from '../constants/theme';

type IconPickerProps = {
  /** The icon_key saved on the car. "" means no choice yet. */
  value: string;
  onChange: (iconKey: string) => void;
};

/** "suv" becomes "Suv" for the label under the picture. */
function iconLabel(iconKey: string): string {
  if (iconKey === '') {
    return 'Default';
  }
  return iconKey.charAt(0).toUpperCase() + iconKey.slice(1);
}

/**
 * The car picture chooser.
 *
 * WHAT: a closed row showing the current icon. Tap it to open a grid.
 * WHY: icon_key must be one of the keys in src/constants/carIcons.ts.
 *      An empty value still shows the default picture, matching the car list.
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Icon</Text>
      <Pressable style={styles.closed} onPress={() => setOpen((current) => !current)}>
        <Image source={getCarIcon(value)} style={styles.preview} />
        <Text style={styles.value}>{iconLabel(value)}</Text>
        <Text style={styles.hint}>{open ? 'Hide' : 'Choose'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.grid}>
          {carIconKeys.map((key) => (
            <IconChoice
              key={key}
              iconKey={key}
              selected={value === key || (value === '' && key === 'default')}
              onPress={() => {
                onChange(key);
                setOpen(false);
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

type IconChoiceProps = {
  iconKey: CarIconKey;
  selected: boolean;
  onPress: () => void;
};

/** One picture in the grid. */
function IconChoice({ iconKey, selected, onPress }: IconChoiceProps) {
  return (
    <Pressable style={[styles.choice, selected && styles.choiceSelected]} onPress={onPress}>
      <Image source={getCarIcon(iconKey)} style={styles.choiceIcon} />
      <Text style={styles.choiceLabel}>{iconLabel(iconKey)}</Text>
    </Pressable>
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
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.gap,
  },
  preview: {
    width: 48,
    height: 48,
  },
  value: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.text.body,
  },
  hint: {
    color: theme.colors.primary,
    fontSize: theme.text.body,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.gap,
  },
  choice: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    gap: 4,
  },
  choiceSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#E8F0FE',
  },
  choiceIcon: {
    width: 56,
    height: 56,
  },
  choiceLabel: {
    color: theme.colors.text,
    fontSize: 14,
  },
});
