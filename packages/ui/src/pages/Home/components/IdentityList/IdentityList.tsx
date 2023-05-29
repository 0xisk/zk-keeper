import {
  useAppDispatch,
  createIdentityRequest,
  deleteIdentity,
  setActiveIdentity,
  setIdentityName,
  useSelectedIdentity,
} from "@cryptkeeper/redux";
import classNames from "classnames";
import { useCallback } from "react";

import type { IdentityData } from "@cryptkeeper/types";

import { Icon } from "../../../../components/Icon";
import { useWallet } from "../../../../hooks/wallet";

import "./identityListStyles.scss";
import { IdentityItem } from "./Item";

export interface IdentityListProps {
  identities: IdentityData[];
}

export const IdentityList = ({ identities }: IdentityListProps): JSX.Element => {
  const selected = useSelectedIdentity();
  const dispatch = useAppDispatch();
  const { address } = useWallet();

  const onSelectIdentity = useCallback(
    (identityCommitment: string) => {
      dispatch(setActiveIdentity(identityCommitment));
    },
    [dispatch],
  );

  const onUpdateIdentityName = useCallback(
    async (identityCommitment: string, name: string) => {
      await dispatch(setIdentityName(identityCommitment, name));
    },
    [dispatch],
  );

  const onDeleteIdentity = useCallback(
    async (identityCommitment: string) => {
      await dispatch(deleteIdentity(identityCommitment));
    },
    [dispatch],
  );

  const onCreateIdentityRequest = useCallback(() => {
    if (address) {
      dispatch(createIdentityRequest());
    }
  }, [address, dispatch]);

  return (
    <>
      <div className="identities-content">
        {identities.map(({ commitment, metadata }) => (
          <IdentityItem
            key={commitment}
            commitment={commitment}
            metadata={metadata}
            selected={selected?.commitment}
            onDeleteIdentity={onDeleteIdentity}
            onSelectIdentity={onSelectIdentity}
            onUpdateIdentityName={onUpdateIdentityName}
          />
        ))}
      </div>

      <div className="flex flex-row items-center p-4">
        <button
          className={classNames(
            "flex flex-row items-center justify-center cursor-pointer text-gray-600",
            `create-identity-row__${address ? "active" : "not-active"}`,
          )}
          data-testid="create-new-identity"
          type="button"
          onClick={onCreateIdentityRequest}
        >
          <Icon className="mr-2" fontAwesome="fas fa-plus" size={1} />

          <div>Add Identity</div>
        </button>
      </div>
    </>
  );
};
