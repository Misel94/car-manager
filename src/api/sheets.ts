import type { Car, CarFields } from '../types/car';
import type { Todo, TodoFields } from '../types/todo';

/**
 * The only file that talks to Google Sheets.
 *
 * WHAT: eight functions, one for each list / create / update / delete
 *       on the Cars sheet and the Todos sheet.
 * WHY: screens should not build URLs themselves. If the web app changes,
 *      we fix it here.
 *
 * The address and the secret token come from .env:
 *   EXPO_PUBLIC_API_URL
 *   EXPO_PUBLIC_API_TOKEN
 * They are never written in this file.
 */

const PLACEHOLDER_URL = 'YOUR_DEPLOYMENT_ID';
const PLACEHOLDER_TOKEN = 'replace-with-your-token';

type SheetName = 'Cars' | 'Todos';
type Action = 'create' | 'update' | 'delete';

/**
 * Read the address and token Expo loaded from .env.
 *
 * WHY a clear error: a blank or still-placeholder .env would otherwise fail
 *     with a confusing network message.
 * Restart Expo after you edit .env. Expo only reads that file when it starts.
 */
function readConfig(): { url: string; token: string } {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';
  const token = process.env.EXPO_PUBLIC_API_TOKEN?.trim() ?? '';
  const urlMissing = url === '' || url.includes(PLACEHOLDER_URL);
  const tokenMissing = token === '' || token === PLACEHOLDER_TOKEN;

  if (urlMissing || tokenMissing) {
    throw new Error(
      'Missing Google Sheets setup. In the .env file, set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_TOKEN, then stop Expo and start it again.',
    );
  }

  return { url, token };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** The web app sends { error: "..." } when something is wrong. */
function errorText(body: unknown): string | null {
  if (!isRecord(body) || !('error' in body)) {
    return null;
  }
  if (typeof body.error === 'string' && body.error.trim() !== '') {
    return body.error;
  }
  return 'Google Sheets returned an error.';
}

/**
 * Call the web app and return the JSON body.
 *
 * WHAT: turn network failures and { error } replies into a normal Error
 *       whose message is safe to show on screen.
 * WHY text/plain on POST: the Apps Script web app expects a plain-text body.
 */
async function callApi(url: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error('Could not reach Google Sheets. Check your internet connection and try again.');
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error('Google Sheets sent a reply the app could not read.');
  }

  const message = errorText(body);
  if (message) {
    throw new Error(message);
  }

  if (!response.ok) {
    throw new Error(`Google Sheets returned an error (${response.status}).`);
  }

  return body;
}

/** GET ?sheet=Cars|Todos&token=... and expect { data: rows }. */
async function listRows(sheet: SheetName): Promise<unknown[]> {
  const { url, token } = readConfig();
  const endpoint = `${url}?sheet=${sheet}&token=${encodeURIComponent(token)}`;
  const body = await callApi(endpoint);

  if (!isRecord(body) || !Array.isArray(body.data)) {
    throw new Error(`Google Sheets did not return a ${sheet} list.`);
  }

  return body.data;
}

/**
 * POST { token, sheet, action, data?, id? } and expect { data: row }.
 * create does not send an id. delete does not send data.
 */
async function writeRow(
  sheet: SheetName,
  action: Action,
  extra: { id?: string; data?: object },
): Promise<Record<string, unknown>> {
  const { url, token } = readConfig();
  const payload: { token: string; sheet: SheetName; action: Action; id?: string; data?: object } = {
    token,
    sheet,
    action,
  };

  if (extra.id !== undefined) {
    payload.id = extra.id;
  }
  if (extra.data !== undefined) {
    payload.data = extra.data;
  }

  const body = await callApi(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
  });

  if (!isRecord(body) || !isRecord(body.data)) {
    throw new Error(`Google Sheets did not return the ${sheet} row.`);
  }

  return body.data;
}

function asText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  // The sheet sometimes stores an id as a number. Keep it as text.
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

/** A number stays a number. An empty cell stays "". */
function asNumberOrBlank(value: unknown): number | '' {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (value === '' || value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return '';
}

/**
 * The sheet should send true or false.
 * We also accept "TRUE" / "FALSE" and 1 / 0, which Sheets checkboxes sometimes use.
 */
function asBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 1 || value === '1' || value === 'TRUE' || value === 'true') {
    return true;
  }
  return false;
}

function requireRow(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Google Sheets returned a ${label} row the app could not read.`);
  }
  return value;
}

function toCar(value: unknown): Car {
  const row = requireRow(value, 'car');
  return {
    id: asText(row.id),
    name: asText(row.name),
    brand: asText(row.brand),
    model: asText(row.model),
    year: asNumberOrBlank(row.year),
    mileage: asNumberOrBlank(row.mileage),
    icon_key: asText(row.icon_key),
    tire_type: asText(row.tire_type) as Car['tire_type'],
    rim_type: asText(row.rim_type) as Car['rim_type'],
    tire_size: asText(row.tire_size),
    oil_type: asText(row.oil_type),
    oil_change_date: asText(row.oil_change_date),
    oil_change_mileage: asNumberOrBlank(row.oil_change_mileage),
    plate: asText(row.plate),
    fuel_type: asText(row.fuel_type) as Car['fuel_type'],
    inspection_date: asText(row.inspection_date),
    insurance_date: asText(row.insurance_date),
    color: asText(row.color),
    engine: asText(row.engine),
    transmission: asText(row.transmission) as Car['transmission'],
    purchase_date: asText(row.purchase_date),
    tank_capacity: asNumberOrBlank(row.tank_capacity),
    battery_date: asText(row.battery_date),
    brake_pads_date: asText(row.brake_pads_date),
    timing_belt_mileage: asNumberOrBlank(row.timing_belt_mileage),
    tire_change_date: asText(row.tire_change_date),
    notes: asText(row.notes),
    created_at: asText(row.created_at),
    updated_at: asText(row.updated_at),
  };
}

function toTodo(value: unknown): Todo {
  const row = requireRow(value, 'to-do');
  return {
    id: asText(row.id),
    car_id: asText(row.car_id),
    title: asText(row.title),
    done: asBoolean(row.done),
    created_at: asText(row.created_at),
    done_at: asText(row.done_at),
  };
}

export async function listCars(): Promise<Car[]> {
  const rows = await listRows('Cars');
  return rows.map(toCar);
}

/**
 * Create a car.
 *
 * WHAT: POST action "create" with the form fields. Do not send an id.
 * WHY: the server creates id, created_at, and updated_at.
 *      If this throws, the Add screen shows the message and stays open.
 */
export async function createCar(data: CarFields): Promise<Car> {
  return toCar(await writeRow('Cars', 'create', { data }));
}

/**
 * Update a car.
 *
 * WHAT: POST action "update" with the id and the fields to change.
 * WHY: the server copies those fields onto the existing row and refreshes updated_at.
 *      If this throws, the Edit screen shows the message and stays open.
 */
export async function updateCar(id: string, data: Partial<CarFields>): Promise<Car> {
  return toCar(await writeRow('Cars', 'update', { id, data }));
}

/**
 * Delete one car row.
 *
 * WHAT: POST { token, sheet: "Cars", action: "delete", id }.
 * WHY: this is the delete action the web app already accepts, next to create and update.
 *      We do not send a data object. The token still comes from .env.
 *      A network failure or { error } becomes an English message for the screen.
 */
export async function deleteCar(id: string): Promise<Car> {
  return toCar(await writeRow('Cars', 'delete', { id }));
}

export async function listTodos(): Promise<Todo[]> {
  const rows = await listRows('Todos');
  return rows.map(toTodo);
}

/**
 * To-dos for one car.
 *
 * WHAT: load the Todos sheet, then keep the rows whose car_id matches.
 * WHY: the web app lists a whole sheet. It does not have a "one car" filter.
 *      If this throws, the details screen shows the message.
 */
export async function listTodosForCar(carId: string): Promise<Todo[]> {
  const todos = await listTodos();
  return todos.filter((todo) => todo.car_id === carId);
}

/**
 * Today's date as YYYY-MM-DD, using the phone's local day.
 * done_at uses the same shape as the other dates in the sheet.
 */
function todayStamp(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Create a to-do.
 *
 * WHAT: POST action "create". Do not send an id.
 * WHY: the server fills in id and created_at.
 *      The details screen sends car_id, title, done: false, and done_at: "".
 */
export async function createTodo(data: TodoFields): Promise<Todo> {
  return toTodo(await writeRow('Todos', 'create', { data }));
}

/**
 * Change some fields on a to-do.
 * The server merges `data` into the row with this id.
 */
export async function updateTodo(id: string, data: Partial<TodoFields>): Promise<Todo> {
  return toTodo(await writeRow('Todos', 'update', { id, data }));
}

/**
 * Tick or untick a to-do.
 *
 * WHAT: set done, and set done_at to today or clear it.
 * WHY: a ticked box should remember the day. Unticking clears that day.
 *      This is an update, so the other columns stay as they are.
 */
export async function setTodoDone(id: string, done: boolean): Promise<Todo> {
  return updateTodo(id, {
    done,
    done_at: done ? todayStamp() : '',
  });
}

/**
 * Delete one to-do row.
 *
 * WHAT: POST { token, sheet: "Todos", action: "delete", id }.
 * WHY: same delete action as cars, aimed at the Todos sheet.
 *      The token still comes from .env. Failures are shown as English text.
 */
export async function deleteTodo(id: string): Promise<Todo> {
  return toTodo(await writeRow('Todos', 'delete', { id }));
}
