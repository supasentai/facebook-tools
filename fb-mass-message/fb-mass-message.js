/**
 * Facebook Mass Message Sender
 * GitHub: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    MESSAGE_CONTENT:
      "Xin chào! Đây là tin nhắn tự động gửi từ bộ công cụ facebook-tools của tôi. Chúc bạn một ngày tốt lành!",

    CONVERSATION_SELECTOR: 'div[role="row"] a[role="link"]',
    INPUT_SELECTOR: 'div[role="textbox"][aria-label="Tin nhắn"]',
    SEND_BUTTON_SELECTOR: 'div[aria-label="Nhấn Enter để gửi"]',

    MIN_DELAY: 3000,
    MAX_DELAY: 7000,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const sendMessage = async (chatLinkElement) => {
    chatLinkElement.click();
    await sleep(2000);

    const inputField = document.querySelector(CONFIG.INPUT_SELECTOR);
    if (!inputField) return false;

    inputField.focus();

    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", CONFIG.MESSAGE_CONTENT);

    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true,
    });

    inputField.dispatchEvent(pasteEvent);
    await sleep(800);

    const sendBtn = document.querySelector(CONFIG.SEND_BUTTON_SELECTOR);
    if (sendBtn) {
      sendBtn.click();
      await sleep(500);
      return true;
    } else {
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      inputField.dispatchEvent(enterEvent);
      return true;
    }
  };
  const init = async () => {
    const conversations = Array.from(
      document.querySelectorAll(CONFIG.CONVERSATION_SELECTOR),
    );

    if (conversations.length === 0) {
      return;
    }

    for (let i = 0; i < conversations.length; i++) {
      const success = await sendMessage(conversations[i]);

      if (success) {
        const nextDelay = getRandomDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY);
        await sleep(nextDelay);
      }
    }
  };

  init();
})();
