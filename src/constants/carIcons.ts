import { ImageSourcePropType } from 'react-native';

/**
 * Car pictures shown on each card.
 *
 * HOW TO ADD A NEW ICON
 * 1. Draw or export a PNG that is 256 by 256 pixels, with a transparent
 *    background, and smaller than 100 KB.
 * 2. Drop the file in assets/car-icons/. Example: pickup.png
 * 3. Add one line to the carIcons map below:
 *      pickup: require('../../assets/car-icons/pickup.png'),
 * The word on the left (pickup) is what you store in the sheet column icon_key.
 * You do not need to edit any other list. The picker reads the keys from this map.
 *
 * If icon_key is empty or is a word we do not know, the app shows `default`.
 */

export const carIcons = {
  default: require('../../assets/car-icons/default.png'),
  sedan: require('../../assets/car-icons/sedan.png'),
  suv: require('../../assets/car-icons/suv.png'),
  hatchback: require('../../assets/car-icons/hatchback.png'),
  wagon: require('../../assets/car-icons/wagon.png'),
  van: require('../../assets/car-icons/van.png'),
} as const;

/** One of the keys in the map above. */
export type CarIconKey = keyof typeof carIcons;

/**
 * Every icon key, in the order they are written above.
 * The icon picker uses this list later.
 */
export const carIconKeys = Object.keys(carIcons) as CarIconKey[];

/**
 * Pick the picture for a car.
 *
 * WHAT: look up icon_key in the map.
 * WHY: an empty cell or a typo should still show a car, not a broken image.
 */
export function getCarIcon(iconKey: string): ImageSourcePropType {
  if (iconKey !== '' && Object.prototype.hasOwnProperty.call(carIcons, iconKey)) {
    return carIcons[iconKey as CarIconKey];
  }
  return carIcons.default;
}
