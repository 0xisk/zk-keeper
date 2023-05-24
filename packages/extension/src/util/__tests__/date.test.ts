import { formatDate } from "../../../../react/src/util/date";

describe("util/date", () => {
  test("should format date properly", () => {
    const result = formatDate(new Date());

    expect(result).toBeDefined();
  });
});
