import type { FuelType, RimType, TireType, TransmissionType } from '../constants/options';

/**
 * One row from the "Cars" sheet.
 *
 * WHAT: the 27 car fields (id through notes), plus created_at and updated_at.
 * WHY: the server fills in those last two when a car is created or edited.
 *      Empty cells come back as "". Number cells come back as numbers.
 */
export type Car = {
  /** Row id. The server creates this. We send it when editing or deleting. */
  id: string;
  /** Nickname, such as "Vandzia". Shown big on the card. */
  name: string;
  /** Make, such as "Skoda". */
  brand: string;
  /** Model, such as "Fabia". */
  model: string;
  /** Model year, or "" if not filled in. */
  year: number | '';
  /** Odometer in kilometres, or "" if not filled in. */
  mileage: number | '';
  /** Which picture to show. Unknown values fall back to the default icon. */
  icon_key: string;
  /** summer, winter, or all-season. "" if not set. */
  tire_type: TireType | '';
  /** steel wheel or alloy wheel. "" if not set. */
  rim_type: RimType | '';
  /** Text such as "205/55 R16". */
  tire_size: string;
  /** Text such as "5W-30". */
  oil_type: string;
  /** Last oil change, as YYYY-MM-DD, or "". */
  oil_change_date: string;
  /** Kilometres at the last oil change, or "". */
  oil_change_mileage: number | '';
  /** Licence plate. */
  plate: string;
  /** petrol 95, petrol 98, diesel, LPG, hybrid, or electric. "" if not set. */
  fuel_type: FuelType | '';
  /** Next inspection, as YYYY-MM-DD, or "". */
  inspection_date: string;
  /** Insurance renewal, as YYYY-MM-DD, or "". */
  insurance_date: string;
  /** Paint colour, free text. */
  color: string;
  /** Engine, free text. */
  engine: string;
  /** manual or automatic. "" if not set. */
  transmission: TransmissionType | '';
  /** Purchase date, as YYYY-MM-DD, or "". */
  purchase_date: string;
  /** Fuel tank size in litres, or "". */
  tank_capacity: number | '';
  /** Battery replaced, as YYYY-MM-DD, or "". */
  battery_date: string;
  /** Brake pads replaced, as YYYY-MM-DD, or "". */
  brake_pads_date: string;
  /** Kilometres when the timing belt was changed, or "". */
  timing_belt_mileage: number | '';
  /** Tires last changed, as YYYY-MM-DD, or "". */
  tire_change_date: string;
  /** Free text notes. */
  notes: string;
  /** When the row was created. The server sets this. */
  created_at: string;
  /** When the row was last changed. The server sets this. */
  updated_at: string;
};

/**
 * The fields we may send when creating or editing a car.
 * The server keeps id, created_at, and updated_at for itself.
 */
export type CarFields = Omit<Car, 'id' | 'created_at' | 'updated_at'>;
