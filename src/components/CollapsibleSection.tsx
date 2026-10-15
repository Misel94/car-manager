import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

type CollapsibleSectionProps = {
  title: string;
  /** Basics starts open. The other groups start closed so the form stays short. */
  startsOpen?: boolean;
  /** Open this group when one of its fields has an error the person needs to see. */
  forceOpen?: boolean;
  children: ReactNode;
};

/**
 * A titled group that can fold shut.
 *
 * WHAT: a header you tap to show or hide the fields inside.
 * WHY: the car form has many optional fields. Folding them keeps Add and Edit readable.
 */
export function CollapsibleSection({
  title,
  startsOpen = false,
  forceOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(startsOpen);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
    }
  }, [forceOpen]);

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.header} onPress={() => setOpen((current) => !current)}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.toggle}>{open ? 'Hide' : 'Show'}</Text>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.card,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  toggle: {
    color: theme.colors.primary,
    fontSize: theme.text.body,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: theme.spacing.card,
    paddingBottom: theme.spacing.card,
    gap: theme.spacing.gap,
  },
});
