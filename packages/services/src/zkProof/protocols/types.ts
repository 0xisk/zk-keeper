import type { ZkIdentitySemaphore } from "packages/services/src/zkIdentity/protocols/ZkIdentitySemaphore";

export interface IZkProof<Request, Return> {
  genProof(identityCommitment: ZkIdentitySemaphore, request: Request): Promise<Return>;
}
