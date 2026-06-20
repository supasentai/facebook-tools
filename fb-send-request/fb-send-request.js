/**
 * Facebook Auto Friend Request Sender
 * GitHub: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    TARGET_SELECTOR:
      'div[role="button"] i[style*="/assets/"] + span, div[role="none"] span',
    TARGET_TEXTS: ["Thêm bạn bè", "Add Friend"],
    CONTAINER_DEPTH: 'div[role="button"]',

    MIN_DELAY: 1500,
    MAX_DELAY: 4000,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getAddFriendButtons = () => {
    const elements = document.querySelectorAll("span");
    return Array.from(elements).filter((el) => {
      const text = el.textContent.trim();
      return CONFIG.TARGET_TEXTS.includes(text);
    });
  };

  const processQueue = async () => {
    const buttons = getAddFriendButtons();
    let count = 0;

    for (let i = 0; i < buttons.length; i++) {
      const clickTarget = buttons[i].closest(CONFIG.CONTAINER_DEPTH);

      if (
        clickTarget &&
        clickTarget.offsetWidth > 0 &&
        clickTarget.offsetHeight > 0
      ) {
        clickTarget.click();
        count++;

        const nextDelay = getRandomDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY);
        await sleep(nextDelay);
      }
    }
  };

  const init = async () => {
    await processQueue();
  };

  init();
})();
