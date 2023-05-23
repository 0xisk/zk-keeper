import BigNumber from "bignumber.js";

import { ConnectorNames } from "packages/extension/src/connectors";
import { mockConnector } from "packages/extension/src/connectors/mock";

import type { IUseWalletData } from "packages/extension/src/ui/hooks/wallet";
import type { BrowserProvider } from "ethers/types/providers";

import { ZERO_ADDRESS } from "../const";
import { getChains } from "../rpc";

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
  onConnect: jest.fn(),
  onConnectEagerly: jest.fn(),
  onDisconnect: jest.fn(),
  onLock: jest.fn(),
};
