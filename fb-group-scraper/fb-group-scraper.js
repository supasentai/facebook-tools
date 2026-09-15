/**
 * Facebook Group Member Scraper
 * Repository: supasentai/facebook-tools
 */

(function () {
  "use strict";

  const CONFIG = {
    MEMBER_CARD_SELECTOR: 'div[role="listitem"], div[class*="x1yztbdb"]',
    PROFILE_LINK_SELECTOR:
      'a[role="link"][href*="/user/"], a[role="link"][href*="profile.php"], a[role="link"]',
    BADGE_SELECTOR: 'span[class*="x1lliihq"]',
    SCROLL_INTERVAL: 2000,
    MAX_SCROLL_ATTEMPTS: 5,
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const downloadCSV = (data, filename = "group_members.csv") => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const scrapeMembers = () => {
    const memberElements = document.querySelectorAll(
      CONFIG.MEMBER_CARD_SELECTOR,
    );
    const extractedMembers = new Map();

    memberElements.forEach((card) => {
      const links = card.querySelectorAll(CONFIG.PROFILE_LINK_SELECTOR);
      let userLinkEl = null;

      for (const link of links) {
        const href = link.getAttribute("href") || "";
        const text = link.textContent.trim();
        if (
          text &&
          (href.includes("/user/") ||
            href.includes("profile.php") ||
            href.includes("/groups/"))
        ) {
          userLinkEl = link;
          break;
        }
      }

      if (userLinkEl) {
        const name = userLinkEl.textContent.trim();
        let profileUrl = userLinkEl.getAttribute("href") || "";

        if (profileUrl.includes("?")) {
          profileUrl = profileUrl.split("?")[0];
        }

        if (profileUrl.startsWith("/")) {
          profileUrl = `https://www.facebook.com${profileUrl}`;
        }

        const badgeEl = card.querySelector(CONFIG.BADGE_SELECTOR);
        const role = badgeEl ? badgeEl.textContent.trim() : "Member";

        if (name && profileUrl && !extractedMembers.has(profileUrl)) {
          extractedMembers.set(profileUrl, {
            "Full Name": name,
            "Profile URL": profileUrl,
            "Role / Status": role,
          });
        }
      }
    });

    return Array.from(extractedMembers.values());
  };

  const init = async () => {
    let lastHeight = document.body.scrollHeight;
    let sameHeightCount = 0;

    while (sameHeightCount < CONFIG.MAX_SCROLL_ATTEMPTS) {
      window.scrollTo(0, document.body.scrollHeight);
      await sleep(CONFIG.SCROLL_INTERVAL);

      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) {
        sameHeightCount++;
      } else {
        sameHeightCount = 0;
        lastHeight = newHeight;
      }
    }

    const data = scrapeMembers();

    if (data.length > 0) {
      downloadCSV(data, `fb_group_members_${Date.now()}.csv`);
    }
  };

  init();
})();
