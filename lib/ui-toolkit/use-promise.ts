import { useState } from "./use-state";
import { useMemo } from "./use-memo";

/**
 * Purpose: Returns the result from a promise.
 * Example Usage:
 * ```
 * const [ result, error, isPending ] = usePromise(promise, memo);
 * ```
 */
export const usePromise = (promise, memo): AsyncHookReturnValue => {
  const [{ value, isRejected, isLoading }, setState] = useState({
    value: undefined,
    isRejected: false,
    isLoading: true
  });

  useMemo(
    () => {
      promise
        .then(result => {
          setState({ value: result, isRejected: false, isLoading: false });
        })
        .catch(err => {
          setState({ value: err, isRejected: true, isLoading: false });
        });
    },
    memo ? memo : [promise]
  );
  return [isRejected ? undefined : value, isRejected ? value : undefined, isLoading];
};
