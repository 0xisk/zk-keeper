import * as React from "react";
import * as ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import Popup from "@src/ui/pages/Popup";
import { Provider } from "react-redux";
import configureAppStore from "@src/ui/store/configureAppStore";
import { HashRouter } from "react-router-dom";
import { chains, providers } from "@web3modal/ethereum";
import type { ConfigOptions } from "@web3modal/react";
import { Web3ModalProvider } from "@web3modal/react";

const store = configureAppStore();

const REACT_PUBLIC_PROJECT_ID = "";

// Get projectID at https://cloud.walletconnect.com
if (!REACT_PUBLIC_PROJECT_ID) throw new Error("You need to provide REACT_PUBLIC_PROJECT_ID env variable");

// Configure web3modal
const modalConfig: ConfigOptions = {
  projectId: REACT_PUBLIC_PROJECT_ID,
  theme: "dark",
  accentColor: "green",
  ethereum: {
    appName: "web3Modal",
    autoConnect: true,
    chains: [chains.mainnet],
    providers: [providers.walletConnectProvider({ projectId: REACT_PUBLIC_PROJECT_ID })],
  },
};

browser.runtime.onMessage.addListener(action => {
  if (action?.type) {
    store.dispatch(action);
  }
});

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  browser.runtime.connect();
  ReactDOM.render(
    <Provider store={store}>
      <Web3ModalProvider config={modalConfig}>
        <HashRouter>
          <Popup />
        </HashRouter>
      </Web3ModalProvider>
    </Provider>,
    document.getElementById("popup"),
  );
});
