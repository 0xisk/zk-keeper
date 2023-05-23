"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockConnector = exports.createMockConnectorHooks = exports.MockConnector = void 0;
const core_1 = require("@web3-react/core");
const types_1 = require("@web3-react/types");
class MockConnector extends types_1.Connector {
    activate() {
        return Promise.resolve();
    }
    connectEagerly() {
        return Promise.resolve();
    }
    resetState() {
        return Promise.resolve();
    }
    deactivate() {
        return Promise.resolve();
    }
}
exports.MockConnector = MockConnector;
const createMockConnectorHooks = ({ accounts = [], ensNames = [], isActivating = false, isActive = false, chainId, provider, }) => ({
    useAccount: () => accounts[0],
    useAccounts: () => accounts,
    useChainId: () => chainId,
    useENSName: () => ensNames[0],
    useENSNames: () => ensNames,
    useIsActivating: () => isActivating,
    useIsActive: () => isActive,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    useProvider: () => provider,
});
exports.createMockConnectorHooks = createMockConnectorHooks;
exports.mockConnector = (0, core_1.initializeConnector)((actions) => new MockConnector(actions))[0];
//# sourceMappingURL=index.js.map