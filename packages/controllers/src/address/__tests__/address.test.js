"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@cryptkeeper/constants");
const __1 = require("../");
describe("util/account", () => {
  test("should slice address and return short representation", () => {
    const result = (0, __1.sliceAddress)(constants_1.ZERO_ADDRESS);
    expect(result).toBe("0x0000...0000");
  });
  test("should return the same string if it's not an address", () => {
    const result = (0, __1.sliceAddress)("0x000000");
    expect(result).toBe("0x000000");
  });
  test("should ellipsify properly with default params", () => {
    const result = (0, __1.ellipsify)(constants_1.ZERO_ADDRESS);
    expect(result).toBe("0x0000...0000");
  });
  test("should return text from ellipsify if there is a cycle in slicing", () => {
    const result = (0, __1.ellipsify)("12345678", 6, 12);
    expect(result).toBe("12345678");
  });
});
//# sourceMappingURL=address.test.js.map
