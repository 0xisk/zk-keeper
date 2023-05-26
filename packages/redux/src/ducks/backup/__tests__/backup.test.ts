/**
 * @jest-environment jsdom
 */

import { RPCAction } from "@cryptkeeper/constants";
import { postMessage } from "@cryptkeeper/controllers";

import { store } from "@src/store";
import { downloadBackup } from "..";

// TODO: solve jest import issue
jest.mock("@src/util/postMessage");

describe("ducks/backup", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should download backup properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue("content");

    const result = await Promise.resolve(store.dispatch(downloadBackup("password")));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.DOWNLOAD_BACKUP, payload: "password" });
    expect(result).toBe("content");
  });
});
