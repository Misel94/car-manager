import { Stack, useRouter } from 'expo-router';

import { createCar } from '../../src/api/sheets';
import { CarForm } from '../../src/components/CarForm';
import type { CarFields } from '../../src/types/car';

/**
 * Add car screen.
 *
 * WHAT: an empty form. Save calls createCar, then goes back to the list.
 * WHY: the list reloads when this screen closes, so the new car shows up.
 */
export default function NewCarScreen() {
  const router = useRouter();

  async function handleSubmit(fields: CarFields) {
    await createCar(fields);
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add car' }} />
      <CarForm submitLabel="Save car" onSubmit={handleSubmit} />
    </>
  );
}
