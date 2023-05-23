import { browser } from "webextension-polyfill-ts";

import type { MessageAction } from "packages/extension/src/types";

export default async function postMessage<T>(message: MessageAction): Promise<T> {
  const [err, res] = (await browser.runtime.sendMessage(message)) as [string, T];

  if (err) {
    throw new Error(err);
  }

  return res;
}
