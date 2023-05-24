import BigNumber from "bignumber.js";

import { ConnectorNames } from "@cryptkeeper/connectors";
import { mockConnector } from "../connectors";

import type { IUseWalletData } from "@cryptkeeper/react/src/hooks";
import type { BrowserProvider } from "ethers/types/providers";

import { ZERO_ADDRESS } from "@cryptkeeper/constants";
import { getChains } from "@cryptkeeper/config";

export const defaultWalletHookData: IUseWalletData = {
  isActive: false,
  isActivating: false,
  isInjectedWallet: true,
  address: ZERO_ADDRESS,
  balance: new BigNumber(1000),
  chain: getChains()[1],
  connectorName: ConnectorNames.MOCK,
  connector: mockConnector,
  provider: {
    getSigner: jest.fn(),
    getBalance: jest.fn(),
  } as unknown as BrowserProvider,
  onConnect: jest.fn(() => Promise.resolve()),
  onConnectEagerly: jest.fn(() => Promise.resolve()),
  onDisconnect: jest.fn(),
  onLock: jest.fn(),
};
