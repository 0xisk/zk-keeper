import { getLinkPreview } from "link-preview-js";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHostPermissions, removeHost, setHostPermissions, useHostPermission } from "@src/ui/ducks/permissions";
import { getLastActiveTabUrl } from "@src/util/browser";

export interface IUseConnectionModalArgs {
  refreshConnectionStatus: () => Promise<void>;
  onClose: () => void;
}

export interface IUseConnectionModalData {
  checked: boolean;
  faviconUrl: string;
  url?: URL;
  onRemoveHost: () => void;
  onSetApproval: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const useConnectionModal = ({
  refreshConnectionStatus,
  onClose,
}: IUseConnectionModalArgs): IUseConnectionModalData => {
  const [url, setUrl] = useState<URL>();
  const [faviconUrl, setFaviconUrl] = useState("");
  const host = url?.origin ?? "";

  const dispatch = useAppDispatch();
  const permission = useHostPermission(host);

  useEffect(() => {
    getLastActiveTabUrl().then((tabUrl) => setUrl(tabUrl));
  }, [setUrl]);

  useEffect(() => {
    if (!host) {
      return;
    }

    getLinkPreview(host).then((data) => {
      const [favicon] = data.favicons;
      setFaviconUrl(favicon);
    });

    dispatch(fetchHostPermissions(host));
  }, [host, setFaviconUrl, dispatch]);

  const onRemoveHost = useCallback(() => {
    dispatch(removeHost(host))
      .then(() => refreshConnectionStatus())
      .then(() => onClose());
  }, [host, dispatch, refreshConnectionStatus, onClose]);

  const onSetApproval = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setHostPermissions({ host, noApproval: event.target.checked }));
    },
    [host, dispatch],
  );

  return {
    checked: Boolean(permission?.noApproval),
    faviconUrl,
    url,
    onRemoveHost,
    onSetApproval,
  };
};
