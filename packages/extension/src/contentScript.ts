import { setStatus, setSelectedCommitment } from "@cryptkeeper/redux";
import { InjectedMessageData, ReduxAction, SelectedIdentity } from "@cryptkeeper/types";
import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

// - Enabled computation caching!
//  - Run "pnpm exec nx run-many --target=build" to run the build script for every project in the monorepo.
//  - Run it again to replay the cached computation.
//  - Run "pnpm exec nx graph" to see the structure of the monorepo.
//  - Learn more at https://nx.dev/recipes/adopting-nx/adding-to-monorepo.

function injectScript() {
  const url = browser.runtime.getURL("js/injected.js");
  const container = document.head || document.documentElement;
  const scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.setAttribute("async", "false");
  container.insertBefore(scriptTag, container.children[0]);
  container.removeChild(scriptTag);

  window.addEventListener("message", (event: MessageEvent<InjectedMessageData>) => {
    const { data } = event;
    if (data && data.target === "injected-contentscript") {
      browser.runtime.sendMessage(data.message).then((res: unknown) => {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: res,
            nonce: data.nonce,
          },
          "*",
        );
      });
    }
  });

  browser.runtime.onMessage.addListener((action: ReduxAction) => {
    switch (action.type) {
      case setSelectedCommitment.type: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, action.payload as SelectedIdentity],
            nonce: "identityChanged",
          },
          "*",
        );
        return;
      }
      case setStatus.type: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null],
            nonce: !(action.payload as { isUnlocked: boolean }).isUnlocked ? "logout" : "login",
          },
          "*",
        );
        return;
      }
      default:
        log.warn("unknown action in content script");
    }
  });
}

try {
  injectScript();
} catch (e) {
  log.error("error occured", e);
}
