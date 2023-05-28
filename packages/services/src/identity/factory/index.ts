import { ICreateIdentityArgs, StrategiesMap } from "@cryptkeeper/types";
import { Identity } from "@semaphore-protocol/identity";

import { SemaphoreIdentity } from "../protocols";

const strategies = {
  random: createRandomIdentity,
  interrep: createInterrepIdentity,
};

export function createNewIdentity(strategy: keyof StrategiesMap, config: ICreateIdentityArgs): SemaphoreIdentity {
  return strategies[strategy](config);
}

function createInterrepIdentity(config: ICreateIdentityArgs): SemaphoreIdentity {
  const { identityStrategy, web2Provider, name, messageSignature, account } = config;

  const identity = new Identity(messageSignature);

  return new SemaphoreIdentity(identity, {
    account,
    name,
    identityStrategy,
    web2Provider,
  });
}

function createRandomIdentity(config: ICreateIdentityArgs): SemaphoreIdentity {
  const { identityStrategy, name } = config;
  const identity = new Identity();

  return new SemaphoreIdentity(identity, {
    account: "",
    name,
    identityStrategy,
  });
}
