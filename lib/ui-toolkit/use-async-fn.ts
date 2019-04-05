import { useState } from "./use-state";
import { useMemo } from "./use-memo";

interface UseAsyncFnOptions {
  fn: (...args: any[]) => Promise<any>;
  args?: any[];
  memo: any;
}

/**
 * Purpose: Returns the result from an async function.
 * Example Usage:
 * ```
 * const [ result, error, isLoading ] = useAsyncFn(asyncFunc, arg1, arg2 ...);
 * ```
 */
export const useAsyncFn = (fn: Function, args: any[], memo: any[]): AsyncHookReturnValue => {
  const [{ value, isRejected, isLoading }, setState] = useState({
    value: undefined,
    isRejected: false,
    isLoading: true
  });

  useMemo(() => {
    fn(...args)
      .then(result => {
        setState({ value: result, isRejected: false, isLoading: false });
      })
      .catch(err => {
        setState({ value: err, isRejected: true, isLoading: false });
      });
  }, memo);

  return [isRejected ? undefined : value, isRejected ? value : undefined, isLoading];
};
