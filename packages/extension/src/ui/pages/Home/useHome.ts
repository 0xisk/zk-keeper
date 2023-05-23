import BigNumber from "bignumber.js";
import { useEffect, useCallback } from "react";

import { Chain } from "packages/extension/src/config/rpc";
import { IdentityData } from "packages/extension/src/types";
import { useAppDispatch } from "packages/extension/src/ui/ducks/hooks";
import { fetchHistory, fetchIdentities, useIdentities } from "packages/extension/src/ui/ducks/identities";
import { checkHostApproval } from "packages/extension/src/ui/ducks/permissions";
import { useWallet } from "packages/extension/src/ui/hooks/wallet";
import { getLastActiveTabUrl } from "packages/extension/src/util/browser";

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
