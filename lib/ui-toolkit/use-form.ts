import { registerHook } from "./hooks";
import { useEffect } from "./use-effect";
import { useMemo } from "./use-memo";
import { useRequestUpdate } from "./use-request-update";

const formStateWeakMap = new WeakMap();
const formHookIdWeakMap = new WeakMap();
const formFieldsToValidate = new WeakMap();

export interface FormState {
  values: {
    [key: string]: any;
  };
  errors?: {
    [key: string]: string;
  };
}

interface UseFormOptions {
  initialState?: FormState;
  onSubmit: (formState: FormState) => Promise<void | FormState> | (void | FormState);
  validationRules:
    | {
        [key: string]: Function[];
      }
    | Function;
}

interface ValidationErrors {
  [key: string]: string;
}

const getFormState = (element): any => {
  return formStateWeakMap.get(element) || { values: {}, errors: {} };
};

const getFormErrors = (element): { [key: string]: string } => {
  return formStateWeakMap.get(element).errors;
};

const getFormValues = (element): { [key: string]: string } => {
  return formStateWeakMap.get(element).values;
};

const getFormFieldError = (inputId, value, rules): string => {
  if (!rules[inputId]) {
    return "";
  }
  const error = rules[inputId].reduce((out, rule) => {
    return out ? out : rule(value);
  }, false);
  return error ? error : "";
};

const setFormState = (element, newState): void => {
  formStateWeakMap.set(element, newState);
};

const setFormErrors = (element, errors): void => {
  formStateWeakMap.set(element, {
    values: formStateWeakMap.get(element).values,
    errors: errors
  });
};

const setFormFieldValue = (element, fieldId, value): void => {
  const previousState = formStateWeakMap.get(element);
  formStateWeakMap.set(element, {
    values: {
      ...previousState.values,
      [fieldId]: value
    },
    errors: previousState.errors
  });
};

const resolveValidationRules = (element, validationRules): {} => {
  return typeof validationRules === "function"
    ? validationRules(getFormValues(element))
    : validationRules;
};

const isValidEvent = (element, ev, validationRules): boolean => {
  const formState = formStateWeakMap.get(element);
  const id = ev.target.id;
  return Object.keys(formState.values).includes(id) || Object.keys(validationRules).includes(id);
};

/**
 * Purpose: Validates input fields.  Handles display of errors.  Can use app events as an error source.
 * Example Usage:
 * ```
 * const errors = useForm({
 *   initialState: {
 *     values: {
 *       firstName: ''
 *     }
 *   },
 *   validationRules: {
 *     firstName: [isNotEmpty(), hasLength({min: 2, max: 30})]
 *   },
 *   onSubmit: ({values, errors}) => {
 *     // do form submit logic and optionally return new {values, errors} object
 *   }
 * });
 * ```
 */
export const useForm = (options: UseFormOptions, memo?: any[]): [any, Function] => {
  // register the hook to enforce it only being called once for an element
  const [element, hookID] = registerHook("useForm");
  useMemo(
    () => {
      if (formHookIdWeakMap.has(element) && formHookIdWeakMap.get(element) !== hookID) {
        throw new Error("useForm() must only be called once per element");
      }
      // initialize state
      formHookIdWeakMap.set(element, hookID);
      formStateWeakMap.set(element, {
        values: (options.initialState && options.initialState.values) || {},
        errors: (options.initialState && options.initialState.errors) || {}
      });
      formFieldsToValidate.set(element, []);
    },
    memo ? memo : [JSON.stringify(options.initialState)]
  );

  const requestUpdate = useRequestUpdate();

  useEffect(
    () => {
      function validate(event, rules): void {
        let errors = getFormErrors(element);
        if (errors.form) {
          errors.form = "";
        }
        errors = {
          ...errors,
          [event.target.id]: getFormFieldError(event.target.id, event.target.value, rules)
        };
        setFormErrors(element, errors);
        requestUpdate();
      }

      function onFocusOut(e): void {
        const validationRules = resolveValidationRules(element, options.validationRules);
        if (!isValidEvent(element, e, validationRules)) {
          return;
        }
        setFormFieldValue(element, e.target.id, e.target.value);
        if (!validationRules[e.target.id]) {
          return;
        }
        validate(e, validationRules);
        let fieldsToValidate = formFieldsToValidate.get(element);
        if (!fieldsToValidate.includes(e.target.id)) {
          formFieldsToValidate.set(element, [...fieldsToValidate, e.target.id]);
        }
      }

      function onKeyup(e): void {
        const validationRules = resolveValidationRules(element, options.validationRules);
        if (!isValidEvent(element, e, validationRules)) {
          return;
        }
        let fieldsToValidate = formFieldsToValidate.get(element);
        setFormFieldValue(element, e.target.id, e.target.value);
        if (fieldsToValidate.includes(e.target.id) || fieldsToValidate.includes("*")) {
          validate(e, validationRules);
        }
      }

      async function onSubmit(ev): Promise<void> {
        ev.preventDefault();
        setFormErrors(element, {});
        let fieldsToValidate = formFieldsToValidate.get(element);
        if (!fieldsToValidate.includes("*")) {
          formFieldsToValidate.set(element, [...fieldsToValidate, "*"]);
        }
        const validationRules = resolveValidationRules(element, options.validationRules);
        Array.from(element.querySelectorAll("input"))
          //@ts-ignore //TODO
          .concat(Array.from(element.querySelectorAll("select")))
          .forEach(inputEl => {
            validate({ target: inputEl }, validationRules);
          });
        const currentFormState = getFormState(element);
        const potentialNewState = await options.onSubmit(currentFormState);
        if (potentialNewState && (potentialNewState.values || potentialNewState.errors)) {
          setFormState(element, {
            values: potentialNewState.values || currentFormState.values,
            errors: potentialNewState.errors || currentFormState.errors
          });
          requestUpdate();
        }
      }

      element.addEventListener("focusout", onFocusOut);
      element.addEventListener("change", onFocusOut);
      element.addEventListener("keyup", onKeyup);
      element.addEventListener("input", onKeyup);
      element.addEventListener("submit", onSubmit, true);
      return () => {
        element.removeEventListener("focusout", onFocusOut);
        element.removeEventListener("change", onFocusOut);
        element.removeEventListener("keyup", onKeyup);
        element.removeEventListener("input", onKeyup);
        element.removeEventListener("submit", onSubmit, true);
      };
    },
    memo ? memo : [JSON.stringify(options.validationRules)]
  );

  return [getFormState(element), setFormState.bind(null, element)];
};
