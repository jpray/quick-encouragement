import { registerHook } from "./hooks";

interface UseStateOptions {
  renderOnUpdate?: boolean;
}

const stateMap = new WeakMap();

const defaultOptions = {
  renderOnUpdate: true
};

const updateState = (options, newValue): void => {
  const currentValue = stateMap.get(options.element).get(options.hookID);
  if (currentValue === newValue) {
    return;
  }
  stateMap.get(options.element).set(options.hookID, newValue);
  if (options.renderOnUpdate) {
    options.element.requestUpdate();
  }
};

/**
 * Prupose: Manage local state within a component
 * Example Usage:
 * ```
 * const [ state, setState ] = useState(initialValue);
 * ```
 */
export const useState = (initialValue, options?: UseStateOptions): any => {
  options = Object.assign({}, defaultOptions, options);

  let [element, hookID] = registerHook("useState");

  //ensure map exists for this element
  if (!stateMap.has(element)) {
    stateMap.set(element, new Map());
  }

  //if no entry for this hookID, store initialValue
  if (!stateMap.get(element).has(hookID)) {
    //get value from callback and store it
    updateState(
      {
        renderOnUpdate: false,
        element: element,
        hookID: hookID
      },
      initialValue
    );
  }

  //return value and a function to update the value
  return [
    stateMap.get(element).get(hookID),
    updateState.bind(null, {
      renderOnUpdate: options.renderOnUpdate,
      element: element,
      hookID: hookID
    })
  ];
};
