import { useDisconnected } from "./use-disconnected";
import { useState } from "./use-state";
import { useMemo } from "./use-memo";
import { useElement } from "./use-element";
import createRouter from "router5";
import browserPlugin from "router5-plugin-browser";

interface RouterOptions {
  routes: {
    [key: string]: any;
  };
  defaultRoute: string;
  baseRoute?: string;
}

const router = createRouter([{ name: "default", path: "*route" }]);
router.usePlugin(
  browserPlugin({
    useHash: true
  })
);
router.start();

//TODO: works but hash handling needs to be tightened up
export function useRouter(options: RouterOptions): any {
  const [timesDisconnected, setTimesDisconnected] = useState(0);
  const element = useElement();

  const routerApi = useMemo(
    function() {
      let route = ""; // the current partial route that this component cares about

      // router5 passes state into the handler with no hash.
      // If default route is defined with it, we need to add it back when processing
      let useHash = options.defaultRoute[0] === "#";

      const handler = (routerState): void => {
        let _route = routerState.route.path;

        // If a defined route matches the current route, use it.
        if (
          options.routes[_route.replace(options.baseRoute, "")] ||
          options.routes[("#" + _route).replace(options.baseRoute, "")]
        ) {
          route = _route;
          element._enqueueUpdate();
          return;
        }

        // If a defined route is a base for the current route, do return the base.
        // This is for parent routers to relax and be okay with what their kids are doing.
        const partialPath = Object.keys(options.routes).reduce((out, routePath) => {
          return _route.indexOf(routePath) === 0 || ("#" + _route).indexOf(routePath) === 0
            ? routePath
            : out;
        }, "");
        if (partialPath) {
          route = partialPath;
          element.requestUpdate();
          return;
        }

        // At this point, if this our baseRoute matches the currentRoute, it means
        // the current route is invalid and we should handle it by redirecting to our default route.
        if (
          _route.indexOf(options.baseRoute) === 0 ||
          ("#" + _route).indexOf(options.baseRoute) === 0
        ) {
          route = options.baseRoute + options.defaultRoute;
          //router.navigate(route, {}, {replace:true});
          const href = window.location.href.replace(window.location.hash, route);
          window.history.replaceState({}, document.title, href);
          element.requestUpdate();
        }
      };

      //subscribe to future changes
      const routerUnsubscribe = router.subscribe(handler);

      //invoke the handler for the current route
      handler({
        route: router.getState()
      });

      //return methods to be invoked elsewhere
      return {
        getRoute: () => {
          // TODO: currently having to do some gymnastics to manage where '#' should be returned
          let tempRoute = route;
          if (tempRoute[0] !== "#" && options.baseRoute[0] === "#") {
            tempRoute = "#" + tempRoute;
          } else if (useHash && tempRoute[0] !== "#") {
            tempRoute = "#" + tempRoute;
          }
          return tempRoute.replace(options.baseRoute, "");
        },
        unsubscribe: routerUnsubscribe
      };

      // using timesDisconnected as a memo is one way to manage subscribing/unsubscribing
    },
    [timesDisconnected]
  );

  useDisconnected(() => {
    routerApi.unsubscribe();
    setTimesDisconnected(timesDisconnected + 1);
  });

  return routerApi.getRoute(); //return the valid partial route that the component will care about
}
