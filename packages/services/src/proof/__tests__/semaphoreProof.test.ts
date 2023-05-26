import { ISemaphoreGenerateArgs } from "@cryptkeeper/types";

import { SemaphoreIdentity } from "@src/identity";

import { ProofService } from "../ProofService";
import { SemaphoreProofService } from "../protocols";

jest.mock("@src/services/zkIdentity/protocols/SemaphoreIdentity", (): unknown => ({
  SemaphoreIdentity: {
    genFromSerialized: jest.fn(),
  },
}));

jest.mock("@src/services/zkProof/protocols/SemaphoreProof");

describe("services/zkProof", () => {
  describe("SemaphoreProof", () => {
    const defaultGenerateArgs: ISemaphoreGenerateArgs = {
      identity: "identity",
      payload: {
        externalNullifier: "externalNullifier",
        signal: "0x0",
        circuitFilePath: "circuitFilePath",
        verificationKey: "verificationKey",
        zkeyFilePath: "zkeyFilePath",
      },
    };

    const emptyFullProof = {
      fullProof: {
        proof: {},
        publicSignals: {},
      },
    };

    beforeEach(() => {
      (SemaphoreIdentity.genFromSerialized as jest.Mock).mockReturnValue("serialized");
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test("should generate proof properly", async () => {
      const zkProofGenerator = ProofService.getInstance();
      const [semaphoreServiceInstance] = (SemaphoreProofService as jest.Mock).mock.instances as [
        { genProof: jest.Mock },
      ];
      semaphoreServiceInstance.genProof.mockResolvedValue(emptyFullProof);

      const result = await zkProofGenerator.generateSemaphoreProof(
        SemaphoreIdentity.genFromSerialized(defaultGenerateArgs.identity),
        defaultGenerateArgs.payload,
      );

      expect(semaphoreServiceInstance.genProof).toBeCalledTimes(1);
      expect(semaphoreServiceInstance.genProof).toBeCalledWith("serialized", defaultGenerateArgs.payload);
      expect(result).toStrictEqual(emptyFullProof);
    });
  });
});
