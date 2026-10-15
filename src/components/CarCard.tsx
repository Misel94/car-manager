import { Image, StyleSheet, Text, View } from 'react-native';

import { getCarIcon } from '../constants/carIcons';
import { theme } from '../constants/theme';
import type { Car } from '../types/car';

type CarCardProps = {
  car: Car;
};

/**
 * One car on the list screen.
 *
 * WHAT: icon, nickname, "brand model", and the current mileage.
 * WHY: the list stays short. The rest of the car's details come on a later screen.
 */
export function CarCard({ car }: CarCardProps) {
  const nickname = car.name.trim() === '' ? 'Unnamed car' : car.name.trim();
  const brandAndModel = `${car.brand} ${car.model}`.trim();
  const mileage =
    car.mileage === '' ? 'No mileage yet' : `${car.mileage.toLocaleString('en-US')} km`;

  return (
    <View style={styles.card}>
      <Image source={getCarIcon(car.icon_key)} style={styles.icon} />
      <View style={styles.text}>
        <Text style={styles.name}>{nickname}</Text>
        <Text style={styles.details}>{brandAndModel === '' ? 'Brand and model not set' : brandAndModel}</Text>
        <Text style={styles.details}>{mileage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.card,
    gap: theme.spacing.gap,
  },
  icon: {
    width: 64,
    height: 64,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  details: {
    color: theme.colors.textMuted,
    fontSize: theme.text.body,
  },
});
