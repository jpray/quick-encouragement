import { useEffect, useElement } from "./wc-toolkit";
import { MDCTextField } from "@material/textfield";
import "./use-mdc-components.scss";

export const useMdcComponents = (): void => {
  const element = useElement();
  //text fields
  useEffect(() => {
    const textFields = Array.from(element.querySelectorAll(".mdc-text-field")).map(el => {
      return new MDCTextField(el);
    });
    return () => {
      textFields.forEach(el => {
        el.destroy();
      });
    };
  }, [element]);
};
