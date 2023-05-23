import { AnyAction, configureStore, ThunkDispatch, ThunkAction } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";

import { isDebugMode } from "packages/extension/src/config/env";
import app from "packages/extension/src/ui/ducks/app";
import identities from "packages/extension/src/ui/ducks/identities";
import permissions from "packages/extension/src/ui/ducks/permissions";
import requests from "packages/extension/src/ui/ducks/requests";

const rootReducer = {
  identities,
  requests,
  app,
  permissions,
};

const middlewares = isDebugMode() ? [thunk, createLogger({ collapsed: true })] : [thunk];

function configureAppStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(...middlewares),
    devTools: isDebugMode(),
  });
}

export const store = configureAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type TypedDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
export type TypedThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;
