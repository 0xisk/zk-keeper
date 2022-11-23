// TODO: importing scripts better using importScritps() check MM 
import 'subworkers'; 
import { browser } from "webextension-polyfill-ts";
import { Request } from "@src/types";
import ZkKeeperController from "./zk-keeper";
import RPCAction from "@src/util/constants";

// TODO consider adding inTest env
const app: ZkKeeperController = new ZkKeeperController();

try {
  // TODO: just added to check the difference in testing
  chrome.runtime.onInstalled.addListener(async () => {
    try {
      console.log("Extension is installed")
    } catch (e) {
      console.log("Extension is not installed");
    }
  });
  app.initialize().then(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    browser.runtime.onMessage.addListener(async (request: Request, _) => {
      try {
        const res = await app.handle(request);
        return [null, res];
      } catch (e: any) {
        return [e.message, null];
      }
    });

    // TODO: change to BrowserUtils
    browser.runtime.onInstalled.addListener(async ({ reason }) => {
      console.log("Inside browser.runtime.connect().onInstalled");
      if (reason === "install") {
        // TODO open html where password will be interested
        // browser.tabs.create({
        //   url: 'popup.html'
        // });
      }
      if (process.env.NODE_ENV === "development") {
        // browser.tabs.create({ url: 'popup.html' });
      }
    });
  });
} catch (error) {
  console.log("Error in backgound!!1");
}
