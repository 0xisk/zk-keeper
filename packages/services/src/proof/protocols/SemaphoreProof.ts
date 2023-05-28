import { SemaphoreProof, SemaphoreProofRequest } from "@cryptkeeper/types";
import { generateProof } from "@semaphore-protocol/proof";
import { SemaphoreIdentity } from "@src/identity";
import { getMerkleProof } from "@src/proof/utils";

import { IProof } from "./types";

export class SemaphoreProofService implements IProof<SemaphoreProofRequest, SemaphoreProof> {
  async genProof(
    identity: SemaphoreIdentity,
    {
      circuitFilePath,
      zkeyFilePath,
      merkleStorageAddress,
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleProof: providerMerkleProof,
    }: SemaphoreProofRequest,
  ): Promise<SemaphoreProof> {
    const identityCommitment = identity.genIdentityCommitment();

    const merkleProof = await getMerkleProof({
      identityCommitment,
      merkleProofArtifacts,
      merkleStorageAddress,
      providerMerkleProof,
    });

    // TODO: do we need to leave `SnarkArtifacts` param as undefinded?
    const fullProof = await generateProof(identity.zkIdentity, merkleProof, externalNullifier, signal, {
      wasmFilePath: circuitFilePath,
      zkeyFilePath,
    });

    return { fullProof };
  }
}
