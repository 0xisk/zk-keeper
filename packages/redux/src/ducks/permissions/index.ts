/* eslint-disable no-param-reassign */
import { RPCAction } from "@cryptkeeper/constants";
import { postMessage } from "@cryptkeeper/controllers";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import type { TypedThunk } from "../../store";

import { useAppSelector } from "../../hooks";

export interface PermissionsState {
  noApprovals: Record<string, HostPermission>;
}

export interface HostPermission {
  noApproval: boolean;
  host: string;
}

const initialState: PermissionsState = {
  noApprovals: {},
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    setPermission: (state: PermissionsState, action: PayloadAction<HostPermission>) => {
      state.noApprovals[action.payload.host] = action.payload;
    },

    removeHostPermission: (state: PermissionsState, action: PayloadAction<string>) => {
      delete state.noApprovals[action.payload];
    },
  },
});

const { setPermission, removeHostPermission } = permissionsSlice.actions;

export const fetchHostPermissions =
  (host: string): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    const res = await postMessage<{ noApproval: boolean }>({
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: host,
    });

    dispatch(setPermission({ host, noApproval: res.noApproval }));
  };

export const setHostPermissions =
  (permission: HostPermission): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    await postMessage<{ noApproval: boolean }>({
      method: RPCAction.SET_HOST_PERMISSIONS,
      payload: {
        host: permission.host,
        noApproval: permission.noApproval,
      },
    });

    dispatch(setPermission(permission));
  };

export const removeHost =
  (host: string): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    await postMessage({
      method: RPCAction.REMOVE_HOST,
      payload: {
        host,
      },
    });

    dispatch(removeHostPermission(host));
  };

export const checkHostApproval =
  (host: string): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage({
      method: RPCAction.IS_HOST_APPROVED,
      payload: host,
    });

export const useHostPermission = (host: string): HostPermission | undefined =>
  useAppSelector((state) => state.permissions.noApprovals[host], deepEqual);

export const permissions = permissionsSlice.reducer;
