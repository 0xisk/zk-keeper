import log from "loglevel";
import { browser } from "webextension-polyfill-ts";
import { RPCAction } from "@cryptkeeper/constants";
import {
  PendingRequestType,
  RLNProofRequest,
  SemaphoreProofRequest,
  BackupableServices,
  Approvals,
} from "@cryptkeeper/types";
import { BrowserController, HandlerController, RequestController } from "@cryptkeeper/controllers";
import {
  ApprovalService,
  BackupService,
  HistoryService,
  KeyStorageService,
  LockerService,
  MiscStorageService,
  IdentityService,
  validateZkInputs,
} from "@cryptkeeper/services";

export default class CryptKeeperController extends HandlerController {
  private identityService: IdentityService;

  private approvalService: ApprovalService;

  private miscStorageService: MiscStorageService;

  private lockService: LockerService;

  private historyService: HistoryService;

  private backupService: BackupService;

  private keyStorageService: KeyStorageService;

  private browserController: BrowserController;

  private requestController: RequestController;

  constructor() {
    super();
    this.requestController = new RequestController();
    this.browserController = BrowserController.getInstance();
    this.identityService = IdentityService.getInstance();
    this.approvalService = ApprovalService.getInstance();
    this.miscStorageService = MiscStorageService.getInstance();
    this.lockService = LockerService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.keyStorageService = KeyStorageService.getInstance();
    this.backupService = BackupService.getInstance()
      .add(BackupableServices.APPROVAL, this.approvalService)
      .add(BackupableServices.IDENTITY, this.identityService)
      .add(BackupableServices.LOCK, this.lockService);
  }

  initialize = (): CryptKeeperController => {
    // common
    this.add(
      RPCAction.UNLOCK,
      this.lockService.unlock,
      this.identityService.unlock,
      this.approvalService.unlock,
      this.lockService.onUnlocked,
    );

    this.add(RPCAction.LOCK, this.lockService.logout);

    /**
     *  Return status of background process
     *  @returns {Object} status Background process status
     *  @returns {boolean} status.isInitialized has background process been initialized
     *  @returns {boolean} status.isUnlocked is background process unlocked
     */
    this.add(RPCAction.GET_STATUS, this.lockService.getStatus);

    // requests
    this.add(RPCAction.GET_PENDING_REQUESTS, this.lockService.ensure, this.requestController.getRequests);
    this.add(RPCAction.FINALIZE_REQUEST, this.lockService.ensure, this.requestController.finalizeRequest);

    // lock
    this.add(RPCAction.SETUP_PASSWORD, this.lockService.setupPassword);

    // Identities
    this.add(RPCAction.GET_COMMITMENTS, this.lockService.ensure, this.identityService.getIdentityCommitments);
    this.add(RPCAction.GET_IDENTITIES, this.lockService.ensure, this.identityService.getIdentities);
    this.add(RPCAction.GET_ACTIVE_IDENTITY_DATA, this.lockService.ensure, this.identityService.getActiveIdentityData);
    this.add(RPCAction.SET_ACTIVE_IDENTITY, this.lockService.ensure, this.identityService.setActiveIdentity);
    this.add(RPCAction.SET_IDENTITY_NAME, this.lockService.ensure, this.identityService.setIdentityName);
    this.add(RPCAction.CREATE_IDENTITY_REQ, this.lockService.ensure, this.identityService.createIdentityRequest);
    this.add(RPCAction.CREATE_IDENTITY, this.lockService.ensure, this.identityService.createIdentity);
    this.add(RPCAction.DELETE_IDENTITY, this.lockService.ensure, this.identityService.deleteIdentity);
    this.add(RPCAction.DELETE_ALL_IDENTITIES, this.lockService.ensure, this.identityService.deleteAllIdentities);

    // History
    this.add(RPCAction.GET_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.getOperations);
    this.add(RPCAction.LOAD_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.loadOperations);
    this.add(RPCAction.DELETE_HISTORY_OPERATION, this.lockService.ensure, this.historyService.removeOperation);
    this.add(RPCAction.DELETE_ALL_HISTORY_OPERATIONS, this.lockService.ensure, this.historyService.clear);
    this.add(RPCAction.ENABLE_OPERATION_HISTORY, this.lockService.ensure, this.historyService.enableHistory);

    // Backup
    this.add(RPCAction.DOWNLOAD_BACKUP, this.lockService.ensure, this.backupService.download);
    this.add(RPCAction.UPLOAD_BACKUP, this.backupService.upload);

    // Keys
    this.add(RPCAction.SAVE_MNEMONIC, this.lockService.ensure, this.keyStorageService.generateKeyPair);

    // Protocols
    this.add(
      RPCAction.PREPARE_SEMAPHORE_PROOF_REQUEST,
      this.lockService.ensure,
      validateZkInputs,
      async (payload: SemaphoreProofRequest, meta: { origin: string }) => {
        const { isUnlocked } = await this.lockService.getStatus();

        const semaphorePath = {
          circuitFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.wasm"),
          zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.zkey"),
          verificationKey: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.json"),
        };

        if (!isUnlocked) {
          await this.browserController.openPopup();
          await this.lockService.awaitUnlock();
        }

        const identity = await this.identityService.getActiveIdentity();
        const approved = this.approvalService.isApproved(meta.origin);
        const permission = this.approvalService.getPermission(meta.origin);

        if (!identity) {
          throw new Error("active identity not found");
        }

        if (!approved) {
          throw new Error(`${meta.origin} is not approved`);
        }

        try {
          const request = {
            ...payload,
            circuitFilePath: semaphorePath.circuitFilePath,
            zkeyFilePath: semaphorePath.zkeyFilePath,
            verificationKey: semaphorePath.verificationKey,
          };

          if (!permission.noApproval) {
            await this.requestController.newRequest(PendingRequestType.SEMAPHORE_PROOF, {
              ...request,
              origin: meta.origin,
            });
          }

          return { identity: identity.serialize(), payload: request };
        } finally {
          await this.browserController.closePopup();
        }
      },
    );

    this.add(
      RPCAction.PREPARE_RLN_PROOF_REQUEST,
      this.lockService.ensure,
      validateZkInputs,
      async (payload: RLNProofRequest, meta: { origin: string }) => {
        const identity = await this.identityService.getActiveIdentity();
        const approved = this.approvalService.isApproved(meta.origin);
        const permission = this.approvalService.getPermission(meta.origin);

        const rlnPath = {
          circuitFilePath: browser.runtime.getURL("js/zkeyFiles//rln/rln.wasm"),
          zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.zkey"),
          verificationKey: browser.runtime.getURL("js/zkeyFiles/rln/rln.json"),
        };

        if (!identity) {
          throw new Error("active identity not found");
        }
        if (!approved) {
          throw new Error(`${meta.origin} is not approved`);
        }

        try {
          const request = {
            ...payload,
            circuitFilePath: rlnPath.circuitFilePath,
            zkeyFilePath: rlnPath.zkeyFilePath,
            verificationKey: rlnPath.verificationKey,
          };

          if (!permission.noApproval) {
            await this.requestController.newRequest(PendingRequestType.RLN_PROOF, {
              ...request,
              origin: meta.origin,
            });
          }

          return { identity: identity.serialize(), payload: request };
        } finally {
          await this.browserController.closePopup();
        }
      },
    );

    // Injecting
    this.add(RPCAction.TRY_INJECT, async (payload: { origin: string }): Promise<Approvals> => {
      const { origin: host } = payload;
      if (!host) {
        throw new Error("Origin not provided");
      }

      const { isUnlocked } = await this.lockService.getStatus();

      if (!isUnlocked) {
        await this.browserController.openPopup();
        await this.lockService.awaitUnlock();
      }

      const isApproved = this.approvalService.isApproved(host);
      const canSkipApprove = this.approvalService.canSkipApprove(host);

      if (isApproved) {
        return { isApproved, canSkipApprove };
      }

      try {
        await this.requestController.newRequest(PendingRequestType.INJECT, { origin: host });
        return { isApproved: true, canSkipApprove: false };
      } catch (e) {
        log.error(e);
        return { isApproved: false, canSkipApprove: false };
      }
    });

    // Approvals
    this.add(RPCAction.APPROVE_HOST, this.lockService.ensure, this.approvalService.add);
    this.add(RPCAction.IS_HOST_APPROVED, this.lockService.ensure, this.approvalService.isApproved);
    this.add(RPCAction.REMOVE_HOST, this.lockService.ensure, this.approvalService.remove);
    this.add(RPCAction.GET_HOST_PERMISSIONS, this.lockService.ensure, this.approvalService.getPermission);
    this.add(RPCAction.SET_HOST_PERMISSIONS, this.lockService.ensure, this.approvalService.setPermission);
    // Approvals - DEV ONLY
    this.add(RPCAction.CLEAR_APPROVED_HOSTS, this.approvalService.clear);

    this.add(
      RPCAction.SET_CONNECT_WALLET,
      this.lockService.ensure,
      this.miscStorageService.setExternalWalletConnection,
    );

    this.add(
      RPCAction.GET_CONNECT_WALLET,
      this.lockService.ensure,
      this.miscStorageService.getExternalWalletConnection,
    );

    this.add(RPCAction.CLOSE_POPUP, async () => this.browserController.closePopup());

    return this;
  };
}
