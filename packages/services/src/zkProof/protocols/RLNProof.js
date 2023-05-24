"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RLNProofService = void 0;
const rlnjs_1 = require("rlnjs");
const utils_1 = require("./utils");
class RLNProofService {
    async genProof(identity, { circuitFilePath, zkeyFilePath, verificationKey, merkleStorageAddress, externalNullifier, signal, merkleProofArtifacts, merkleProof: providerMerkleProof, }) {
        const rlnVerificationKeyJson = await (0, utils_1.getRlnVerficationKeyJson)(verificationKey);
        const rln = new rlnjs_1.RLN(circuitFilePath, zkeyFilePath, rlnVerificationKeyJson);
        const identityCommitment = identity.genIdentityCommitment();
        const merkleProof = await (0, utils_1.getMerkleProof)({
            identityCommitment,
            merkleProofArtifacts,
            merkleStorageAddress,
            providerMerkleProof,
        });
        return rln.generateProof(signal, merkleProof, externalNullifier);
    }
}
exports.RLNProofService = RLNProofService;
//# sourceMappingURL=RLNProof.js.map