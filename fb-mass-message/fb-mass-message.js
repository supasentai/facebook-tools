/**
 * Facebook Mass Message Sender
 * GitHub: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    MESSAGE_CONTENT:
      "Xin chào! Đây là tin nhắn tự động gửi từ bộ công cụ facebook-tools của tôi. Chúc bạn một ngày tốt lành!",

    CONVERSATION_SELECTOR:
      'div[role="row"] a[role="link"], div[role="navigation"] a[href*="/messages/t/"]',
    INPUT_SELECTOR: 'div[role="textbox"]',
    SEND_BUTTON_SELECTOR:
      'div[aria-label^="Nhấn Enter"], div[role="button"][tabindex="0"] > svg path[d*="M16.5"]',

    MIN_DELAY: 3000,
    MAX_DELAY: 7000,
  };

  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const sendMessage = async (chatLinkElement) => {
    try {
      chatLinkElement.click();
      await sleep(2500);

      const textboxes = document.querySelectorAll(CONFIG.INPUT_SELECTOR);
      let inputField = null;

      for (let box of textboxes) {
        if (box.getAttribute("contenteditable") === "true") {
          inputField = box;
          break;
        }
      }

      if (!inputField) {
        return false;
      }
      inputField.focus();
      await sleep(200);

      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/plain", CONFIG.MESSAGE_CONTENT);

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      });

      inputField.dispatchEvent(pasteEvent);
      await sleep(1000);

      let sendBtn = document.querySelector(
        'div[aria-label="Nhấn Enter để gửi"], div[aria-label="Press Enter to send"]',
      );

      if (!sendBtn) {
        const enterDown = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
        });
        inputField.dispatchEvent(enterDown);
      } else {
        sendBtn.click();
      }

      await sleep(500);
      return true;
    } catch (err) {
      return false;
    }
  };

  const init = async () => {
    const conversations = Array.from(
      document.querySelectorAll(CONFIG.CONVERSATION_SELECTOR),
    );
    const uniqueConversations = [...new Set(conversations)];

    if (uniqueConversations.length === 0) {
      return;
    }

    for (let i = 0; i < uniqueConversations.length; i++) {
      if (
        uniqueConversations[i].offsetWidth === 0 &&
        uniqueConversations[i].offsetHeight === 0
      )
        continue;

      const success = await sendMessage(uniqueConversations[i]);

      if (success) {
        const nextDelay = getRandomDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY);
        await sleep(nextDelay);
      }
    }
  };

  init();
})();
