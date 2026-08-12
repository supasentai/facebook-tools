/**
 * Facebook Unfriend All (Mass Delete All Friends)
 * GitHub: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    MENU_BUTTON_SELECTOR:
      'div[aria-label="Quản lý"], div[aria-label="Manage"], div[role="button"] i[class*="x1b0v63a"]',
    UNFRIEND_KEYWORDS: ["Hủy kết bạn", "Unfriend"],
    CONFIRM_KEYWORDS: ["Xác nhận", "Confirm"],
    MIN_DELAY: 2500,
    MAX_DELAY: 5000,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const unfriendUser = async (menuButton) => {
    try {
      // 1. Mở menu ba chấm
      menuButton.click();
      await sleep(1000);

      // 2. Tìm nút "Hủy kết bạn"
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
        menuButton.click(); // Đóng menu nếu không tìm thấy
        return false;
      }

      // 3. Click "Hủy kết bạn"
      unfriendBtn.click();
      await sleep(1500);

      // 4. Click nút "Xác nhận" trên Pop-up
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
    let deletedCount = 0;

    while (true) {
      // Lấy nút menu hiển thị đầu tiên
      const menuButtons = Array.from(
        document.querySelectorAll(CONFIG.MENU_BUTTON_SELECTOR),
      ).filter((btn) => btn.offsetWidth > 0 && btn.offsetHeight > 0);

      if (menuButtons.length === 0) {
        // Tự động cuộn trang xuống dưới để load thêm bạn bè
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(3000);

        const retryButtons = Array.from(
          document.querySelectorAll(CONFIG.MENU_BUTTON_SELECTOR),
        ).filter((btn) => btn.offsetWidth > 0 && btn.offsetHeight > 0);

        // Nếu cuộn trang xong vẫn không tìm thấy nút nào nghĩa là đã hết bạn bè
        if (retryButtons.length === 0) {
          break;
        }
        continue;
      }

      const success = await unfriendUser(menuButtons[0]);

      if (success) {
        deletedCount++;
        const nextDelay = getRandomDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY);
        await sleep(nextDelay);
      } else {
        await sleep(1500);
      }
    }
  };

  init();
})();
