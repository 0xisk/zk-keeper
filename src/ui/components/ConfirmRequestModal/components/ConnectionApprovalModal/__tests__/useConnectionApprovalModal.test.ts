/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { PendingRequestType } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHostPermissions, setHostPermissions, useHostPermission } from "@src/ui/ducks/permissions";

import type { ChangeEvent } from "react";

import {
  IUseConnectionApprovalModalArgs,
  IUseConnectionApprovalModalData,
  useConnectionApprovalModal,
} from "../useConnectionApprovalModal";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/permissions", (): unknown => ({
  fetchHostPermissions: jest.fn(),
  setHostPermissions: jest.fn(),
  useHostPermission: jest.fn(),
}));

describe("ui/components/ConfirmRequestModal/components/ConnectionApprovalModal/useConnectionApprovalModal", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const defaultArgs: IUseConnectionApprovalModalArgs = {
    pendingRequest: {
      id: "1",
      type: PendingRequestType.APPROVE,
      payload: { origin: "http://localhost:3000" },
    },
    accept: jest.fn(),
    reject: jest.fn(),
  };

  const defaultPermission = { noApproval: true };

  const waitForData = async (current: IUseConnectionApprovalModalData) => {
    await waitFor(() => current.checked === true);
    await waitFor(() => current.faviconUrl !== "");
    await waitFor(() => current.host !== "");
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useHostPermission as jest.Mock).mockReturnValue(defaultPermission);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return empty data", () => {
    const { result } = renderHook(() =>
      useConnectionApprovalModal({ ...defaultArgs, pendingRequest: { id: "1", type: PendingRequestType.APPROVE } }),
    );

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("");
    expect(result.current.host).toBe("");
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitForData(result.current);

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.host).toBe(defaultArgs.pendingRequest.payload?.origin);
  });

  test("should accept approval properly", async () => {
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitForData(result.current);

    act(() => result.current.onAccept());

    expect(defaultArgs.accept).toBeCalledTimes(1);
  });

  test("should reject approval properly", async () => {
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitForData(result.current);

    act(() => result.current.onReject());

    expect(defaultArgs.reject).toBeCalledTimes(1);
  });

  test("should set approval properly", async () => {
    (mockDispatch as jest.Mock).mockResolvedValue({ ...defaultPermission, noApproval: false });
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitForData(result.current);

    act(() => result.current.onSetApproval({ target: { checked: false } } as ChangeEvent<HTMLInputElement>));
    await waitFor(() => result.current.checked === false);

    expect(fetchHostPermissions).toBeCalledTimes(1);
    expect(fetchHostPermissions).toBeCalledWith(defaultArgs.pendingRequest.payload?.origin);
    expect(setHostPermissions).toBeCalledTimes(1);
    expect(setHostPermissions).toBeCalledWith({ host: defaultArgs.pendingRequest.payload?.origin, noApproval: false });
  });
});
