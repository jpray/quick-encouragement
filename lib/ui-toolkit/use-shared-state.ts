import { useDisconnected } from "./use-disconnected";
import { useRequestUpdate } from "./use-request-update";

const sharedState = new Map();
const subscribersByKey = new Map();

export const hasSharedState = (stateKey): boolean => {
  return sharedState.has(stateKey);
};

export const getSharedState = (stateKey): any => {
  return sharedState.get(stateKey);
};

export const setSharedState = (stateKey, value): void => {
  sharedState.set(stateKey, value);
  (subscribersByKey.get(stateKey) || []).forEach(updater => {
    updater();
  });
};

export const deleteSharedState = (stateKey): any => {
  return sharedState.delete(stateKey);
};

/**
 * Prupose: Share common state across components
 * Example Usage:
 * ```
 * const [ state, setState ] = useSharedState(stateKey);
 * ```
 */
export const useSharedState = (stateKey: string): [any, Function] => {
  // initialize subscribers Map if needed
  if (!subscribersByKey.get(stateKey)) {
    subscribersByKey.set(stateKey, new Map());
  }

  const requestUpdate = useRequestUpdate();

  subscribersByKey.get(stateKey).set(requestUpdate, requestUpdate);
  useDisconnected(() => {
    subscribersByKey.get(stateKey).delete(requestUpdate);
  });

  return [sharedState.get(stateKey), setSharedState.bind(null, stateKey)];
};
