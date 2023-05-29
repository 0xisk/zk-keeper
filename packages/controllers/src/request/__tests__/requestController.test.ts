import { setPendingRequests } from "@cryptkeeper/redux";
import { PendingRequestType, RequestResolutionStatus } from "@cryptkeeper/types";

import { RequestController } from "..";
import { BrowserController, pushMessage } from "../../browser";

jest.mock("../../browser/BrowserController");

describe("controllers/requestManager", () => {
  let removeListeners: ((window?: number) => void)[] = [];

  const defaultBrowserControllers = {
    openPopup: jest.fn(),
    closePopup: jest.fn().mockImplementation((windowId?: number) => {
      removeListeners.forEach((listener) => listener(windowId));
    }),
    addRemoveWindowListener: jest.fn().mockImplementation((listener: (windowId?: number) => void) => {
      removeListeners.push(listener);
    }),
    removeRemoveWindowListener: jest.fn(),
  };

  const defaultWindow = { id: 1 };

  const createTimeout = (): Promise<void> =>
    new Promise((resolve) => {
      // need to wait until we get popup and add request to queue
      setTimeout(resolve, 500);
    });

  beforeEach(() => {
    defaultBrowserControllers.openPopup.mockResolvedValue(defaultWindow);

    (BrowserController.getInstance as jest.Mock).mockReturnValue(defaultBrowserControllers);
  });

  afterEach(() => {
    removeListeners = [];
    jest.clearAllMocks();
  });

  test("should create new request and notify properly", async () => {
    const requestManager = new RequestController();
    const nonce = requestManager.getNonce();

    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    const requests = requestManager.getRequests();
    expect(requests).toHaveLength(1);
    expect(pushMessage).toBeCalledTimes(1);
    expect(pushMessage).toBeCalledWith(setPendingRequests(requests));

    const finalized = await requestManager.finalizeRequest({
      id: nonce.toString(),
      status: RequestResolutionStatus.ACCEPT,
      data: { done: true },
    });

    expect(finalized).toBe(true);
  });

  test("should finalize request and notify properly", async () => {
    const requestManager = new RequestController();
    const nonce = requestManager.getNonce();

    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    const finalized = await requestManager.finalizeRequest({
      id: nonce.toString(),
      status: RequestResolutionStatus.ACCEPT,
      data: { done: true },
    });

    expect(finalized).toBe(true);
    expect(requestPromise).resolves.toStrictEqual({ done: true });
    expect(pushMessage).toBeCalledTimes(2);
    expect(pushMessage).toBeCalledWith(setPendingRequests([]));
    expect(defaultBrowserControllers.addRemoveWindowListener).toBeCalledTimes(2);
    expect(defaultBrowserControllers.removeRemoveWindowListener).toBeCalledTimes(1);
  });

  test("should reject request properly", async () => {
    const requestManager = new RequestController();
    const nonce = requestManager.getNonce();

    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    const finalized = await requestManager.finalizeRequest({
      id: nonce.toString(),
      status: RequestResolutionStatus.REJECT,
    });

    expect(finalized).toBe(true);
    expect(requestPromise).rejects.toStrictEqual(new Error("user rejected."));
  });

  test("should handle unknown request finalization type properly", async () => {
    const requestManager = new RequestController();
    const nonce = requestManager.getNonce();

    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    const finalized = await requestManager.finalizeRequest({
      id: nonce.toString(),
      status: "unknown" as RequestResolutionStatus,
    });

    expect(finalized).toBe(true);
    expect(requestPromise).rejects.toStrictEqual(new Error("action: unknown not supproted"));
  });

  test("should handle reject request finalization type properly if user closes popup", async () => {
    const requestManager = new RequestController();

    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    await defaultBrowserControllers.closePopup(defaultWindow.id);

    expect(requestPromise).rejects.toStrictEqual(new Error("user rejected."));
  });
});
