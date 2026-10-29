// Members whose profile shows the "suspended" view. Add a handle (without
// the @) to suspend someone, remove it to restore them.
export const SUSPENDED_HANDLES = ["maheshs", "manthiramurthyvishwa"];

export function isSuspendedHandle(handle: string | null | undefined): boolean {
  return !!handle && SUSPENDED_HANDLES.includes(handle.trim().toLowerCase());
}
