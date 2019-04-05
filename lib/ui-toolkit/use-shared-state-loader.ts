import { usePromise } from "./use-promise";
import { getSharedState, setSharedState, hasSharedState, useSharedState } from "./use-shared-state";

const stateKeyPromiseMap = new Map();
const stateKeyErrorMap = new Map();

/**
 * Purpose: Returns value from shared state if present, else loads it from an async function.
 *          Does not listener for updates to sharedState after returning a value.
 *          Functions should use this.
 *          Components should use useSharedStateLoader() instead.
 * Example Usage:
 * ```
 * const result = sharedStateLoader(stateKey, asyncFn);
 * ```
 */
export const sharedStateLoader = (stateKey: string, asyncFn: () => Promise<any>): Promise<any> => {
  if (hasSharedState(stateKey)) {
    return Promise.resolve(getSharedState(stateKey));
  }

  //if error, return error with same signature as usePromise
  if (stateKeyErrorMap.has(stateKey)) {
    return Promise.reject(stateKeyErrorMap.get(stateKey));
  }

  //if no promise is in progress, call the async function and store promise;
  if (!stateKeyPromiseMap.has(stateKey)) {
    const promise = asyncFn()
      .then(result => {
        //data is loaded, save to shared state, reset the promise, return user
        setSharedState(stateKey, result);
        stateKeyPromiseMap.delete(stateKey);
        return result;
      })
      .catch(err => {
        stateKeyErrorMap.set(stateKey, err);
        stateKeyPromiseMap.delete(stateKey);
        throw err;
      });
    stateKeyPromiseMap.set(stateKey, promise);
  }
  //promise is pending, return it
  return stateKeyPromiseMap.get(stateKey);
};

/**
 * Purpose: Returns value from shared state if present, else loads it from an async function.
 * Example Usage:
 * ```
 * const [ result, error, isLoading ] = useSharedStateLoader(stateKey, asyncFn);
 * ```
 */
export const useSharedStateLoader = (stateKey: string, asyncFn: Function): AsyncHookReturnValue => {
  //if sharedState is updated from somewhere else, this will ensure the component is rerendered
  useSharedState(stateKey);

  //use resolved value or error as memo
  return usePromise(
    sharedStateLoader(stateKey, asyncFn),
    [getSharedState(stateKey) || stateKeyErrorMap.get(stateKey)],
    { hookID: stateKey }
  );
};
