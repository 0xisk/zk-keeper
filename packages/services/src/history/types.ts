import { IdentityData, OperationType, Operation, HistorySettings } from "@cryptkeeper/types";

export interface OperationOptions {
  identity?: IdentityData;
}

export interface OperationFilter {
  type: OperationType;
}

export interface ILoadOperationsData {
  operations: Operation[];
  settings?: HistorySettings;
}
