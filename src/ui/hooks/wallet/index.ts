import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { formatUnits } from "ethers";
import { useCallback, useEffect, useState } from "react";

import { Chain, getChains } from "@src/config/rpc";
import { ConnectorNames, getConnectorName } from "@src/connectors";
import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { Connector } from "@web3-react/types";
import type { BrowserProvider } from "ethers/types/providers";

export interface IUseWalletData {
  isActive: boolean;
  isActivating: boolean;
  address?: string;
  balance?: BigNumber;
  chain?: Chain;
  connectorName?: ConnectorNames;
  connector?: Connector;
  provider?: BrowserProvider;
  onConnect: () => Promise<void>;
  onConnectEagerly: () => Promise<void>;
  onLock: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export const useWallet = (): IUseWalletData => {
  const [balance, setBalance] = useState<BigNumber>();
  const { connector, isActive, isActivating, provider, hooks } = useWeb3React();
  const connectorName = getConnectorName(connector);

  const handlers = hooks;
  const chains = getChains();

  const chainId = handlers?.usePriorityChainId();
  const address = handlers?.usePriorityAccount();
  const chain = chainId ? chains[chainId] : undefined;
  const decimals = chain?.nativeCurrency.decimals;

  useEffect(() => {
    if (!address || !provider) {
      return;
    }

    provider
      .getBalance(address)
      .then((wei) => new BigNumber(formatUnits(wei.toString(), decimals)))
      .then((value) => setBalance(value));
  }, [address, chainId, provider, decimals, setBalance]);

  const onConnect = useCallback(async () => {
    await postMessage({ method: RPCAction.SET_CONNECT_WALLET, payload: { isDisconnectedPermanently: false } });
    await connector.activate();
  }, [connector]);

  const onConnectEagerly = useCallback(async () => {
    const response = await postMessage<{ isDisconnectedPermanently: boolean }>({
      method: RPCAction.GET_CONNECT_WALLET,
    });

    if (!response?.isDisconnectedPermanently) {
      await connector.connectEagerly?.();
    }
  }, [connector]);

  const onDisconnect = useCallback(async () => {
    await connector.deactivate?.();
    await connector.resetState();

    await postMessage({ method: RPCAction.SET_CONNECT_WALLET, payload: { isDisconnectedPermanently: true } });
  }, [connector]);

  const onLock = useCallback(async () => {
    await postMessage({ method: RPCAction.LOCK });
  }, []);

  return {
    isActive,
    isActivating,
    address,
    balance,
    chain,
    connectorName,
    connector,
    provider: provider as unknown as BrowserProvider,
    onConnect,
    onConnectEagerly,
    onDisconnect,
    onLock,
  };
};
