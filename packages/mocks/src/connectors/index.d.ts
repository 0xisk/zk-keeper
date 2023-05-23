import { Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";
export declare class MockConnector extends Connector {
    activate(): Promise<void> | void;
    connectEagerly(): Promise<void> | void;
    resetState(): Promise<void> | void;
    deactivate(): Promise<void> | void;
}
export interface IMockConnectorHooksArgs {
    accounts?: string[];
    chainId?: number;
    ensNames?: string[];
    error?: Error;
    isActivating?: boolean;
    isActive?: boolean;
    provider?: unknown;
}
export declare const createMockConnectorHooks: ({ accounts, ensNames, isActivating, isActive, chainId, provider, }: IMockConnectorHooksArgs) => Web3ReactHooks;
export declare const mockConnector: MockConnector;
//# sourceMappingURL=index.d.ts.map