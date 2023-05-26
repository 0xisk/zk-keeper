/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { RPCAction } from "@cryptkeeper/constants";
import { PendingRequest, PendingRequestType, RequestResolutionStatus } from "@cryptkeeper/types";
import { postMessage } from "@cryptkeeper/controllers";

import { store } from "@src/store";

import { fetchPendingRequests, finalizeRequest, setPendingRequests, usePendingRequests } from "..";

// TODO: jest import issue
jest.unmock("@src/ui/ducks/hooks");

describe("ducks/requests", () => {
  const defaultPendingRequests: PendingRequest[] = [{ id: "1", windowId: 1, type: PendingRequestType.APPROVE }];

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch pending requests properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(defaultPendingRequests);

    await Promise.resolve(store.dispatch(fetchPendingRequests()));
    const { requests } = store.getState();
    const { result } = renderHook(() => usePendingRequests(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(requests.pendingRequests).toStrictEqual(defaultPendingRequests);
    expect(result.current).toStrictEqual(defaultPendingRequests);
  });

  test("should finalize request properly", async () => {
    await Promise.resolve(
      store.dispatch(
        finalizeRequest({
          id: "1",
          status: RequestResolutionStatus.ACCEPT,
        }),
      ),
    );

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.FINALIZE_REQUEST,
      payload: {
        id: "1",
        status: RequestResolutionStatus.ACCEPT,
      },
    });
  });

  test("should set pending requests properly", async () => {
    await Promise.resolve(store.dispatch(setPendingRequests(defaultPendingRequests)));
    const { requests } = store.getState();

    expect(requests.pendingRequests).toStrictEqual(defaultPendingRequests);
  });
});
