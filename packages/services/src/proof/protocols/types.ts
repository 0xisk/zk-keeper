import type { SemaphoreIdentity } from "@src/identity";

export interface IProof<Request, Return> {
  genProof(identityCommitment: SemaphoreIdentity, request: Request): Promise<Return>;
}
