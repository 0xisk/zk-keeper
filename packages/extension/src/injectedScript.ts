import { isDebugMode } from "@cryptkeeper/config";
import { initializeInjectedProvider } from "@cryptkeeper/providers";
import log from "loglevel";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

try {
  initializeInjectedProvider();
} catch (error) {
  log.error(`Error in injecting CryptKeeper Injected Provider`);
}
