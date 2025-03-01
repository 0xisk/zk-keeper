import BigNumber from "bignumber.js";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";

import { Chain } from "@src/config/chains";
import { DEFAULT_ROUND } from "@src/config/const";
import { ConnectionModal } from "@src/ui/components/ConnectionModal";
import { sliceAddress } from "@src/util/account";

import "./infoStyles.scss";

export interface InfoProps {
  address?: string;
  balance?: BigNumber;
  chain?: Chain;
  refreshConnectionStatus: () => Promise<boolean>;
}

export const Info = ({
  address = "",
  balance = undefined,
  chain = undefined,
  refreshConnectionStatus,
}: InfoProps): JSX.Element => {
  const [isConnected, setIsConnected] = useState(false);
  const [isModalShow, setIsModalShow] = useState(false);

  const onRefreshConnectionStatus = useCallback(
    async () =>
      refreshConnectionStatus()
        .then((isHostApproved: boolean) => setIsConnected(isHostApproved))
        .catch(() => setIsConnected(false)),
    [refreshConnectionStatus, setIsConnected],
  );

  const onShowModal = useCallback(() => {
    setIsModalShow((show) => !show);
  }, [setIsModalShow]);

  useEffect(() => {
    onRefreshConnectionStatus();
  }, [onRefreshConnectionStatus]);

  return (
    <>
      {isModalShow && <ConnectionModal refreshConnectionStatus={onRefreshConnectionStatus} onClose={onShowModal} />}

      <div className="home__info" data-testid="home-info">
        <button
          className={classNames("home__info__connection-button", {
            "home__info__connection-button--connected": isConnected,
          })}
          data-testid="connect-button"
          type="button"
          onClick={isConnected ? onShowModal : undefined}
        >
          <div
            className={classNames("home__info__connection-button__icon", {
              "home__info__connection-button__icon--connected": isConnected,
            })}
          />

          <div className="text-xs home__info__connection-button__text">
            {isConnected ? "Connected" : "Not Connected"}
          </div>

          {address && <div className="text-sm home__info__account-button">{sliceAddress(address)}</div>}
        </button>

        <div>
          <div className="text-3xl font-semibold">
            {chain && balance ? `${balance.toFormat(DEFAULT_ROUND)} ${chain.nativeCurrency.symbol}` : "-"}
          </div>
        </div>
      </div>
    </>
  );
};
