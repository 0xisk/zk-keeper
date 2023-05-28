import { ZERO_ADDRESS } from "@cryptkeeper/constants";
import { IdentityMetadata } from "@cryptkeeper/types";
import { Identity } from "@semaphore-protocol/identity";

import { SemaphoreIdentity } from "..";

describe("services/identity/protocols/SemaphoreIdentity", () => {
  const defaultIdentity = new Identity("1234");

  const defaultIdentityMetadata: IdentityMetadata = {
    account: ZERO_ADDRESS,
    name: "Identity #1",
    identityStrategy: "interrep",
    web2Provider: "twitter",
  };

  test("should decorate identity properly", () => {
    const zkIdentityDecorater = new SemaphoreIdentity(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorater.zkIdentity).toStrictEqual(defaultIdentity);
    expect(zkIdentityDecorater.metadata).toStrictEqual(defaultIdentityMetadata);
  });

  test("should return identity commitment properly", () => {
    const zkIdentityDecorater = new SemaphoreIdentity(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorater.genIdentityCommitment()).toBeDefined();
  });

  test("should set metadata name properly", () => {
    const zkIdentityDecorater = new SemaphoreIdentity(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorater.setIdentityMetadataName("new name")).toStrictEqual({
      ...defaultIdentityMetadata,
      name: "new name",
    });
  });

  test("should serialize and deserialize properly", () => {
    const zkIdentityDecorater = new SemaphoreIdentity(defaultIdentity, defaultIdentityMetadata);
    const serialized = zkIdentityDecorater.serialize();
    const deserialized = SemaphoreIdentity.genFromSerialized(serialized);

    expect(deserialized.metadata).toStrictEqual(defaultIdentityMetadata);
  });

  test("should check metadata and secret data when deserializing", () => {
    expect(() => SemaphoreIdentity.genFromSerialized("{}")).toThrowError("Metadata missing");
    expect(() => SemaphoreIdentity.genFromSerialized(JSON.stringify({ metadata: {} }))).toThrowError("Secret missing");
  });
});
