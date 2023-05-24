import { browser } from "webextension-polyfill-ts";

import { BrowserController } from "..";

describe("controllers/BrowserController", () => {
  const defaultTabs = [
    { id: 1, active: true, highlighted: true },
    { id: 2, active: true, highlighted: false },
  ];

  const defaultPopupTab = { id: 3, active: true, highlighted: true };

  const defaultWindow = { id: 1 };

  beforeEach(() => {
    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (browser.tabs.create as jest.Mock).mockResolvedValue(defaultPopupTab);

    (browser.windows.create as jest.Mock).mockResolvedValue(defaultWindow);
  });

  test("should open and close popup properly", async () => {
    const browserController = BrowserController.getInstance();

    const popup = await browserController.openPopup({ params: { redirect: "/" } });

    expect(popup.id).toBe(defaultWindow.id);

    const result = await browserController.closePopup();

    expect(result).toBe(true);
  });

  test("should not open the same popup twice", async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValue([]);
    const browserController = BrowserController.getInstance();

    const popup = await browserController.openPopup();
    expect(popup.id).toBe(defaultWindow.id);

    const cachedPopup = await browserController.openPopup();
    expect(cachedPopup.id).toBe(popup.id);
  });

  test("should add and remove listeners properly", () => {
    const browserController = BrowserController.getInstance();
    const callback = () => null;

    browserController.addRemoveWindowListener(callback);
    browserController.removeRemoveWindowListener(callback);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(browser.windows.onRemoved.addListener).toBeCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(browser.windows.onRemoved.removeListener).toBeCalledTimes(1);
  });
});
