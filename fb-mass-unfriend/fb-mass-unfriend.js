/**
 * Facebook Mass Unfriend Utility
 * GitHub: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    MENU_BUTTON_SELECTOR:
      'div[aria-label="Quản lý"], div[aria-label="Manage"], div[role="button"] i[class*="x1b0v63a"]',

    UNFRIEND_KEYWORDS: ["Hủy kết bạn", "Unfriend"],

    CONFIRM_KEYWORDS: ["Xác nhận", "Confirm"],

    MIN_DELAY: 2000,
    MAX_DELAY: 4500,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const triggerUnfriend = async (menuButton) => {
    try {
      menuButton.click();
      await sleep(1000);

      const menuItems = document.querySelectorAll(
        'div[role="menuitem"] span, div[role="none"] span',
      );
      let unfriendBtn = null;

      for (let item of menuItems) {
        if (CONFIG.UNFRIEND_KEYWORDS.includes(item.textContent.trim())) {
          unfriendBtn = item.closest('div[role="menuitem"]') || item;
          break;
        }
      }

      if (!unfriendBtn) {
        menuButton.click();
        return false;
      }

      unfriendBtn.click();
      await sleep(1500);

      const dialogButtons = document.querySelectorAll(
        'div[role="dialog"] span, div[role="dialog"] div[role="button"]',
      );
      let confirmBtn = null;

      for (let btn of dialogButtons) {
        if (CONFIG.CONFIRM_KEYWORDS.includes(btn.textContent.trim())) {
          confirmBtn = btn.closest('div[role="button"]') || btn;
          break;
        }
      }

      if (confirmBtn) {
        confirmBtn.click();
        await sleep(1000);
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  };

  const init = async () => {
    const menuButtons = Array.from(
      document.querySelectorAll(CONFIG.MENU_BUTTON_SELECTOR),
    );

    if (menuButtons.length === 0) {
      return;
    }

    let unfriendCount = 0;

    for (let i = 0; i < menuButtons.length; i++) {
      if (menuButtons[i].offsetWidth === 0 && menuButtons[i].offsetHeight === 0)
        continue;

      const success = await triggerUnfriend(menuButtons[i]);

      if (success) {
        unfriendCount++;
        const nextDelay = getRandomDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY);
        await sleep(nextDelay);
      }
    }
  };

  init();
})();
