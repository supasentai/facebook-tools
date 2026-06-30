/**
 * Facebook Newsfeed Ad & Suggestion Cleaner
 * GitHub: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    KEYWORDS: [
      "Được tài trợ",
      "Sponsored",
      "Gợi ý cho bạn",
      "Suggested for you",
      "Popular on Facebook",
      "Được đề xuất",
    ],
    POST_SELECTOR:
      'div[data-testid="fbfeed_story"], div[role="feed"] > div, div[class*="x1lliihq"]',
  };

  let removedCount = 0;

  const cleanFeed = (rootNode) => {
    const spans = rootNode.querySelectorAll("span");

    spans.forEach((span) => {
      const text = span.textContent.trim();

      if (CONFIG.KEYWORDS.includes(text)) {
        const postContainer =
          span.closest('div[role="article"]') ||
          span.closest('div[data-pagelet^="FeedUnit"]') ||
          span.closest('div[data-testid="keyPath_feed_story"]');

        if (postContainer && postContainer.style.display !== "none") {
          postContainer.style.display = "none";
          removedCount++;
        }
      }
    });
  };

  const init = () => {
    cleanFeed(document);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              cleanFeed(node);
            }
          });
        }
      });
    });

    const targetTarget =
      document.querySelector('div[role="feed"]') || document.body;

    observer.observe(targetTarget, {
      childList: true,
      subtree: true,
    });
  };

  init();
})();
