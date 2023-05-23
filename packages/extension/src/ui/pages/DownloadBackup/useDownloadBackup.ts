import { BaseSyntheticEvent, useCallback, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { PasswordFormFields } from "packages/extension/src/types";
import { downloadBackup } from "packages/extension/src/ui/ducks/backup";
import { useAppDispatch } from "packages/extension/src/ui/ducks/hooks";
import { downloadFile } from "packages/extension/src/util/browser";
import { formatDate } from "packages/extension/src/util/date";

export interface IUseDownloadBackupData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: Partial<DownloadBackupFields>;
  register: UseFormRegister<DownloadBackupFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
  onGoBack: () => void;
}

type DownloadBackupFields = Pick<PasswordFormFields, "password">;

export const useDownloadBackup = (): IUseDownloadBackupData => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    register,
    handleSubmit,
  } = useForm<DownloadBackupFields>({
    defaultValues: {
      password: "",
    },
  });

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const onGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onSubmit = useCallback(
    (data: DownloadBackupFields) => {
      dispatch(downloadBackup(data.password))
        .then((content: string) => downloadFile(content, `ck-backup-${formatDate(new Date())}.json`))
        .then(() => onGoBack())
        .catch((error: Error) => setError("password", { type: "submit", message: error.message }));
    },
    [dispatch, onGoBack, setError],
  );

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  return {
    isLoading: isLoading || isSubmitting,
    errors: {
      password: errors.password?.message,
    },
    register,
    onSubmit: handleSubmit(onSubmit),
    isShowPassword,
    onShowPassword,
    onGoBack,
  };
};
