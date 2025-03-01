import type { CreateIdentityOptions, EWallet, IdentityStrategy } from "../identity";

export interface SelectedIdentity {
  commitment: string;
  web2Provider?: string;
}

export interface ICreateIdentityUiArgs {
  strategy: IdentityStrategy;
  options: CreateIdentityOptions;
  walletType: EWallet;
  messageSignature?: string;
}
