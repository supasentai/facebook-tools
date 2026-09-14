/**
 * Facebook Leave All Groups Utility
 * Repository: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    // Selector nút menu ba chấm hoặc nút Đã tham gia/Joined trên danh sách nhóm
    MENU_SELECTOR:
      'div[aria-label="Đã tham gia"], div[aria-label="Joined"], div[aria-label="Quản lý"], div[aria-label="Manage"], div[role="button"][aria-haspopup="menu"]',
    LEAVE_TEXTS: ["Rời khỏi nhóm", "Leave group", "Rời nhóm", "Leave Group"],
    CONFIRM_TEXTS: ["Rời khỏi nhóm", "Leave Group", "Xác nhận", "Confirm"],
    MIN_DELAY: 2000,
    MAX_DELAY: 4500,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const leaveGroup = async (menuButton) => {
    try {
      // 1. Click mở menu tùy chọn của nhóm
      menuButton.click();
      await sleep(1000);

      // 2. Tìm tùy chọn "Rời khỏi nhóm" trong menu xổ xuống
      const menuItems = document.querySelectorAll(
        'div[role="menuitem"] span, div[role="none"] span',
      );
      let leaveBtn = null;

      for (const item of menuItems) {
        if (CONFIG.LEAVE_TEXTS.includes(item.textContent.trim())) {
          leaveBtn = item.closest('div[role="menuitem"]') || item;
          break;
        }
      }

      if (!leaveBtn) {
        menuButton.click(); // Đóng menu nếu không tìm thấy
        return false;
      }

      // 3. Click nút "Rời khỏi nhóm"
      leaveBtn.click();
      await sleep(1500);

      // 4. Tìm và click nút xác nhận trên dialog Pop-up
      const dialogButtons = document.querySelectorAll(
        'div[role="dialog"] span, div[role="dialog"] div[role="button"]',
      );
      let confirmBtn = null;

      for (const btn of dialogButtons) {
        if (CONFIG.CONFIRM_TEXTS.includes(btn.textContent.trim())) {
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
    let count = 0;

    while (true) {
      const targets = Array.from(
        document.querySelectorAll(CONFIG.MENU_SELECTOR),
      ).filter((btn) => btn.offsetWidth > 0 && btn.offsetHeight > 0);

      if (targets.length === 0) {
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(3000);

        const recheckTargets = Array.from(
          document.querySelectorAll(CONFIG.MENU_SELECTOR),
        ).filter((btn) => btn.offsetWidth > 0 && btn.offsetHeight > 0);

        if (recheckTargets.length === 0) {
          break;
        }
        continue;
      }

      const success = await leaveGroup(targets[0]);

      if (success) {
        count++;
        await sleep(getRandomDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY));
      } else {
        await sleep(1500);
      }
    }
  };

  init();
})();
