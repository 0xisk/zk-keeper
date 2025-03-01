import { ZkIdentitySemaphore } from "@src/background/services/zkIdentity/protocols/ZkIdentitySemaphore";
import { RLNFullProof, RLNProofRequest, SemaphoreProof, SemaphoreProofRequest } from "@src/types";

import { SemaphoreProofService, RLNProofService } from "./protocols";

export default class ZkProofService {
  private static INSTANCE: ZkProofService;

  private semapohreProofService: SemaphoreProofService;

  private rlnProofService: RLNProofService;

  constructor() {
    this.semapohreProofService = new SemaphoreProofService();
    this.rlnProofService = new RLNProofService();
  }

  static getInstance(): ZkProofService {
    if (!ZkProofService.INSTANCE) {
      ZkProofService.INSTANCE = new ZkProofService();
    }

    return ZkProofService.INSTANCE;
  }

  generateSemaphoreProof(identity: ZkIdentitySemaphore, request: SemaphoreProofRequest): Promise<SemaphoreProof> {
    return this.semapohreProofService.genProof(identity, request);
  }

  generateRLNProof(identity: ZkIdentitySemaphore, request: RLNProofRequest): Promise<RLNFullProof> {
    return this.rlnProofService.genProof(identity, request);
  }
}
