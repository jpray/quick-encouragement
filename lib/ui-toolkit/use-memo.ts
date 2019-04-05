import { registerHook } from "./hooks";

const memosMap = new WeakMap();

/**
 * Purpose: Executes the provided function only if the memo value has changed.  Otherwise
 *          returns the result from the last time the function was executed.
 * Example Usage:
 * ```
 * const result = useMemo(() => {
 *   return Math.random();
 * }, [true]);
 * ```
 */
export const useMemo = (cb: Function, memo: any[] = []): any => {
  const [element, hookID] = registerHook("useMemo");

  //ensure map exists for this element
  if (!memosMap.has(element)) {
    memosMap.set(element, new Map());
  }

  //ensure map exists for this hookID
  if (!memosMap.get(element).has(hookID)) {
    memosMap.get(element).set(hookID, {
      memo: [],
      value: undefined
    });
  }

  // if no memo defined or not a match to previous,
  // get value from callback and store it
  if (
    memo.length === 0 ||
    !memosMap.get(element).has(hookID) ||
    memosMap.get(element).get(hookID).memo.length === 0 ||
    !memosMap
      .get(element)
      .get(hookID)
      .memo.reduce((out, val, i) => {
        return out && val === memo[i];
      }, true)
  ) {
    memosMap.get(element).set(hookID, {
      memo: memo,
      value: cb()
    });
  }

  //return the memoized value
  return memosMap.get(element).get(hookID).value;
};
