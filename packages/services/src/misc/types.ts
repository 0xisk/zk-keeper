import type { InitializationStep } from "@cryptkeeper/types";

export interface ExteranalWalletConnectionData {
  isDisconnectedPermanently: boolean;
}

export interface InitializationData {
  initializationStep: InitializationStep;
}
