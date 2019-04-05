import { useAsyncFn } from "./use-async-fn";

const LANG = "en";

interface Content {
  [key: string]: any;
}

const getContent = (options): Promise<Content> => {
  //potentially load content from cms here too
  const contentFunc = options[LANG] || options["en"];
  if (!contentFunc) {
    return Promise.resolve(null);
  }
  return contentFunc().then(result => result.default);
};

interface UseContentOptions {
  [key: string]: Function;
}

export const useContent = (options: UseContentOptions): AsyncHookReturnValue => {
  return useAsyncFn(getContent, [options], [true]);
};
