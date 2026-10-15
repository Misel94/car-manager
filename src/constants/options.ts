/**
 * Choices for the dropdowns on the car form.
 *
 * WHAT: the exact words we save in the Google Sheet.
 * WHY: the form and the sheet must use the same spelling. If you add a new
 *      choice, add it here and the form will offer it later.
 */

/** Fuel column `fuel_type`. */
export const fuelTypes = [
  'petrol 95',
  'petrol 98',
  'diesel',
  'LPG',
  'hybrid',
  'electric',
] as const;

/** Tire column `tire_type`. */
export const tireTypes = ['summer', 'winter', 'all-season'] as const;

/** Rim column `rim_type`. */
export const rimTypes = ['steel wheel', 'alloy wheel'] as const;

/** Gearbox column `transmission`. */
export const transmissionTypes = ['manual', 'automatic'] as const;

export type FuelType = (typeof fuelTypes)[number];
export type TireType = (typeof tireTypes)[number];
export type RimType = (typeof rimTypes)[number];
export type TransmissionType = (typeof transmissionTypes)[number];
