import { Paths } from "@cryptkeeper/constants";
import { redirectToNewTab } from "@cryptkeeper/controllers";
import classNames from "classnames";
import { useCallback } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { useNavigate } from "react-router-dom";

import { useWallet } from "../../hooks/wallet";
import { Icon } from "../Icon";
import { Menuable } from "../Menuable";
import loaderSvg from "../static/icons/loader.svg";
import logoSvg from "../static/icons/logo.svg";

import "./header.scss";

const METAMASK_INSTALL_URL = "https://metamask.io/";

export const Header = (): JSX.Element => {
  const { address, isActivating, isActive, isInjectedWallet, chain, onConnect, onDisconnect, onLock } = useWallet();
  const navigate = useNavigate();
  const isLoading = isActivating && isInjectedWallet;

  const onGoToMetamaskPage = useCallback(() => {
    redirectToNewTab(METAMASK_INSTALL_URL);
  }, []);

  const onGoToHome = useCallback(() => {
    navigate(Paths.HOME);
  }, [navigate]);

  const onGoToSettings = useCallback(() => {
    navigate(Paths.SETTINGS);
  }, [navigate]);

  return (
    <div className="header h-16 flex flex-row items-center px-4">
      <Icon data-testid="logo" size={3} url={logoSvg} onClick={onGoToHome} />

      <div className="flex-grow flex flex-row items-center justify-end header__content">
        {chain && <div className="text-sm rounded-full header__network-type">{chain.name}</div>}

        <div className="header__account-icon">
          <Menuable
            className="flex user-menu"
            items={[
              isActive
                ? {
                    label: "Disconnect wallet",
                    isDangerItem: false,
                    onClick: onDisconnect,
                  }
                : {
                    label: isInjectedWallet ? "Connect wallet" : "Install metamask",
                    isDangerItem: false,
                    onClick: isInjectedWallet ? onConnect : onGoToMetamaskPage,
                  },
              {
                label: "Settings",
                isDangerItem: false,
                onClick: onGoToSettings,
              },
              {
                label: "Lock",
                isDangerItem: false,
                onClick: onLock,
              },
            ]}
          >
            {!address ? (
              <Icon
                data-testid={`inactive-wallet-icon${isLoading ? "-activating" : ""}`}
                fontAwesome={classNames({
                  "fas fa-plug": !isLoading,
                })}
                size={1.25}
                url={isLoading ? loaderSvg : undefined}
              />
            ) : (
              <Jazzicon diameter={32} seed={jsNumberForAddress(address)} />
            )}
          </Menuable>
        </div>
      </div>
    </div>
  );
};
