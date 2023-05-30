// TODO: Maybe it should move to @cryptkeeper/controllers but it will make a circular dependency issue so will leave it here for now.
import { BrowserController, pushMessage } from "@cryptkeeper/controllers/src/browser";
import { setPendingRequests } from "@cryptkeeper/redux";
import {
  PendingRequest,
  PendingRequestType,
  RequestResolutionAction,
  RequestResolutionStatus,
} from "@cryptkeeper/types";
import { EventEmitter2 } from "eventemitter2";

export class RequestController extends EventEmitter2 {
  private browserService: BrowserController;

  private pendingRequests: PendingRequest[];

  private nonce: number;

  constructor() {
    super();
    this.pendingRequests = [];
    this.nonce = 0;
    this.browserService = BrowserController.getInstance();

    this.browserService.addRemoveWindowListener(this.clearRequests);
  }

  getNonce = (): number => this.nonce;

  getRequests = (): PendingRequest[] => this.pendingRequests;

  newRequest = async (type: PendingRequestType, payload?: unknown): Promise<unknown> => {
    const popup = await this.browserService.openPopup();
    const id = await this.addToQueue(type, popup.id, payload);

    return new Promise((resolve, reject) => {
      const onPopupClose = (windowId: number) => {
        if (windowId === popup.id) {
          reject(new Error("user rejected."));
          this.browserService.removeRemoveWindowListener(onPopupClose);
        }
      };

      this.browserService.addRemoveWindowListener(onPopupClose);

      this.once(`${id}:finalized`, (action: RequestResolutionAction) => {
        this.browserService.removeRemoveWindowListener(onPopupClose);
        switch (action.status) {
          case RequestResolutionStatus.ACCEPT:
            resolve(action.data);
            return;
          case RequestResolutionStatus.REJECT:
            reject(new Error("user rejected."));
            return;
          default:
            reject(new Error(`action: ${action.status as string} not supproted`));
        }
      });
    });
  };

  finalizeRequest = async (action: RequestResolutionAction<unknown>): Promise<boolean> => {
    const { id } = action;

    // TODO add some mutex lock just in case something strange occurs
    this.pendingRequests = this.pendingRequests.filter((pendingRequest) => pendingRequest.id !== id);
    this.emit(`${id}:finalized`, action);
    await pushMessage(setPendingRequests(this.pendingRequests));

    return true;
  };

  private addToQueue = async (type: PendingRequestType, windowId?: number, payload?: unknown): Promise<string> => {
    // eslint-disable-next-line no-plusplus
    const id = `${this.nonce++}`;
    this.pendingRequests.push({ id, windowId, type, payload });
    await pushMessage(setPendingRequests(this.pendingRequests));

    return id;
  };

  private clearRequests = (windowId?: number): void => {
    if (windowId) {
      this.pendingRequests = this.pendingRequests.filter((pendingRequests) => pendingRequests.windowId !== windowId);
    }
  };
}
