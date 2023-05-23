import { initializeConnector, Web3ReactHooks } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

export const [metamask, metamaskHooks] = initializeConnector((actions) => new MetaMask({ actions }));

export type Connector = MetaMask;

export const connectors: [Connector, Web3ReactHooks][] = [[metamask, metamaskHooks]];
