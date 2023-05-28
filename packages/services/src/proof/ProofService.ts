import { RLNFullProof, RLNProofRequest, SemaphoreProof, SemaphoreProofRequest } from "@cryptkeeper/types";
import { SemaphoreIdentity } from "@src/identity";

import { SemaphoreProofService, RLNProofService } from "./protocols";

export class ProofService {
  private static INSTANCE: ProofService;

  private semapohreProofService: SemaphoreProofService;

  private rlnProofService: RLNProofService;

  constructor() {
    this.semapohreProofService = new SemaphoreProofService();
    this.rlnProofService = new RLNProofService();
  }

  static getInstance(): ProofService {
    if (!ProofService.INSTANCE) {
      ProofService.INSTANCE = new ProofService();
    }

    return ProofService.INSTANCE;
  }

  generateSemaphoreProof(identity: SemaphoreIdentity, request: SemaphoreProofRequest): Promise<SemaphoreProof> {
    return this.semapohreProofService.genProof(identity, request);
  }

  generateRLNProof(identity: SemaphoreIdentity, request: RLNProofRequest): Promise<RLNFullProof> {
    return this.rlnProofService.genProof(identity, request);
  }
}
