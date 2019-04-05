let hooksState;

function getStack(): string {
  const stack = new Error().stack;
  if (stack) {
    return stack;
  }
  // if stack wasn't attached to error object, then this is IE and we need to throw to get it
  try {
    throw new Error();
  } catch (err) {
    return err.stack;
  }
}

const hooksNS = {
  // Defining unique function name as a property on an object to avoid it being renamed
  // by bundlers.
  // TODO: consider generating a unique function name at runtime
  _renderWithHooks2T8oJuey38dMDspPh9: renderFn => {
    return renderFn();
  }
};

const onStartOfElementRender = (element): void => {
  hooksState = {
    currentElement: element,
    renderIsInProgress: true,
    hookExecutedThisRenderByStackTrace: {}
  };
};

const onEndOfElementRender = (): void => {
  hooksState = {
    currentElement: null,
    renderIsInProgress: false,
    hookExecutedThisRenderByStackTrace: {}
  };
};

export const renderWithHooks = (element, renderFn): any => {
  onStartOfElementRender(element);
  const renderResult = hooksNS._renderWithHooks2T8oJuey38dMDspPh9(renderFn);
  onEndOfElementRender();
  return renderResult;
};

export const getCurrentElement = (): HTMLElement => {
  return hooksState.currentElement;
};

export const registerHook = (name): [HTMLElement, string] => {
  if (!hooksState.renderIsInProgress) {
    throw new Error(
      `Hooks must be called from within an element's render() method. ${name} was not.`
    );
  }

  const stack = getStack();
  const stackTraceId = stack.substring(0, stack.indexOf("_renderWithHooks2T8oJuey38dMDspPh9"));
  if (typeof hooksState.hookExecutedThisRenderByStackTrace[stackTraceId] === "undefined") {
    hooksState.hookExecutedThisRenderByStackTrace[stackTraceId] = true;
  } else {
    throw new Error(
      `The ${name} hook appears to be called within a loop.  Hooks within loops is not supported.`
    );
    // if wanting to support loops, something would have to be done here.  Can't see any good solution.
  }

  const id = stackTraceId;

  return [hooksState.currentElement, id];
};
