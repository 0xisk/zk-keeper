import { isDebugMode } from "@cryptkeeper/config";
import { RequestHandler } from "@cryptkeeper/types";
import log from "loglevel";
import "subworkers";
import { browser } from "webextension-polyfill-ts";

import "./appInit";
import CryptKeeperController from "./cryptKeeper";
import "./shared/initGlobals";
import { deferredPromise } from "./shared/utils";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

const {
  promise: isInitialized,
  resolve: resolveInitialization,
  reject: rejectInitialization,
} = deferredPromise<unknown>();

browser.runtime.onInstalled.addListener(async () => {
  log.debug("CryptKeeper onInstalled Event, initializing...");
  await isInitialized;
  log.debug("CryptKeeper onInstalled Event, initializing completed...");
});

browser.runtime.onConnect.addListener(async () => {
  log.debug("CryptKeeper onConnect Event, initializing...");
  await isInitialized;
  log.debug("CryptKeeper onConnect Event, initializing completed...");
});

try {
  const app = new CryptKeeperController();

  app.initialize();

  browser.runtime.onMessage.addListener(async (request: RequestHandler) => {
    try {
      log.debug("Background: request: ", request);
      const response = await app.handle(request);
      log.debug("Background: response: ", response);
      return [null, response];
    } catch (e) {
      return [(e as Error).message, null];
    }
  });

  log.debug("CryptKeeper initialization complete.");
  resolveInitialization?.(true);
} catch (error) {
  rejectInitialization?.(error);
}
