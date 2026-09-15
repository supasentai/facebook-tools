/**
 * Facebook Auto Poke / Poke Back Utility
 * Repository: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    POKE_TEXTS: ["Chọc", "Poke", "Chọc lại", "Poke Back"],
    CONTAINER_DEPTH: 'div[role="button"]',
    MIN_DELAY: 1000,
    MAX_DELAY: 3000,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getPokeButtons = () => {
    const spans = document.querySelectorAll("span");
    return Array.from(spans).filter((span) => {
      const text = span.textContent.trim();
      return CONFIG.POKE_TEXTS.includes(text);
    });
  };

  const processQueue = async () => {
    let count = 0;

    while (true) {
      const buttons = getPokeButtons();

      if (buttons.length === 0) {
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(2500);

        const recheckButtons = getPokeButtons();
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
