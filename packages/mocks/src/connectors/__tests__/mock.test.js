"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
describe("connectors/mock", () => {
    test("should create mock connector properly", () => {
        const mock = new __1.MockConnector({
            startActivation: jest.fn().mockReturnValue(jest.fn()),
            update: jest.fn(),
            resetState: jest.fn(),
        });
        expect(mock.activate()).resolves.not.toThrow();
        expect(__1.mockConnector).toBeDefined();
    });
    test("should create default mock connector hooks", () => {
        const hooks = (0, __1.createMockConnectorHooks)({});
        expect(hooks.useAccount()).toBeUndefined();
        expect(hooks.useAccounts()).toStrictEqual([]);
        expect(hooks.useChainId()).toBeUndefined();
        expect(hooks.useENSName()).toBeUndefined();
        expect(hooks.useENSNames()).toStrictEqual([]);
        expect(hooks.useIsActivating()).toBe(false);
        expect(hooks.useIsActive()).toBe(false);
        expect(hooks.useProvider()).toBeUndefined();
    });
    test("should create mock connector hooks", () => {
        const hooks = (0, __1.createMockConnectorHooks)({
            accounts: ["0x0", "0x1"],
            ensNames: ["0x0.eth", "0x1.eth"],
            chainId: 1,
            isActivating: false,
            isActive: true,
        });
        expect(hooks.useAccount()).toBe("0x0");
        expect(hooks.useAccounts()).toStrictEqual(["0x0", "0x1"]);
        expect(hooks.useChainId()).toBe(1);
        expect(hooks.useENSName()).toBe("0x0.eth");
        expect(hooks.useENSNames()).toStrictEqual(["0x0.eth", "0x1.eth"]);
        expect(hooks.useIsActivating()).toBe(false);
        expect(hooks.useIsActive()).toBe(true);
        expect(hooks.useProvider()).toBeUndefined();
    });
});
//# sourceMappingURL=mock.test.js.map