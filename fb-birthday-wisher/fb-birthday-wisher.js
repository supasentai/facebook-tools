/**
 * Facebook Auto Birthday Wisher Utility
 * Repository: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    // Danh sách các câu chúc mừng sinh nhật ngẫu nhiên (Hỗ trợ tùy chỉnh)
    MESSAGES: [
      "Chúc bạn sinh nhật vui vẻ, luôn may mắn và thành công nhé! 🥳🎉",
      "Happy Birthday! Chúc bạn tuổi mới nhiều niềm vui và hạnh phúc! 🎂✨",
      "Chúc mừng sinh nhật bạn nhé! Tuổi mới gặt hái được nhiều thành công! 🎈🎊",
      "Happy Birthday! Chúc bạn có một ngày sinh nhật thật tuyệt vời bên gia đình và bạn bè! 🍰🥂",
    ],

    INPUT_SELECTOR: 'div[role="textbox"][contenteditable="true"]',
    SUBMIT_TEXTS: ["Đăng", "Post", "Gửi", "Send"],

    MIN_DELAY: 2500,
    MAX_DELAY: 5000,
  };

  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getRandomDelay = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const postWish = async (inputBox) => {
    try {
      const message = getRandomElement(CONFIG.MESSAGES);

      // 1. Focus vào ô nhập liệu
      inputBox.focus();
      await sleep(500);

      // 2. Kích hoạt sự kiện Paste để đồng bộ trạng thái React
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/plain", message);

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      });

      inputBox.dispatchEvent(pasteEvent);
      await sleep(1000);

      // 3. Tìm nút Đăng/Post gần ô input đó
      const parentContainer =
        inputBox.closest("form") ||
        inputBox.closest('div[role="form"]') ||
        inputBox.parentElement.parentElement;
      let submitBtn = null;

      if (parentContainer) {
        const buttons = parentContainer.querySelectorAll(
          'div[role="button"], button',
        );
        for (const btn of buttons) {
          if (CONFIG.SUBMIT_TEXTS.includes(btn.textContent.trim())) {
            submitBtn = btn;
            break;
          }
        }
      }

      // 4. Gửi bài chúc
      if (submitBtn) {
        submitBtn.click();
      } else {
        const enterEvent = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
        });
        inputBox.dispatchEvent(enterEvent);
      }

      await sleep(1000);
      return true;
    } catch (err) {
      return false;
    }
  };

  const init = async () => {
    const inputBoxes = Array.from(
      document.querySelectorAll(CONFIG.INPUT_SELECTOR),
    ).filter((box) => box.offsetWidth > 0 && box.offsetHeight > 0);

    if (inputBoxes.length === 0) {
      return;
    }

    let count = 0;

    for (let i = 0; i < inputBoxes.length; i++) {
      const success = await postWish(inputBoxes[i]);

      if (success) {
        count++;
        await sleep(getRandomDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY));
      }
    }
  };

  init();
})();
