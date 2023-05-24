import BigNumber from "bignumber.js";
import { useEffect, useCallback } from "react";
import { Chain } from "@cryptkeeper/config";
import { IdentityData } from "@cryptkeeper/types";

import { useAppDispatch } from "@src/ducks/hooks";
import { fetchHistory, fetchIdentities, useIdentities } from "@src/ducks/identities";
import { checkHostApproval } from "@src/ducks/permissions";
import { useWallet } from "@src/hooks/wallet";
import { getLastActiveTabUrl } from "@cryptkeeper/controllers/browser";

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
