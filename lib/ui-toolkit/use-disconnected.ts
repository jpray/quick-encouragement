import { registerHook } from "./hooks";

// {element: {hookID: callback}}
const useDisconnectedMap = new WeakMap();

/**
 * Purpose: Define a function to be run when the element is disconnected from the DOM
 * Example Usage:
 * ```
 * useDisconnected(() => {
 *   //do something on disconnected
 * });
 * ```
 */
export const useDisconnected = (cb: Function): void => {
  const [element, hookID] = registerHook("useDisconnected");

  // ensure map exists for this element
  if (!useDisconnectedMap.has(element)) {
    useDisconnectedMap.set(element, new Map());
  }

  // save the callback
  if (!useDisconnectedMap.get(element).has(hookID)) {
    useDisconnectedMap.get(element).set(hookID, cb);
  }
};

// meant to be called by the base element in disconnectedCallback()
export const _callAllUseDisconnectedCallbacks = (element): void => {
  if (useDisconnectedMap.has(element)) {
    useDisconnectedMap.get(element).forEach(cb => {
      cb();
    });
    useDisconnectedMap.delete(element);
  }
};
