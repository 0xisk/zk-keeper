/* eslint-disable @typescript-eslint/unbound-method */
import { getEnabledFeatures } from "@cryptkeeper/config";
import { pushMessage } from "@cryptkeeper/controllers";
import { setSelectedCommitment } from "@cryptkeeper/redux";
import { bigintToHex } from "bigint-conversion";
import { browser } from "webextension-polyfill-ts";

import { IdentityService } from "..";
import { SimpleStorage } from "../../storage";
import { createNewIdentity } from "../factory";

const mockDefaultIdentityCommitment =
  bigintToHex(15206603389158210388485662342360617949291660595274505642693885456541816400294n);
const mockDefaultIdentities = [
  [mockDefaultIdentityCommitment, JSON.stringify({ secret: "1234", metadata: { identityStrategy: "random" } })],
];
const mockSerializedDefaultIdentities = JSON.stringify(mockDefaultIdentities);

const mockAuthenticityCheckData = {
  isNewOnboarding: false,
};

jest.mock("../../lock", (): unknown => ({
  getInstance: jest.fn(() => ({
    encrypt: jest.fn(() => mockSerializedDefaultIdentities),
    decrypt: jest.fn((value) =>
      value === mockDefaultIdentityCommitment.toString()
        ? mockDefaultIdentityCommitment.toString()
        : mockSerializedDefaultIdentities,
    ),
    isAuthentic: jest.fn(() => mockAuthenticityCheckData),
  })),
}));

jest.mock("../../crypto", (): unknown => ({
  cryptoGenerateEncryptedHmac: jest.fn(() => "encrypted"),
  cryptoGetAuthenticBackupCiphertext: jest.fn(() => "encrypted"),
}));

jest.mock("../../history", (): unknown => ({
  getInstance: jest.fn(() => ({
    trackOperation: jest.fn(),
  })),
}));

jest.mock("../../notification", (): unknown => ({
  getInstance: jest.fn(() => ({
    create: jest.fn(),
  })),
}));

jest.mock("../../storage");

jest.mock("../util/pushMessage");

jest.mock("../factory");

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

describe("services/identity", () => {
  const identityService = IdentityService.getInstance();

  const defaultTabs = [{ id: 1 }, { id: 2 }];

  const defaultPopupTab = { id: 3, active: true, highlighted: true };

  const defaultNewIdentity = {
    serialize: () => JSON.stringify({ secret: "1234", metadata: { identityStrategy: "random" } }),
    genIdentityCommitment: () => "commitment",
  };

  beforeEach(() => {
    (browser.tabs.create as jest.Mock).mockResolvedValue(defaultPopupTab);

    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (browser.tabs.sendMessage as jest.Mock).mockRejectedValueOnce(false).mockResolvedValue(true);

    (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: true });

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockReturnValue(mockSerializedDefaultIdentities);
      instance.set.mockReturnValue(undefined);
      instance.clear.mockReturnValue(undefined);
    });

    (createNewIdentity as jest.Mock).mockReturnValue(defaultNewIdentity);
  });

  afterEach(() => {
    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockClear();
      instance.set.mockClear();
      instance.clear.mockClear();
    });

    (pushMessage as jest.Mock).mockClear();

    (browser.tabs.sendMessage as jest.Mock).mockClear();
  });

  describe("unlock", () => {
    test("should unlock properly and set active identity", async () => {
      const result = await identityService.unlock();

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith(
        setSelectedCommitment({
          commitment: mockDefaultIdentityCommitment,
        }),
      );
      expect(browser.tabs.sendMessage).toBeCalledTimes(defaultTabs.length);

      for (let index = 0; index < defaultTabs.length; index += 1) {
        expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(
          index + 1,
          defaultTabs[index].id,
          setSelectedCommitment({
            commitment: mockDefaultIdentityCommitment,
          }),
        );
      }
    });

    test("should unlock properly with empty store", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await identityService.unlock();

      expect(result).toBe(true);
    });
  });

  describe("set active identity", () => {
    test("should set active identity properly", async () => {
      const result = await identityService.setActiveIdentity({ identityCommitment: mockDefaultIdentityCommitment });

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith(
        setSelectedCommitment({
          commitment: mockDefaultIdentityCommitment,
        }),
      );
      expect(browser.tabs.sendMessage).toBeCalledTimes(defaultTabs.length);

      for (let index = 0; index < defaultTabs.length; index += 1) {
        expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(
          index + 1,
          defaultTabs[index].id,
          setSelectedCommitment({
            commitment: mockDefaultIdentityCommitment,
          }),
        );
      }
    });

    test("should not set active identity if there is no any saved identities", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await identityService.setActiveIdentity({ identityCommitment: mockDefaultIdentityCommitment });

      expect(result).toBe(false);
      expect(pushMessage).not.toBeCalled();
      expect(browser.tabs.sendMessage).not.toBeCalled();
    });
  });

  describe("set identity name", () => {
    test("should set identity name properly", async () => {
      const result = await identityService.setIdentityName({
        identityCommitment: mockDefaultIdentityCommitment,
        name: "New name",
      });

      expect(result).toBe(true);
    });

    test("should not set identity name if there is no such identity", async () => {
      const result = await identityService.setIdentityName({
        identityCommitment: "unknown",
        name: "New name",
      });

      expect(result).toBe(false);
    });
  });

  describe("delete identity", () => {
    test("should delete identity properly", async () => {
      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);
      activeIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const result = await identityService.deleteIdentity({
        identityCommitment: mockDefaultIdentityCommitment,
      });

      expect(result).toBe(true);
    });

    test("should not delete identity if there is no any identity", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await identityService.deleteIdentity({ identityCommitment: mockDefaultIdentityCommitment });

      expect(result).toBe(false);
    });
  });

  describe("delete all identities", () => {
    test("should delete all identities properly", async () => {
      const isIdentitySet = await identityService.setActiveIdentity({
        identityCommitment: mockDefaultIdentityCommitment,
      });
      const result = await identityService.deleteAllIdentities();

      expect(isIdentitySet).toBe(true);
      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(3);
    });

    test("should delete all identities properly without active identity", async () => {
      const activeIdentity = await identityService.getActiveIdentity();
      const result = await identityService.deleteAllIdentities();

      expect(activeIdentity).toBeUndefined();
      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(1);
    });

    test("should not delete all identities if there is no any identity", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await identityService.deleteAllIdentities();

      expect(result).toBe(false);
    });
  });

  describe("get active identity", () => {
    test("should get active identity properly", async () => {
      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);
      activeIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const activeIdentity = await identityService.getActiveIdentity();

      expect(activeIdentity).toBeDefined();
    });

    test("should get active identity data properly", async () => {
      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);
      activeIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const data = await identityService.getActiveIdentityData();

      expect(data).toStrictEqual({
        commitment: mockDefaultIdentityCommitment,
        web2Provider: "",
      });
    });

    test("should not get active identity if there is no any active identity", async () => {
      const identity = await identityService.getActiveIdentity();
      const data = await identityService.getActiveIdentityData();

      expect(identity).toBeUndefined();
      expect(data).toStrictEqual({
        commitment: "",
        web2Provider: "",
      });
    });

    test("should not get active identity if there is no any identity", async () => {
      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      identityStorage.get.mockReturnValue(undefined);
      activeIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const result = await identityService.getActiveIdentity();

      expect(result).toBeUndefined();
    });
  });

  describe("get identities", () => {
    test("should get identity commitments properly", async () => {
      const { commitments, identities } = await identityService.getIdentityCommitments();

      expect(commitments).toStrictEqual([mockDefaultIdentityCommitment]);
      expect(identities.size).toBe(mockDefaultIdentities.length);
    });

    test("should get identities properly", async () => {
      const identities = await identityService.getIdentities();

      expect(identities).toHaveLength(mockDefaultIdentities.length);
    });

    test("should get identities properly with disabled random identities", async () => {
      (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: false });

      const identities = await identityService.getIdentities();

      expect(identities).toHaveLength(0);
    });

    test("should get number of identities properly", async () => {
      const result = await identityService.getNumOfIdentites();

      expect(result).toBe(mockDefaultIdentities.length);
    });
  });

  describe("create", () => {
    test("should be able to request a create identity modal", async () => {
      await identityService.createIdentityRequest();

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.windows.create).toBeCalledWith(defaultOptions);
    });

    // TODO: fix jest import issue
    // test("should create a new identity properly", async () => {
    //   const identityMessageSignature = "0x000";
    //   const identityStrategy: IdentityStrategy = "random";
    //   const identityOptions: CreateIdentityOptions = {
    //     nonce: 0,
    //     account: ZERO_ADDRESS,
    //     name: "Name",
    //     message: ""
    //   };

    //   const result = await identityService.createIdentity({
    //     strategy: identityStrategy,
    //     messageSignature: identityMessageSignature,
    //     options: identityOptions,
    //   });

    //   expect(result.status).toBe(true);
    //   expect(result.identityCommitment).toBeDefined();
    // });

    // test("should not create a new identity if there is the same identity in the store", async () => {
    //   const identityMessageSignature = "0x000";
    //   const identityStrategy: IdentityStrategy = "interrep";
    //   const identityOptions: CreateIdentityOptions = {
    //     nonce: 0,
    //     web2Provider: "twitter",
    //     account: ZERO_ADDRESS,
    //     name: "Name",
    //   };

    //   const successResult = await identityService.createIdentity({
    //     strategy: identityStrategy,
    //     messageSignature: identityMessageSignature,
    //     options: identityOptions,
    //   });

    //   expect(successResult.status).toBe(true);

    //   (createNewIdentity as jest.Mock).mockReturnValue({
    //     genIdentityCommitment: () => mockDefaultIdentityCommitment,
    //   });

    //   const failedResult = await identityService.createIdentity({
    //     strategy: identityStrategy,
    //     messageSignature: identityMessageSignature,
    //     options: identityOptions,
    //   });

    //   expect(failedResult.status).toBe(false);

    //   const emptyResult = await identityService.createIdentity({
    //     strategy: identityStrategy,
    //     messageSignature: identityMessageSignature,
    //     options: {},
    //   });

    //   expect(emptyResult.status).toBe(false);
    // });
  });

  describe("backup", () => {
    test("should download encrypted identities", async () => {
      const result = await identityService.downloadEncryptedStorage("password");

      expect(result).toBeDefined();
    });

    test("should not download encrypted identities if storage is empty", async () => {
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(undefined);

      const result = await identityService.downloadEncryptedStorage("password");

      expect(result).toBeNull();
    });

    test("should upload encrypted identities", async () => {
      await identityService.uploadEncryptedStorage("encrypted", "password");

      const [instance] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
      expect(instance.set).toBeCalledTimes(1);
      expect(instance.set).toBeCalledWith("encrypted");
    });

    test("should not upload encrypted identities if there is no data", async () => {
      await identityService.uploadEncryptedStorage("", "");

      const [instance] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
      expect(instance.set).toBeCalledTimes(0);
    });
  });
});
