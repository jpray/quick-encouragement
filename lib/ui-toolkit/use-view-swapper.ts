import { html, TemplateResult, useState, useElement } from "../../src/shared/wc-toolkit";
import "./use-view-swapper.scss";

const BLUE = "BLUE";
const GREEN = "GREEN";

const FADE_OUT_DELAY = 300;
//this value should be slightly higher than the CSS animation duration
const CLEAR_SLOT_DELAY = 500;

export interface ViewConfig {
  menuPosition?: number;
  menuName?: string;
  dynamicImport?: Function;
  template: TemplateResult;
}

export interface ViewSwapperConfig {
  [key: string]: ViewConfig;
}

function performHeightAnimation(panelEl): void {
  const containerEl = panelEl.parentElement;
  const containerElHeight = containerEl.scrollHeight;
  containerEl.style.height = containerElHeight + "px";
  window.requestAnimationFrame(() => {
    const height = panelEl.scrollHeight;
    containerEl.style.height = height + "px";
    setTimeout(() => {
      containerEl.style.height = "auto";
    }, 1300);
  });
}

// this view swapper can be used with application routers, carousels, or
// most anywhere that you want to smoothly swap out one view for another
//
// TODO: It's a lot to grok at the moment, should be able to simplify it
export const useViewSwapper = ({
  views,
  currentView,
  animateHeight,
  scrollToTop,
  loadingTemplate = null
}: {
  views: ViewSwapperConfig;
  currentView: string;
  scrollToTop?: boolean;
  animateHeight?: boolean;
  loadingTemplate?: TemplateResult;
}): TemplateResult => {
  const viewConfig: ViewConfig = views[currentView] || {
    template: loadingTemplate
  };

  const element = useElement();

  let [blueTemplate, setBlueTemplate] = useState(viewConfig.template);
  let [greenTemplate, setGreenTemplate] = useState(null);
  const [routeTemplate, setRouteTemplate] = useState(null);
  const [previousRouteTemplate, setPreviousRouteTemplate] = useState(null);
  const [showBlue, setShowBlue] = useState(true);
  const [viewSwapTimeout, setViewSwapTimeout] = useState(null);
  const [clearSlot, setClearSlot] = useState("");
  const [clearSlotTimeout, setClearSlotTimeout] = useState(null);

  if (routeTemplate !== viewConfig.template) {
    (viewConfig.dynamicImport ? viewConfig.dynamicImport() : Promise.resolve()).then(() => {
      setRouteTemplate(viewConfig.template);
      setPreviousRouteTemplate(routeTemplate);
    });
  }

  if (routeTemplate) {
    if (previousRouteTemplate === blueTemplate) {
      greenTemplate = routeTemplate;
      setGreenTemplate(greenTemplate);
    } else {
      blueTemplate = routeTemplate;
      setBlueTemplate(blueTemplate);
    }
    setClearSlot(null);
  }

  if (routeTemplate && routeTemplate === blueTemplate && !showBlue) {
    clearTimeout(clearSlotTimeout);
    clearTimeout(viewSwapTimeout);
    setViewSwapTimeout(
      setTimeout(function() {
        setShowBlue(true);
        if (animateHeight) {
          performHeightAnimation(element.querySelector(".view-swapper-blue"));
        }
        if (scrollToTop) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, FADE_OUT_DELAY);
        }
        setClearSlotTimeout(
          setTimeout(function() {
            setClearSlot(GREEN);
          }, CLEAR_SLOT_DELAY)
        );
      }, 0)
    );
  } else if (routeTemplate && routeTemplate === greenTemplate && showBlue) {
    clearTimeout(clearSlotTimeout);
    clearTimeout(viewSwapTimeout);
    setViewSwapTimeout(
      setTimeout(function() {
        setShowBlue(false);
        if (animateHeight) {
          performHeightAnimation(element.querySelector(".view-swapper-green"));
        }
        if (scrollToTop) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, FADE_OUT_DELAY);
        }
        setClearSlotTimeout(
          setTimeout(function() {
            setClearSlot(BLUE);
          }, CLEAR_SLOT_DELAY)
        );
      }, 0)
    );
  }

  return html`
    <div class="view-swapper-container">
      <div class="view-swapper-blue ${showBlue ? "view-swapper--show" : "view-swapper--hide"}">
        ${clearSlot !== BLUE && blueTemplate ? blueTemplate : null}
      </div>
      <div class="view-swapper-green ${showBlue ? "view-swapper--hide" : "view-swapper--show"}">
        ${clearSlot !== GREEN && greenTemplate ? greenTemplate : null}
      </div>
    </div>
  `;
};
