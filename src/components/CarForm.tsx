import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { fuelTypes, rimTypes, tireTypes, transmissionTypes } from '../constants/options';
import { theme } from '../constants/theme';
import type { Car, CarFields } from '../types/car';
import { CollapsibleSection } from './CollapsibleSection';
import { DateField } from './DateField';
import { FormField } from './FormField';
import { IconPicker } from './IconPicker';
import { PickerField } from './PickerField';

type CarFormProps = {
  /** Pass the existing car on Edit. Leave it out on Add. */
  initialCar?: Car;
  submitLabel: string;
  /** Add calls createCar. Edit calls updateCar. Throw to keep the form open. */
  onSubmit: (fields: CarFields) => Promise<void>;
};

/**
 * Text for every box. Numbers stay text while the person is typing,
 * then we turn them into numbers only if they pass the checks below.
 */
type FormState = {
  name: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  icon_key: string;
  plate: string;
  fuel_type: string;
  tire_type: string;
  rim_type: string;
  tire_size: string;
  tire_change_date: string;
  oil_type: string;
  oil_change_date: string;
  oil_change_mileage: string;
  inspection_date: string;
  insurance_date: string;
  color: string;
  engine: string;
  transmission: string;
  purchase_date: string;
  tank_capacity: string;
  battery_date: string;
  brake_pads_date: string;
  timing_belt_mileage: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

/**
 * One form for Add and Edit.
 *
 * WHAT: every car field the person can change. id, created_at, and updated_at
 *       are left out because the server fills those in.
 * WHY: the two screens should not each grow their own copy of this long form.
 *
 * Basics stays open. The other groups start closed.
 * Plate and fuel sit in General so Basics stays the short list:
 * nickname, brand, model, year, mileage, and icon.
 */
export function CarForm({ initialCar, submitLabel, onSubmit }: CarFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState(initialCar));
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setField(key: keyof FormState, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSave() {
    // Ignore a second tap while the first save is still running.
    if (saving) {
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please fix the fields marked in red.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await onSubmit(toCarFields(values));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save this car.';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  const tiresHaveError = Boolean(errors.tire_type || errors.rim_type || errors.tire_size || errors.tire_change_date);
  const oilHasError = Boolean(errors.oil_type || errors.oil_change_date || errors.oil_change_mileage);
  const deadlinesHaveError = Boolean(errors.inspection_date || errors.insurance_date);
  const generalHasError = Boolean(
    errors.plate || errors.fuel_type || errors.color || errors.engine || errors.transmission || errors.purchase_date || errors.tank_capacity,
  );
  const serviceHasError = Boolean(errors.battery_date || errors.brake_pads_date || errors.timing_belt_mileage);

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <CollapsibleSection title="Basics" startsOpen forceOpen={Boolean(errors.name || errors.brand || errors.model || errors.year || errors.mileage)}>
        <FormField
          label="Nickname"
          required
          value={values.name}
          onChangeText={(text) => setField('name', text)}
          placeholder="Vandzia"
          error={errors.name}
        />
        <FormField
          label="Brand"
          required
          value={values.brand}
          onChangeText={(text) => setField('brand', text)}
          placeholder="Skoda"
          error={errors.brand}
        />
        <FormField
          label="Model"
          required
          value={values.model}
          onChangeText={(text) => setField('model', text)}
          placeholder="Fabia"
          error={errors.model}
        />
        <FormField
          label="Year"
          value={values.year}
          onChangeText={(text) => setField('year', text)}
          placeholder="2018"
          keyboardType="number-pad"
          error={errors.year}
        />
        <FormField
          label="Current mileage (km)"
          value={values.mileage}
          onChangeText={(text) => setField('mileage', text)}
          placeholder="123456"
          keyboardType="number-pad"
          error={errors.mileage}
        />
        <IconPicker value={values.icon_key} onChange={(iconKey) => setField('icon_key', iconKey)} />
      </CollapsibleSection>

      <CollapsibleSection title="Tires & rims" forceOpen={tiresHaveError}>
        <PickerField
          label="Tire type"
          value={values.tire_type}
          options={tireTypes}
          onChange={(value) => setField('tire_type', value)}
          error={errors.tire_type}
        />
        <PickerField
          label="Rim type"
          value={values.rim_type}
          options={rimTypes}
          onChange={(value) => setField('rim_type', value)}
          error={errors.rim_type}
        />
        <FormField
          label="Tire size"
          value={values.tire_size}
          onChangeText={(text) => setField('tire_size', text)}
          placeholder="205/55 R16"
          error={errors.tire_size}
        />
        <DateField
          label="Tire change date"
          value={values.tire_change_date}
          onChange={(value) => setField('tire_change_date', value)}
          error={errors.tire_change_date}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Oil" forceOpen={oilHasError}>
        <FormField
          label="Oil type"
          value={values.oil_type}
          onChangeText={(text) => setField('oil_type', text)}
          placeholder="5W-30"
          error={errors.oil_type}
        />
        <DateField
          label="Oil change date"
          value={values.oil_change_date}
          onChange={(value) => setField('oil_change_date', value)}
          error={errors.oil_change_date}
        />
        <FormField
          label="Oil change mileage (km)"
          value={values.oil_change_mileage}
          onChangeText={(text) => setField('oil_change_mileage', text)}
          keyboardType="number-pad"
          error={errors.oil_change_mileage}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Deadlines" forceOpen={deadlinesHaveError}>
        <DateField
          label="Inspection date"
          value={values.inspection_date}
          onChange={(value) => setField('inspection_date', value)}
          error={errors.inspection_date}
        />
        <DateField
          label="Insurance date"
          value={values.insurance_date}
          onChange={(value) => setField('insurance_date', value)}
          error={errors.insurance_date}
        />
      </CollapsibleSection>

      <CollapsibleSection title="General" forceOpen={generalHasError}>
        <FormField
          label="Plate"
          value={values.plate}
          onChangeText={(text) => setField('plate', text)}
          error={errors.plate}
        />
        <PickerField
          label="Fuel"
          value={values.fuel_type}
          options={fuelTypes}
          onChange={(value) => setField('fuel_type', value)}
          error={errors.fuel_type}
        />
        <FormField
          label="Color"
          value={values.color}
          onChangeText={(text) => setField('color', text)}
          error={errors.color}
        />
        <FormField
          label="Engine"
          value={values.engine}
          onChangeText={(text) => setField('engine', text)}
          error={errors.engine}
        />
        <PickerField
          label="Transmission"
          value={values.transmission}
          options={transmissionTypes}
          onChange={(value) => setField('transmission', value)}
          error={errors.transmission}
        />
        <DateField
          label="Purchase date"
          value={values.purchase_date}
          onChange={(value) => setField('purchase_date', value)}
          error={errors.purchase_date}
        />
        <FormField
          label="Tank capacity (litres)"
          value={values.tank_capacity}
          onChangeText={(text) => setField('tank_capacity', text)}
          keyboardType="decimal-pad"
          error={errors.tank_capacity}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Service & parts" forceOpen={serviceHasError}>
        <DateField
          label="Battery date"
          value={values.battery_date}
          onChange={(value) => setField('battery_date', value)}
          error={errors.battery_date}
        />
        <DateField
          label="Brake pads date"
          value={values.brake_pads_date}
          onChange={(value) => setField('brake_pads_date', value)}
          error={errors.brake_pads_date}
        />
        <FormField
          label="Timing belt mileage (km)"
          value={values.timing_belt_mileage}
          onChangeText={(text) => setField('timing_belt_mileage', text)}
          keyboardType="number-pad"
          error={errors.timing_belt_mileage}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Notes" forceOpen={Boolean(errors.notes)}>
        <FormField
          label="Notes"
          value={values.notes}
          onChangeText={(text) => setField('notes', text)}
          multiline
          error={errors.notes}
        />
      </CollapsibleSection>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <Pressable
        style={[styles.save, saving && styles.saveDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>{saving ? 'Saving…' : submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

/** Start from a blank car, or from the row we are editing. */
function toFormState(car: Car | undefined): FormState {
  return {
    name: car?.name ?? '',
    brand: car?.brand ?? '',
    model: car?.model ?? '',
    year: car?.year === undefined || car.year === '' ? '' : String(car.year),
    mileage: car?.mileage === undefined || car.mileage === '' ? '' : String(car.mileage),
    icon_key: car?.icon_key ?? '',
    plate: car?.plate ?? '',
    fuel_type: car?.fuel_type ?? '',
    tire_type: car?.tire_type ?? '',
    rim_type: car?.rim_type ?? '',
    tire_size: car?.tire_size ?? '',
    tire_change_date: car?.tire_change_date ?? '',
    oil_type: car?.oil_type ?? '',
    oil_change_date: car?.oil_change_date ?? '',
    oil_change_mileage:
      car?.oil_change_mileage === undefined || car.oil_change_mileage === ''
        ? ''
        : String(car.oil_change_mileage),
    inspection_date: car?.inspection_date ?? '',
    insurance_date: car?.insurance_date ?? '',
    color: car?.color ?? '',
    engine: car?.engine ?? '',
    transmission: car?.transmission ?? '',
    purchase_date: car?.purchase_date ?? '',
    tank_capacity:
      car?.tank_capacity === undefined || car.tank_capacity === '' ? '' : String(car.tank_capacity),
    battery_date: car?.battery_date ?? '',
    brake_pads_date: car?.brake_pads_date ?? '',
    timing_belt_mileage:
      car?.timing_belt_mileage === undefined || car.timing_belt_mileage === ''
        ? ''
        : String(car.timing_belt_mileage),
    notes: car?.notes ?? '',
  };
}

/** Nickname, brand, and model are required. Filled-in number boxes must be numbers. */
function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim() === '') {
    errors.name = 'Please enter a nickname, like Vandzia.';
  }
  if (values.brand.trim() === '') {
    errors.brand = 'Please enter the brand.';
  }
  if (values.model.trim() === '') {
    errors.model = 'Please enter the model.';
  }

  const yearError = wholeNumberError(values.year, 'Year must be a number, like 2018.');
  if (yearError) {
    errors.year = yearError;
  }
  const mileageError = wholeNumberError(values.mileage, 'Mileage must be a number of kilometres.');
  if (mileageError) {
    errors.mileage = mileageError;
  }
  const oilMileageError = wholeNumberError(
    values.oil_change_mileage,
    'Oil change mileage must be a number of kilometres.',
  );
  if (oilMileageError) {
    errors.oil_change_mileage = oilMileageError;
  }
  const beltError = wholeNumberError(
    values.timing_belt_mileage,
    'Timing belt mileage must be a number of kilometres.',
  );
  if (beltError) {
    errors.timing_belt_mileage = beltError;
  }
  const tankError = decimalNumberError(values.tank_capacity, 'Tank capacity must be a number of litres.');
  if (tankError) {
    errors.tank_capacity = tankError;
  }

  return errors;
}

/** Empty is allowed. Anything else must be digits only, so "2018" is ok and "2018abc" is not. */
function wholeNumberError(value: string, message: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') {
    return undefined;
  }
  if (!/^\d+$/.test(trimmed)) {
    return message;
  }
  return undefined;
}

/** Empty is allowed. A tank size may include one decimal point, like 45.5. */
function decimalNumberError(value: string, message: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') {
    return undefined;
  }
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return message;
  }
  return undefined;
}

function blankOrNumber(value: string): number | '' {
  const trimmed = value.trim();
  if (trimmed === '') {
    return '';
  }
  return Number(trimmed);
}

/** Build the object createCar and updateCar send. The server adds id and timestamps. */
function toCarFields(values: FormState): CarFields {
  return {
    name: values.name.trim(),
    brand: values.brand.trim(),
    model: values.model.trim(),
    year: blankOrNumber(values.year),
    mileage: blankOrNumber(values.mileage),
    icon_key: values.icon_key.trim(),
    plate: values.plate.trim(),
    fuel_type: values.fuel_type as CarFields['fuel_type'],
    tire_type: values.tire_type as CarFields['tire_type'],
    rim_type: values.rim_type as CarFields['rim_type'],
    tire_size: values.tire_size.trim(),
    tire_change_date: values.tire_change_date,
    oil_type: values.oil_type.trim(),
    oil_change_date: values.oil_change_date,
    oil_change_mileage: blankOrNumber(values.oil_change_mileage),
    inspection_date: values.inspection_date,
    insurance_date: values.insurance_date,
    color: values.color.trim(),
    engine: values.engine.trim(),
    transmission: values.transmission as CarFields['transmission'],
    purchase_date: values.purchase_date,
    tank_capacity: blankOrNumber(values.tank_capacity),
    battery_date: values.battery_date,
    brake_pads_date: values.brake_pads_date,
    timing_belt_mileage: blankOrNumber(values.timing_belt_mileage),
    notes: values.notes.trim(),
  };
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.screen,
    gap: theme.spacing.gap,
    paddingBottom: 32,
  },
  formError: {
    color: theme.colors.danger,
    fontSize: theme.text.body,
  },
  save: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: theme.colors.onPrimary,
    fontSize: theme.text.body,
    fontWeight: '700',
  },
});
