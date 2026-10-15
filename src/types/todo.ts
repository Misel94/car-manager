/**
 * One row from the "Todos" sheet.
 *
 * WHAT: the six columns id, car_id, title, done, created_at, and done_at.
 * WHY: each to-do belongs to one car. done_at is "" until the box is ticked.
 */
export type Todo = {
  /** Row id. The server creates this. */
  id: string;
  /** The car this to-do belongs to. Matches Car.id. */
  car_id: string;
  /** What needs doing. */
  title: string;
  /** True when the box is ticked. */
  done: boolean;
  /** When the to-do was added. The server sets this. */
  created_at: string;
  /** The day it was finished, as YYYY-MM-DD. "" while it is still open. */
  done_at: string;
};

/**
 * The fields we may send when creating or editing a to-do.
 * The server keeps id and created_at for itself.
 */
export type TodoFields = Omit<Todo, 'id' | 'created_at'>;
