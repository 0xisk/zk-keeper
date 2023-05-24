"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemaphoreProofService = void 0;
const proof_1 = require("@semaphore-protocol/proof");
const utils_1 = require("./utils");
class SemaphoreProofService {
    async genProof(identity, { circuitFilePath, zkeyFilePath, merkleStorageAddress, externalNullifier, signal, merkleProofArtifacts, merkleProof: providerMerkleProof, }) {
        const identityCommitment = identity.genIdentityCommitment();
        const merkleProof = await (0, utils_1.getMerkleProof)({
            identityCommitment,
            merkleProofArtifacts,
            merkleStorageAddress,
            providerMerkleProof,
        });
        // TODO: do we need to leave `SnarkArtifacts` param as undefinded?
        const fullProof = await (0, proof_1.generateProof)(identity.zkIdentity, merkleProof, externalNullifier, signal, {
            wasmFilePath: circuitFilePath,
            zkeyFilePath,
        });
        return { fullProof };
    }
}
exports.SemaphoreProofService = SemaphoreProofService;
//# sourceMappingURL=SemaphoreProof.js.map