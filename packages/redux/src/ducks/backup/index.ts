import { RPCAction } from "@cryptkeeper/constants";
import { postMessage } from "@cryptkeeper/controllers";

import type { TypedThunk } from "../../store";

export const downloadBackup =
  (password: string): TypedThunk<Promise<string>> =>
  async () =>
    postMessage({
      method: RPCAction.DOWNLOAD_BACKUP,
      payload: password,
    });
