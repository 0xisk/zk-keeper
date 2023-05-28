import { Chain } from "@cryptkeeper/config";
import { getLastActiveTabUrl } from "@cryptkeeper/controllers";
import { useAppDispatch, fetchHistory, fetchIdentities, useIdentities, checkHostApproval } from "@cryptkeeper/redux";
import { IdentityData } from "@cryptkeeper/types";
import { useWallet } from "@src/hooks/wallet";
import BigNumber from "bignumber.js";
import { useEffect, useCallback } from "react";

export interface IUseHomeData {
  identities: IdentityData[];
  address?: string;
  balance?: BigNumber;
  chain?: Chain;
  refreshConnectionStatus: () => Promise<boolean>;
}

export const useHome = (): IUseHomeData => {
  const dispatch = useAppDispatch();
  const identities = useIdentities();

  const { address, chain, balance } = useWallet();

  const refreshConnectionStatus = useCallback(async () => {
    const tabUrl = await getLastActiveTabUrl();

    if (!tabUrl) {
      return false;
    }

    return dispatch(checkHostApproval(tabUrl.origin));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchIdentities());
    dispatch(fetchHistory());
  }, [dispatch]);

  return {
    address,
    chain,
    balance,
    identities,
    refreshConnectionStatus,
  };
};
