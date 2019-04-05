import { getCurrentElement } from "./hooks";

/**
 * Purpose: Returns the current element.  Used mostly from within other hooks.
 * Example Usage:
 * ```
 * const element = useElement();
 * ```
 */
export const useElement = (): HTMLElement => {
  return getCurrentElement();
};
