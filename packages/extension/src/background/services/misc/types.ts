import type { InitializationStep } from "packages/extension/src/types";

export interface ExteranalWalletConnectionData {
  isDisconnectedPermanently: boolean;
}

export interface InitializationData {
  initializationStep: InitializationStep;
}
