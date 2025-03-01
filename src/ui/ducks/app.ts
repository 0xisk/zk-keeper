/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";
import omit from "lodash/omit";

import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { PayloadAction } from "@reduxjs/toolkit";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface AppState {
  isInitialized: boolean;
  isUnlocked: boolean;
  isMnemonicGenerated: boolean;
  mnemonic?: string;
  isDisconnectedPermanently?: boolean;
}

const initialState: AppState = {
  isInitialized: false,
  isUnlocked: false,
  isMnemonicGenerated: false,
  mnemonic: undefined,
  isDisconnectedPermanently: undefined,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setStatus: (state: AppState, action: PayloadAction<Omit<AppState, "isDisconnectedPermanently">>) => {
      state.isInitialized = action.payload.isInitialized;
      state.isUnlocked = action.payload.isUnlocked;
      state.isMnemonicGenerated = action.payload.isMnemonicGenerated;
    },

    setMnemonic: (state: AppState, action: PayloadAction<string>) => {
      state.mnemonic = action.payload;
    },

    setDisconnectedPermanently: (state: AppState, action: PayloadAction<boolean>) => {
      state.isDisconnectedPermanently = action.payload;
    },
  },
});

export const { setStatus } = appSlice.actions;

export const lock = () => async (): Promise<void> => {
  await postMessage({ method: RPCAction.LOCK });
};

export const closePopup = () => async (): Promise<void> => {
  await postMessage({ method: RPCAction.CLOSE_POPUP });
};

export const unlock = (password: string) => async (): Promise<boolean> =>
  postMessage<boolean>({ method: RPCAction.UNLOCK, payload: password });

export const setupPassword = (password: string) => async (): Promise<boolean> =>
  postMessage<boolean>({ method: RPCAction.SETUP_PASSWORD, payload: password });

export const fetchStatus = (): TypedThunk => async (dispatch) => {
  const status = await postMessage<AppState>({ method: RPCAction.GET_STATUS });
  dispatch(setStatus(status));
};

export const setWalletConnection =
  (isDisconnectedPermanently: boolean): TypedThunk =>
  async (dispatch): Promise<void> => {
    await postMessage({ method: RPCAction.SET_CONNECT_WALLET, payload: { isDisconnectedPermanently } });
    dispatch(appSlice.actions.setDisconnectedPermanently(isDisconnectedPermanently));
  };

export const getWalletConnection =
  (): TypedThunk =>
  async (dispatch): Promise<void> => {
    const response = await postMessage<{ isDisconnectedPermanently: boolean }>({
      method: RPCAction.GET_CONNECT_WALLET,
    });
    dispatch(appSlice.actions.setDisconnectedPermanently(Boolean(response?.isDisconnectedPermanently)));
  };

export const generateMnemonic = (): TypedThunk<Promise<void>> => async (dispatch) => {
  const mnemonic = await postMessage<string>({ method: RPCAction.GENERATE_MNEMONIC });
  dispatch(appSlice.actions.setMnemonic(mnemonic));
};

export const saveMnemonic = (): TypedThunk<Promise<void>> => async (dispatch) => {
  await postMessage({ method: RPCAction.SAVE_MNEMONIC });
  dispatch(setStatus({ isInitialized: true, isUnlocked: true, isMnemonicGenerated: true }));
  dispatch(appSlice.actions.setMnemonic(""));
};

export const useGeneratedMnemonic = (): string | undefined => useAppSelector((state) => state.app.mnemonic, deepEqual);

export const useAppStatus = (): Omit<AppState, "mnemonic"> =>
  useAppSelector((state) => omit(state.app, ["mnemonic"]), deepEqual);

export default appSlice.reducer;
