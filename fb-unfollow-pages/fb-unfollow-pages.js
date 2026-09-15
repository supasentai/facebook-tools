/**
 * Facebook Mass Unfollow / Unlike Pages Utility
 * Repository: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    // Selector nhắm vào các nút trạng thái Đã thích / Đã theo dõi
    BUTTON_TEXTS: ["Đã thích", "Liked", "Đã theo dõi", "Following"],
    UNFOLLOW_KEYWORDS: ["Bỏ thích", "Unlike", "Bỏ theo dõi", "Unfollow"],
    CONTAINER_DEPTH: 'div[role="button"]',
    MIN_DELAY: 2000,
    MAX_DELAY: 4500,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getPageButtons = () => {
    const spans = document.querySelectorAll("span");
    return Array.from(spans).filter((span) => {
      const text = span.textContent.trim();
      return CONFIG.BUTTON_TEXTS.includes(text);
    });
  };

  const unfollowPage = async (buttonSpan) => {
    try {
      const clickTarget =
        buttonSpan.closest(CONFIG.CONTAINER_DEPTH) || buttonSpan;
      clickTarget.click();
      await sleep(1000);

      // Tìm nút Bỏ thích / Bỏ theo dõi trong menu xổ xuống
      const menuItems = document.querySelectorAll(
        'div[role="menuitem"] span, div[role="none"] span',
      );
      let unfollowBtn = null;

      for (const item of menuItems) {
        if (CONFIG.UNFOLLOW_KEYWORDS.includes(item.textContent.trim())) {
          unfollowBtn = item.closest('div[role="menuitem"]') || item;
          break;
        }
      }

      if (unfollowBtn) {
        unfollowBtn.click();
        await sleep(1000);
        return true;
      } else {
        // Đóng menu nếu đây là toggle trực tiếp
        clickTarget.click();
        return true;
      }
    } catch (err) {
      return false;
    }
  };

  const processQueue = async () => {
    while (true) {
      const buttons = getPageButtons();

      if (buttons.length === 0) {
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(3000);

        const recheckButtons = getPageButtons();
        if (recheckButtons.length === 0) {
          break;
        }
        continue;
      }

      const success = await unfollowPage(buttons[0]);

      if (success) {
        await sleep(getRandomDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY));
      } else {
        await sleep(1500);
      }
    }
  };

  const init = async () => {
    await processQueue();
  };

  init();
})();
