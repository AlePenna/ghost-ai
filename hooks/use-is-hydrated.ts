import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during SSR and the hydration render, true after. Use it to gate
 * client-only output (e.g. Clerk components that render nothing until
 * clerk-js loads) so the first client render matches the server HTML.
 */
export function useIsHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
