import { useDisconnected } from "./use-disconnected";
import { useElement } from "./use-element";

const subscribersByKey = new Map();

export const dispatchEvent = (eventKey, value): void => {
  (subscribersByKey.get(eventKey) || []).forEach(elMap => {
    elMap.set("value", value);
    let callback = elMap.get("callback");
    callback();
  });
};

/**
 * Purpose: Returns the value of an event when triggered
 * Example Usage:
 * ```
 * const [ value, dispatchEvent ] = useEvent(eventKey);
 * ```
 */
export const useEvent = (eventKey): [any, Function] => {
  const element = useElement();

  // initialize subscribers Map if needed
  if (!subscribersByKey.has(eventKey)) {
    subscribersByKey.set(eventKey, new Map());
  }
  // initialize the value for this subscription if needed
  if (!subscribersByKey.get(eventKey).has(element)) {
    subscribersByKey.get(eventKey).set(element, new Map());
  }

  subscribersByKey
    .get(eventKey)
    .get(element)
    //@ts-ignore TODO: use LitElement or PruElement instead of HTMLElement
    .set("callback", element.requestUpdate.bind(element));

  useDisconnected(() => {
    subscribersByKey.get(eventKey).delete(element);
  });

  // if there is a value for the event, return it and delete our subscription
  let value;
  if (
    subscribersByKey
      .get(eventKey)
      .get(element)
      .has("value")
  ) {
    value = subscribersByKey
      .get(eventKey)
      .get(element)
      .get("value");
    subscribersByKey.get(eventKey).delete(element);
  }

  return [value, dispatchEvent.bind(null, eventKey)];
};
