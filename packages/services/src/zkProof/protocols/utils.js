"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRlnVerficationKeyJson = exports.getMerkleProof = exports.generateMerkleProof = exports.deserializeMerkleProof = void 0;
const group_1 = require("@semaphore-protocol/group");
const bigint_conversion_1 = require("bigint-conversion");
function deserializeMerkleProof(merkleProof) {
    return {
        root: (0, bigint_conversion_1.hexToBigint)(merkleProof.root),
        siblings: merkleProof.siblings.map((siblings) => Array.isArray(siblings)
            ? siblings.map((element) => (0, bigint_conversion_1.hexToBigint)(element))
            : (0, bigint_conversion_1.hexToBigint)(siblings)),
        pathIndices: merkleProof.pathIndices,
        leaf: (0, bigint_conversion_1.hexToBigint)(merkleProof.leaf),
    };
}
exports.deserializeMerkleProof = deserializeMerkleProof;
function generateMerkleProof({ treeDepth, member, members }) {
    const group = new group_1.Group(treeDepth);
    if (members) {
        group.addMembers(members);
    }
    return group.generateMerkleProof(group.indexOf(member));
}
exports.generateMerkleProof = generateMerkleProof;
async function getMerkleProof({ identityCommitment, merkleStorageAddress, merkleProofArtifacts, providerMerkleProof, }) {
    if (providerMerkleProof) {
        return providerMerkleProof;
    }
    return merkleStorageAddress
        ? getRemoteMerkleProof(merkleStorageAddress, (0, bigint_conversion_1.bigintToHex)(identityCommitment))
        : generateMerkleProof({
            treeDepth: merkleProofArtifacts.depth,
            member: identityCommitment,
            members: [identityCommitment],
        });
}
exports.getMerkleProof = getMerkleProof;
async function getRlnVerficationKeyJson(rlnVerificationKeyPath) {
    return fetch(rlnVerificationKeyPath).then((res) => res.json());
}
exports.getRlnVerficationKeyJson = getRlnVerficationKeyJson;
async function getRemoteMerkleProof(merkleStorageAddress, identityCommitmentHex) {
    return fetch(merkleStorageAddress, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            identityCommitment: identityCommitmentHex,
        }),
    })
        .then((res) => res.json())
        .then((response) => deserializeMerkleProof(response.data.merkleProof));
}
//# sourceMappingURL=utils.js.map