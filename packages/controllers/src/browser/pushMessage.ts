import { ReduxAction } from "@cryptkeeper/types";
import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

export async function pushMessage(message: ReduxAction): Promise<void> {
  try {
    await browser.runtime.sendMessage(message);
  } catch (error) {
    log.warn("Push message error: ", error);
  }
}
