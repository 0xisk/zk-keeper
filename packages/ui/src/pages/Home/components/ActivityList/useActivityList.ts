import { useAppDispatch, deleteHistoryOperation, fetchHistory, useIdentityOperations } from "@cryptkeeper/redux";
import { Operation } from "@cryptkeeper/types";
import { useCallback, useEffect, useState } from "react";

export interface IUseActivityListData {
  isLoading: boolean;
  operations: Operation[];
  onDeleteHistoryOperation: (id: string) => void;
}

export const useActivityList = (): IUseActivityListData => {
  const dispatch = useAppDispatch();
  const operations = useIdentityOperations();
  const [isLoading, setIsLoading] = useState(false);

  const onDeleteHistoryOperation = useCallback(
    (id: string) => {
      dispatch(deleteHistoryOperation(id));
    },
    [dispatch],
  );

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchHistory()).finally(() => setIsLoading(false));
  }, [dispatch, setIsLoading]);

  return {
    isLoading,
    operations,
    onDeleteHistoryOperation,
  };
};
