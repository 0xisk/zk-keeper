import type { SemaphoreIdentity } from "../../identity";

export interface IProof<Request, Return> {
  genProof(identityCommitment: SemaphoreIdentity, request: Request): Promise<Return>;
}
