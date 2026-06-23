/**
 * Facebook Newsfeed Ad & Suggestion Cleaner
 * GitHub: supasentai/facebook-tools
 */

(function () {
  "use strict";

  // CẤU HÌNH SCRIPT
  const CONFIG = {
    // Các từ khóa nhận diện bài viết rác (Hỗ trợ đa ngôn ngữ)
    KEYWORDS: [
      "Được tài trợ",
      "Sponsored",
      "Gợi ý cho bạn",
      "Suggested for you",
      "Popular on Facebook",
      "Được đề xuất",
    ],
    // Selector nhắm vào thẻ bao quanh toàn bộ một bài viết trên Newsfeed
    POST_SELECTOR:
      'div[data-testid="fbfeed_story"], div[role="feed"] > div, div[class*="x1lliihq"]',
  };

  let removedCount = 0;

  const cleanFeed = (rootNode) => {
    // Tìm tất cả các thẻ span có khả năng chứa chữ quảng cáo/gợi ý
    const spans = rootNode.querySelectorAll("span");

    spans.forEach((span) => {
      const text = span.textContent.trim();

      if (CONFIG.KEYWORDS.includes(text)) {
        // Tìm ngược lên thẻ cha chứa toàn bộ bài viết đó
        // Facebook sử dụng cấu trúc div lồng sâu, ta dùng bộ lọc kết hợp để tìm container bài viết
        const postContainer =
          span.closest('div[role="article"]') ||
          span.closest('div[data-pagelet^="FeedUnit"]') ||
          span.closest('div[data-testid="keyPath_feed_story"]');

        if (postContainer && postContainer.style.display !== "none") {
          // Ẩn hoàn toàn bài viết khỏi màn hình thay vì xóa hẳn (xóa hẳn dễ gây lỗi render của React)
          postContainer.style.display = "none";
          removedCount++;
        }
      }
    });
  };

  const init = () => {
    // Chạy quét một lần ngay khi kích hoạt script cho các bài viết đang có sẵn
    cleanFeed(document);

    // Khởi tạo MutationObserver để lắng nghe Newsfeed khi cuộn chuột (Infinite Scroll)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            // Chỉ quét các node hợp lệ là Element HTML
            if (node.nodeType === Node.ELEMENT_NODE) {
              cleanFeed(node);
            }
          });
        }
      });
    });

    // Tìm phần tử feed tổng để theo dõi biến động
    const targetTarget =
      document.querySelector('div[role="feed"]') || document.body;

    observer.observe(targetTarget, {
      childList: true,
      subtree: true,
    });
  };

  init();
})();
