/** Result of a server action that can fail without throwing */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
