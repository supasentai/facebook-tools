/**
 * Facebook Cancel Sent Friend Requests Utility
 * Repository: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    CANCEL_TEXTS: ["Hủy yêu cầu", "Cancel Request", "Hủy lời mời"],
    CONTAINER_DEPTH: 'div[role="button"]',
    MIN_DELAY: 1500,
    MAX_DELAY: 3500,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getCancelButtons = () => {
    const spans = document.querySelectorAll("span");
    return Array.from(spans).filter((span) => {
      const text = span.textContent.trim();
      return CONFIG.CANCEL_TEXTS.includes(text);
    });
  };

  const processQueue = async () => {
    let count = 0;

    while (true) {
      const buttons = getCancelButtons();

      if (buttons.length === 0) {
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(2500);

        const recheckButtons = getCancelButtons();
        if (recheckButtons.length === 0) {
          break;
        }
        continue;
      }

      const clickTarget =
        buttons[0].closest(CONFIG.CONTAINER_DEPTH) || buttons[0];

      if (
        clickTarget &&
        clickTarget.offsetWidth > 0 &&
        clickTarget.offsetHeight > 0
      ) {
        clickTarget.click();
        count++;
        await sleep(getRandomDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY));
      } else {
        await sleep(1000);
      }
    }
  };

  const init = async () => {
    await processQueue();
  };

  init();
})();
