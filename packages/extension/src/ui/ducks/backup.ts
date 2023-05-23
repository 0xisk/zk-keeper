import { RPCAction } from "packages/extension/src/constants";
import postMessage from "packages/extension/src/util/postMessage";

import type { TypedThunk } from "packages/extension/src/ui/store/configureAppStore";

export const downloadBackup =
  (password: string): TypedThunk<Promise<string>> =>
  async () =>
    postMessage({
      method: RPCAction.DOWNLOAD_BACKUP,
      payload: password,
    });
