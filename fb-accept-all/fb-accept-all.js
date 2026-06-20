/**
 * Facebook Auto Friend Request Acceptor
 * GitHub: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    TARGET_SELECTOR: "span.x1lliihq.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft",
    TARGET_TEXT: "Xác nhận",
    CONTAINER_DEPTH: 'div[role="none"]',
    MIN_DELAY: 500,
    MAX_DELAY: 1200,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getTargetButtons = () => {
    const elements = document.querySelectorAll(CONFIG.TARGET_SELECTOR);
    return Array.from(elements).filter(
      (el) => el.textContent.trim() === CONFIG.TARGET_TEXT,
    );
  };

  const processQueue = async () => {
    const buttons = getTargetButtons();

    for (let i = 0; i < buttons.length; i++) {
      const clickTarget = buttons[i].closest(CONFIG.CONTAINER_DEPTH);
      if (clickTarget) {
        clickTarget.click();
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
