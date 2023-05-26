import { IRlnGenerateArgs } from "@cryptkeeper/types";

import { SemaphoreIdentity } from "@src/identity";

import { ProofService } from "../ProofService";
import { RLNProofService } from "../protocols";

jest.mock("@src/background/services/zkIdentity/protocols/SemaphoreIdentity", (): unknown => ({
  SemaphoreIdentity: {
    genFromSerialized: jest.fn(),
  },
}));

jest.mock("@src/background/services/zkProof/protocols/RLNProof");

describe("background/services/zkProof", () => {
  describe("RLNProof", () => {
    const defaultGenerateArgs: IRlnGenerateArgs = {
      identity: "identity",
      payload: {
        externalNullifier: "externalNullifier",
        signal: "0x0",
        circuitFilePath: "circuitFilePath",
        verificationKey: "verificationKey",
        zkeyFilePath: "zkeyFilePath",
        rlnIdentifier: "rlnIdentifier",
      },
    };

    const emptyFullProof = {
      proof: {},
      publicSignals: {},
    };

    beforeEach(() => {
      (SemaphoreIdentity.genFromSerialized as jest.Mock).mockReturnValue("serialized");
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test("should generate proof properly", async () => {
      const zkProofGenerator = ProofService.getInstance();
      const [rlnServiceInstance] = (RLNProofService as jest.Mock).mock.instances as [{ genProof: jest.Mock }];
      rlnServiceInstance.genProof.mockResolvedValue(emptyFullProof);

      const result = await zkProofGenerator.generateRLNProof(
        SemaphoreIdentity.genFromSerialized(defaultGenerateArgs.identity),
        defaultGenerateArgs.payload,
      );

      expect(rlnServiceInstance.genProof).toBeCalledTimes(1);
      expect(rlnServiceInstance.genProof).toBeCalledWith("serialized", defaultGenerateArgs.payload);
      expect(result).toStrictEqual(emptyFullProof);
    });
  });
});
