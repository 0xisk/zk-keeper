import log from "loglevel";

import { isDebugMode } from "@cryptkeeper/config";
import { initializeInjectedProvider } from "@cryptkeeper/providers";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

try {
  initializeInjectedProvider();
} catch (error) {
  log.error(`Error in injecting CryptKeeper Injected Provider`);
}
