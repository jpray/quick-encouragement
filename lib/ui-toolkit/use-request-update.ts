import { getCurrentElement } from "./hooks";

/**
 * Purpose: Returns a function that can be called to request the component to render.
 * Example Usage:
 * ```
 * const requestUpdate = useRequestUpdate();
 * ```
 */
export const useRequestUpdate = (): Function => {
  const element = getCurrentElement();
  // _enqueueUpdate() is a LitElement thing but this can be swapped out later if needed
  return element._enqueueUpdate.bind(element);
};
