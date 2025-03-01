import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("backup", () => {
  test.beforeEach(async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });
    await expect(page.getByText("Ethereum mainnet")).toBeVisible();
  });

  test("should download backup properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identitiesTab.createIdentity({ walletType: "eth" });
    await expect(extension.getByText("Account # 0")).toBeVisible();

    await extension.settingsPage.openPage();
    await extension.settingsPage.openTab("Advanced");
    const path = await extension.settingsPage.downloadBackup();

    expect(path).toBeDefined();

    await extension.goHome();

    await extension.activityTab.openTab();
    await expect(extension.activityTab.getByText("Backup download")).toBeVisible();
  });
});
