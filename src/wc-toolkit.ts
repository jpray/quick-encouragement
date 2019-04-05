import { LitElement, html, TemplateResult } from "lit-element";
import { _callAllUseEffectTeardownCallbacks } from "../lib/ui-toolkit/use-effect";
import { _callAllUseDisconnectedCallbacks } from "../lib/ui-toolkit/use-disconnected";
import { renderWithHooks } from "../lib/ui-toolkit/hooks";

export * from "../lib/ui-toolkit/index";
export * from "../lib/ui-toolkit/use-shared-state";
export * from "../lib/ui-toolkit/use-form";
export * from "../lib/ui-toolkit/use-request-update";
export * from "../lib/ui-toolkit/use-element";
export * from "../lib/ui-toolkit/use-content";

interface DefineOptions {
  useShadowDOM?: boolean;
  props?: any;
}

const defineDefaultOptions = {
  useShadowDOM: false,
  props: {}
};

const define = (tagName: string, renderFn: Function, options: DefineOptions = {}): void => {
  options = Object.assign({}, defineDefaultOptions, options);

  customElements.define(
    tagName,
    class extends LitElement {
      static get properties(): any {
        return options.props;
      }

      createRenderRoot(): Element | ShadowRoot {
        return options.useShadowDOM ? this.attachShadow({ mode: "open" }) : this;
      }

      render(): TemplateResult {
        return renderWithHooks(this, renderFn.bind(this, this));
      }

      disconnectedCallback(): void {
        _callAllUseEffectTeardownCallbacks(this);
        _callAllUseDisconnectedCallbacks(this);
        super.disconnectedCallback();
      }
    }
  );
};

export { html, define, TemplateResult };
