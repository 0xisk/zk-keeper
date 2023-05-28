import { getEnabledFeatures } from "@cryptkeeper/config";
import { Paths } from "@cryptkeeper/constants";
import { BrowserController, pushMessage, ellipsify } from "@cryptkeeper/controllers";
import { setIdentities, setSelectedCommitment } from "@cryptkeeper/redux";
import {
  IdentityMetadata,
  IdentityName,
  NewIdentityRequest,
  OperationType,
  SelectedIdentity,
} from "@cryptkeeper/types";
import { cryptoGenerateEncryptedHmac, cryptoGetAuthenticBackupCiphertext } from "@src/crypto";
import { HistoryService } from "@src/history";
import { SemaphoreIdentity } from "@src/identity/protocols";
import { LockerService } from "@src/locker";
import { NotificationService } from "@src/notification";
import { SimpleStorage } from "@src/storage";
import { bigintToHex } from "bigint-conversion";
import { browser } from "webextension-polyfill-ts";

import type { IBackupable } from "@src/backup";

import { createNewIdentity } from "./factory";

const IDENTITY_KEY = "@@ID@@";
const ACTIVE_IDENTITY_KEY = "@@AID@@";

export class IdentityService implements IBackupable {
  private static INSTANCE: IdentityService;

  private identitiesStore: SimpleStorage;

  private activeIdentityStore: SimpleStorage;

  private lockService: LockerService;

  private notificationService: NotificationService;

  private historyService: HistoryService;

  private browserController: BrowserController;

  private activeIdentity?: SemaphoreIdentity;

  private constructor() {
    this.activeIdentity = undefined;
    this.identitiesStore = new SimpleStorage(IDENTITY_KEY);
    this.activeIdentityStore = new SimpleStorage(ACTIVE_IDENTITY_KEY);
    this.lockService = LockerService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.browserController = BrowserController.getInstance();
  }

  static getInstance = (): IdentityService => {
    if (!IdentityService.INSTANCE) {
      IdentityService.INSTANCE = new IdentityService();
    }

    return IdentityService.INSTANCE;
  };

  getActiveIdentityData = async (): Promise<SelectedIdentity> => {
    const identity = await this.getActiveIdentity();

    return {
      commitment: identity ? bigintToHex(identity.genIdentityCommitment()) : "",
      web2Provider: identity?.metadata.web2Provider || "",
    };
  };

  getActiveIdentity = async (): Promise<SemaphoreIdentity | undefined> => {
    const activeIdentityCommitmentCipher = await this.activeIdentityStore.get<string>();

    if (!activeIdentityCommitmentCipher) {
      return undefined;
    }

    const activeIdentityCommitment = this.lockService.decrypt(activeIdentityCommitmentCipher);
    const identities = await this.getIdentitiesFromStore();
    const identity = identities.get(activeIdentityCommitment);

    if (!identity) {
      return undefined;
    }

    this.activeIdentity = SemaphoreIdentity.genFromSerialized(identity);

    return this.activeIdentity;
  };

  private getIdentitiesFromStore = async (): Promise<Map<string, string>> => {
    const ciphertext = await this.identitiesStore.get<string>();

    if (!ciphertext) {
      return new Map();
    }

    const features = getEnabledFeatures();
    const identitesDecrypted = this.lockService.decrypt(ciphertext);
    const iterableIdentities = JSON.parse(identitesDecrypted) as Iterable<readonly [string, string]>;

    return new Map(
      features.RANDOM_IDENTITY
        ? iterableIdentities
        : [...iterableIdentities].filter(
            ([, identity]) => SemaphoreIdentity.genFromSerialized(identity).metadata.identityStrategy !== "random",
          ),
    );
  };

  getIdentityCommitments = async (): Promise<{ commitments: string[]; identities: Map<string, string> }> => {
    const identities = await this.getIdentitiesFromStore();
    const commitments = [...identities.keys()];

    return { commitments, identities };
  };

  getIdentities = async (): Promise<{ commitment: string; metadata: IdentityMetadata }[]> => {
    const { commitments, identities } = await this.getIdentityCommitments();

    return commitments
      .filter((commitment) => identities.has(commitment))
      .map((commitment) => {
        const serializedIdentity = identities.get(commitment) as string;
        const identity = SemaphoreIdentity.genFromSerialized(serializedIdentity);

        return {
          commitment,
          metadata: identity?.metadata,
        };
      });
  };

  getNumOfIdentites = async (): Promise<number> => {
    const identities = await this.getIdentitiesFromStore();
    return identities.size;
  };

  setActiveIdentity = async ({ identityCommitment }: { identityCommitment: string }): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    return this.updateActiveIdentity({ identities, identityCommitment });
  };

  private updateActiveIdentity = async ({
    identities,
    identityCommitment,
  }: {
    identities: Map<string, string>;
    identityCommitment: string;
  }): Promise<boolean> => {
    const identity = identities.get(identityCommitment);

    if (!identity) {
      return false;
    }

    this.activeIdentity = SemaphoreIdentity.genFromSerialized(identity);

    const activeIdentityWeb2Provider = this.activeIdentity.metadata.web2Provider;

    await this.writeActiveIdentity(identityCommitment, activeIdentityWeb2Provider);

    return true;
  };

  private writeActiveIdentity = async (commitment: string, web2Provider?: string): Promise<void> => {
    const ciphertext = this.lockService.encrypt(commitment);
    await this.activeIdentityStore.set(ciphertext);

    const [tabs] = await Promise.all([
      browser.tabs.query({ active: true }),
      pushMessage(
        setSelectedCommitment({
          commitment,
          web2Provider,
        }),
      ),
    ]);

    await Promise.all(
      tabs.map((tab) =>
        browser.tabs
          .sendMessage(
            tab.id as number,
            setSelectedCommitment({
              commitment,
              web2Provider,
            }),
          )
          .catch(() => undefined),
      ),
    );
  };

  setIdentityName = async (payload: IdentityName): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const { identityCommitment, name } = payload;
    const rawIdentity = identities.get(identityCommitment);

    if (!rawIdentity) {
      return false;
    }

    const identity = SemaphoreIdentity.genFromSerialized(rawIdentity);
    identity.setIdentityMetadataName(name);
    identities.set(identityCommitment, identity.serialize());
    await this.writeIdentities(identities);
    await this.refresh();

    return true;
  };

  unlock = async (): Promise<boolean> => {
    await this.setDefaultIdentity();

    return true;
  };

  private setDefaultIdentity = async (): Promise<void> => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      await this.clearActiveIdentity();
      return;
    }

    const identity = identities.keys().next();
    await this.updateActiveIdentity({ identities, identityCommitment: identity.value as string });
  };

  private clearActiveIdentity = async (): Promise<void> => {
    if (!this.activeIdentity) {
      return;
    }

    this.activeIdentity = undefined;
    await this.writeActiveIdentity("", "");
  };

  createIdentityRequest = async (): Promise<void> => {
    await this.browserController.openPopup({ params: { redirect: Paths.CREATE_IDENTITY } });
  };

  createIdentity = async ({
    strategy,
    messageSignature,
    options,
  }: NewIdentityRequest): Promise<{ status: boolean; identityCommitment?: bigint }> => {
    const numOfIdentites = await this.getNumOfIdentites();

    const config = {
      ...options,
      account: options.account ?? "",
      identityStrategy: strategy,
      name: options?.name || `Account # ${numOfIdentites}`,
      messageSignature: strategy === "interrep" ? messageSignature : undefined,
    };

    const identity = createNewIdentity(strategy, config);
    const status = await this.insertIdentity(identity);
    await this.browserController.closePopup();

    return {
      status,
      identityCommitment: identity.genIdentityCommitment(),
    };
  };

  private insertIdentity = async (newIdentity: SemaphoreIdentity): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const identityCommitment = bigintToHex(newIdentity.genIdentityCommitment());

    if (identities.has(identityCommitment)) {
      return false;
    }

    identities.set(identityCommitment, newIdentity.serialize());
    await this.writeIdentities(identities);
    await this.updateActiveIdentity({ identities, identityCommitment });
    await this.refresh();
    await this.historyService.trackOperation(OperationType.CREATE_IDENTITY, {
      identity: { commitment: identityCommitment, metadata: newIdentity.metadata },
    });

    await this.notificationService.create({
      options: {
        title: "New identity has been created.",
        message: `Identity commitment: ${ellipsify(identityCommitment)}`,
        iconUrl: browser.runtime.getURL("/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  private writeIdentities = async (identities: Map<string, string>): Promise<void> => {
    const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
    const ciphertext = this.lockService.encrypt(serializedIdentities);
    await this.identitiesStore.set(ciphertext);
  };

  private refresh = async (): Promise<void> => {
    const identities = await this.getIdentities();
    await pushMessage(setIdentities(identities));
  };

  deleteIdentity = async (payload: { identityCommitment: string }): Promise<boolean> => {
    const { identityCommitment } = payload;
    const activeIdentity = await this.getActiveIdentity();
    const identities = await this.getIdentitiesFromStore();
    const activeIdentityCommitment = activeIdentity ? bigintToHex(activeIdentity?.genIdentityCommitment()) : undefined;
    const identity = identities.get(identityCommitment);

    if (!identity) {
      return false;
    }

    identities.delete(identityCommitment);
    await this.writeIdentities(identities);
    await this.historyService.trackOperation(OperationType.DELETE_IDENTITY, {
      identity: {
        commitment: identityCommitment,
        metadata: SemaphoreIdentity.genFromSerialized(identity).metadata,
      },
    });

    await this.refresh();

    if (activeIdentityCommitment === identityCommitment) {
      await this.setDefaultIdentity();
    }

    return true;
  };

  deleteAllIdentities = async (): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      return false;
    }

    await Promise.all([this.clearActiveIdentity(), this.identitiesStore.clear(), pushMessage(setIdentities([]))]);
    await this.historyService.trackOperation(OperationType.DELETE_ALL_IDENTITIES, {});

    await this.notificationService.create({
      options: {
        title: "Identities removed",
        message: `Identity storage has been cleared`,
        iconUrl: browser.runtime.getURL("/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.identitiesStore.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    return cryptoGenerateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    if (!backupEncryptedData) {
      return;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    await this.identitiesStore.set<string>(cryptoGetAuthenticBackupCiphertext(backupEncryptedData, backupPassword));
  };
}
