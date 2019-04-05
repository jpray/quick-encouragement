import { registerHook } from "./hooks";

const defer = Promise.resolve().then.bind(Promise.resolve());

// {element: {hookID: {memo: value}}}
const effectsSetupMap = new WeakMap();
const effectsTeardownMap = new WeakMap();

const _useEffect = (element, hookID, cb, memo = []): void => {
  // don't run effect if element is not connected
  if (!element.isConnected) {
    return;
  }

  //ensure map exists for this element
  if (!effectsSetupMap.has(element)) {
    effectsSetupMap.set(element, new Map());
  }
  if (!effectsTeardownMap.has(element)) {
    effectsTeardownMap.set(element, new Map());
  }

  if (memo.length) {
    //if entry exists for this hookID and memo, short circuit
    if (
      effectsSetupMap.get(element).has(hookID) &&
      effectsSetupMap
        .get(element)
        .get(hookID)
        .reduce((out, val, i) => {
          return out && val === memo[i];
        }, true)
    ) {
      return;
    }
    //else save the memo for later checks
    effectsSetupMap.get(element).set(hookID, memo);
  }

  // at this point we know we are going to run the callback()
  // first check if there is a previously saved teardown defined that we should run first
  if (effectsTeardownMap.get(element) && effectsTeardownMap.get(element).has(hookID)) {
    const teardownFn = effectsTeardownMap.get(element).get(hookID);
    teardownFn();
    effectsTeardownMap.get(element).delete(hookID);
  }

  //run effect, if it returns a teardown function, store it for later
  const result = cb();
  if (typeof result === "function") {
    effectsTeardownMap.get(element).set(hookID, result);
  }
};

/**
 * Purpose: Define a function to be run after the element has rendered.
 *          That function can also return a function to be run on disconnected
 *          to do any cleanup needed.
 *          A memo can be passed in to control whether or not the effect runs after each render.
 * Example Usage:
 * ```
 * useEffect(() => {
 *   // do setup
 *   return () => {
 *     // do teardown
 *   }
 * }, [memo]);
 * ```
 */
export const useEffect = (cb, memo = []): void => {
  const [element, hookID] = registerHook("useEffect");
  // delay with microtask
  defer(_useEffect.bind(null, element, hookID, cb, memo));
};

export const _callAllUseEffectTeardownCallbacks = (element): void => {
  if (effectsSetupMap.has(element)) {
    effectsSetupMap.delete(element);
  }
  if (effectsTeardownMap.has(element)) {
    effectsTeardownMap.get(element).forEach(teardownFn => {
      teardownFn();
    });
    effectsTeardownMap.delete(element);
  }
};
