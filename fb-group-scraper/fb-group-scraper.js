/**
 * Facebook Group Member Scraper (Nâng cấp toàn diện)
 * Repository: supasentai/facebook-tools
 * 
 * Các tính năng đã được tối ưu:
 * 1. Cào cuốn chiếu (Real-time Scraping): Cào liên tục vào Map ngay trong quá trình cuộn, không sợ mất do Facebook Virtualized DOM.
 * 2. Sửa lỗi mất ID dạng profile.php?id=... (Code cũ cắt bỏ tham số dẫn đến hàng loạt thành viên bị gộp làm một và bỏ sót).
 * 3. Hỗ trợ đầy đủ Vanity URL (Username cá nhân tùy biến) và link dạng /groups/.../user/...
 * 4. Kỹ thuật cuộn Jiggle (nhấp nhô) kích hoạt IntersectionObserver của Facebook, chống dừng cuộn non.
 * 5. Tự động kiểm tra Spinner/Loading để kiên nhẫn chờ Facebook nạp dữ liệu.
 * 6. Floating Status UI trực quan trên màn hình hiển thị số lượng thành viên real-time và nút "Dừng & Tải CSV".
 */

(function () {
  "use strict";

  // Cấu hình scraper
  const CONFIG = {
    SCROLL_INTERVAL: 1800,        // Thời gian chờ sau mỗi lần cuộn (ms)
    MAX_SCROLL_ATTEMPTS: 15,      // Số lần thử cuộn lại nếu chiều cao trang chưa đổi (tăng từ 5 -> 15 để tránh dừng non)
    SCROLL_BACK_PIXELS: 350,      // Nhích ngược lên để kích hoạt IntersectionObserver của Facebook
    CSV_FILENAME: `fb_group_members_${Date.now()}.csv`
  };

  let isManualStopped = false;
  window.STOP_FB_SCRAPER = () => {
    isManualStopped = true;
    console.log("%c[FB Scraper] Nhận lệnh dừng thủ công! Đang hoàn tất và xuất file CSV...", "color: orange; font-weight: bold;");
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Tạo khung thông báo trạng thái nổi trên màn hình (Floating HUD)
  const createStatusOverlay = () => {
    const overlayId = "fb-scraper-hud";
    const existing = document.getElementById(overlayId);
    if (existing) existing.remove();

    const hud = document.createElement("div");
    hud.id = overlayId;
    Object.assign(hud.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "999999",
      backgroundColor: "#1c1e21",
      color: "#ffffff",
      padding: "16px 20px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      fontFamily: "Segoe UI, Helvetica, Arial, sans-serif",
      fontSize: "14px",
      lineHeight: "1.5",
      maxWidth: "340px",
      border: "1px solid #3a3b3c"
    });

    hud.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="color: #2e89ff; font-size:15px;">Facebook Group Scraper</strong>
        <span id="fb-scraper-spinner" style="font-size:12px; color:#31a24c; font-weight:bold;">Đang cào...</span>
      </div>
      <div style="margin-bottom:6px;">Đã thu thập: <b id="fb-scraper-count" style="color:#00e676; font-size:16px;">0</b> thành viên</div>
      <div style="font-size:12px; color:#b0b3b8; margin-bottom:12px;" id="fb-scraper-status">Đang khởi tạo trình cuộn...</div>
      <button id="fb-scraper-btn-stop" style="
        width: 100%;
        background-color: #e41e3f;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        font-size: 13px;
      ">Dừng lại & Xuất file CSV</button>
    `;

    document.body.appendChild(hud);

    document.getElementById("fb-scraper-btn-stop").addEventListener("click", () => {
      window.STOP_FB_SCRAPER();
      const btn = document.getElementById("fb-scraper-btn-stop");
      if (btn) {
        btn.disabled = true;
        btn.innerText = "Đang xuất CSV...";
        btn.style.backgroundColor = "#666";
      }
    });

    return {
      update: (count, status) => {
        const countEl = document.getElementById("fb-scraper-count");
        const statusEl = document.getElementById("fb-scraper-status");
        if (countEl) countEl.innerText = count;
        if (statusEl) statusEl.innerText = status;
      },
      finish: (total) => {
        const spinner = document.getElementById("fb-scraper-spinner");
        const statusEl = document.getElementById("fb-scraper-status");
        if (spinner) {
          spinner.innerText = "Hoàn tất";
          spinner.style.color = "#00e676";
        }
        if (statusEl) statusEl.innerText = `Đã xuất ${total} thành viên vào file CSV!`;
      }
    };
  };

  // Làm sạch và chuẩn hóa Profile URL
  const cleanProfileUrl = (rawUrl) => {
    if (!rawUrl) return null;
    try {
      let url = rawUrl;
      if (url.startsWith("/")) {
        url = `https://www.facebook.com${url}`;
      }
      const parsed = new URL(url);

      // Nếu là link dạng ID: profile.php?id=1000...
      if (parsed.pathname === "/profile.php") {
        const id = parsed.searchParams.get("id");
        return id ? `https://www.facebook.com/profile.php?id=${id}` : null;
      }

      // Nếu là link dạng nhóm lồng profile: /groups/.../user/1000...
      if (parsed.pathname.includes("/user/")) {
        const match = parsed.pathname.match(/\/user\/([0-9a-zA-Z._]+)/);
        if (match) {
          return `https://www.facebook.com/user/${match[1]}/`;
        }
      }

      // Loại bỏ các link nội bộ nhóm không phải profile
      if (
        parsed.pathname.includes("/permalink/") ||
        parsed.pathname.includes("/posts/") ||
        parsed.pathname.includes("/photos/") ||
        parsed.pathname.includes("/events/") ||
        parsed.pathname.endsWith("/members") ||
        parsed.pathname.endsWith("/members/") ||
        parsed.pathname.endsWith("/about")
      ) {
        return null;
      }

      // Link username cá nhân thông thường: /username
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length === 1 && !["groups", "messages", "notifications", "watch", "marketplace"].includes(parts[0])) {
        return `https://www.facebook.com/${parts[0]}`;
      }

      return `${parsed.origin}${parsed.pathname}`;
    } catch (e) {
      return null;
    }
  };

  // Xuất file CSV hỗ trợ tiếng Việt có BOM
  const downloadCSV = (data, filename = CONFIG.CSV_FILENAME) => {
    if (!data || !data.length) {
      console.warn("[FB Scraper] Không có dữ liệu để xuất file.");
      return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
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

  // Bóc tách cuốn chiếu các thành viên đang hiển thị trong DOM
  const harvestVisibleMembers = (extractedMembers) => {
    // Tìm các thẻ member card tiềm năng
    const potentialCards = document.querySelectorAll('div[role="listitem"], div[class*="x1yztbdb"], div[data-visualcompletion="ignore-dynamic"]');
    
    // Nếu selector card không bắt được do FB đổi class, quét qua tất cả thẻ a có link user
    const links = document.querySelectorAll('a[role="link"][href*="/user/"], a[role="link"][href*="profile.php"], a[role="link"]');

    links.forEach((link) => {
      const rawHref = link.getAttribute("href") || "";
      const text = link.textContent.trim();

      // Bỏ qua nếu không có tên hoặc text quá ngắn / nút chức năng
      if (!text || text.length < 2) return;
      if (["Nhắn tin", "Message", "Thêm bạn bè", "Add friend", "Theo dõi", "Follow", "Xem thêm", "See more"].includes(text)) return;

      const profileUrl = cleanProfileUrl(rawHref);
      if (!profileUrl || extractedMembers.has(profileUrl)) return;

      // Tìm vai trò / Role (Quản trị viên, Người điều hành...)
      let role = "Thành viên";
      const card = link.closest('div[role="listitem"], div[class*="x1yztbdb"]') || link.parentElement?.parentElement;
      if (card) {
        const badgeEl = card.querySelector('span[class*="x1lliihq"], span[dir="auto"]');
        if (badgeEl) {
          const badgeText = badgeEl.textContent.trim();
          if (badgeText && badgeText !== text && badgeText.length < 50) {
            role = badgeText;
          }
        }
      }

      extractedMembers.set(profileUrl, {
        "Họ và tên": text,
        "Đường dẫn Profile": profileUrl,
        "Vai trò": role,
        "Thời gian cào": new Date().toLocaleTimeString()
      });
    });
  };

  // Kiểm tra xem Facebook có đang hiện spinner quay quay tải trang không
  const isFacebookLoading = () => {
    const spinner = document.querySelector('[role="progressbar"], div[aria-busy="true"], svg[aria-label*="Loading"], svg[aria-label*="Đang tải"]');
    return spinner !== null;
  };

  const getScrollHeight = () => {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.scrollingElement ? document.scrollingElement.scrollHeight : 0
    );
  };

  // Hàm khởi chạy chính
  const init = async () => {
    console.log("%c[FB Scraper] Khởi động trình cào thành viên nhóm tối ưu!", "color: #2e89ff; font-weight: bold; font-size: 14px;");
    console.log("%c[FB Scraper] Bạn có thể gõ STOP_FB_SCRAPER() bất cứ lúc nào để dừng và xuất dữ liệu hiện tại.", "color: #888;");

    const hud = createStatusOverlay();
    const extractedMembers = new Map();

    let lastHeight = getScrollHeight();
    let sameHeightCount = 0;
    let loopCount = 0;

    while (sameHeightCount < CONFIG.MAX_SCROLL_ATTEMPTS && !isManualStopped) {
      loopCount++;

      // 1. Cào cuốn chiếu ngay lập tức những gì đang có trên màn hình
      harvestVisibleMembers(extractedMembers);
      hud.update(extractedMembers.size, `Đang cuộn (Vòng ${loopCount})...`);

      // 2. Cuộn xuống đáy trang
      const currentHeight = getScrollHeight();
      window.scrollTo(0, currentHeight);

      // Kỹ thuật Jiggle: Nếu đã thử nhiều lần mà chưa có dữ liệu mới, cuộn ngược lên một chút để đánh thức IntersectionObserver
      if (sameHeightCount > 1) {
        await sleep(400);
        window.scrollBy(0, -CONFIG.SCROLL_BACK_PIXELS);
        await sleep(300);
        window.scrollTo(0, getScrollHeight());
      }

      await sleep(CONFIG.SCROLL_INTERVAL);

      // 3. Kiểm tra chiều cao mới
      const newHeight = getScrollHeight();
      const isLoading = isFacebookLoading();

      if (newHeight === lastHeight) {
        if (isLoading) {
          // Facebook đang xoay spinner fetch mạng, không đếm phạt
          hud.update(extractedMembers.size, `Facebook đang tải thêm dữ liệu (Chờ mạng)...`);
          await sleep(1500);
        } else {
          sameHeightCount++;
          hud.update(extractedMembers.size, `Chờ dữ liệu mới (${sameHeightCount}/${CONFIG.MAX_SCROLL_ATTEMPTS})...`);
        }
      } else {
        sameHeightCount = 0;
        lastHeight = newHeight;
      }
    }

    // Cào vét lần cuối trước khi xuất file
    harvestVisibleMembers(extractedMembers);
    const finalData = Array.from(extractedMembers.values());

    console.log(`%c[FB Scraper] Đã hoàn thành! Tổng số thành viên thu thập được: ${finalData.length}`, "color: #00e676; font-weight: bold; font-size: 14px;");
    hud.finish(finalData.length);

    if (finalData.length > 0) {
      downloadCSV(finalData);
    } else {
      alert("Không tìm thấy thành viên nào. Hãy chắc chắn rằng bạn đang ở tab Thành viên (Members) của nhóm!");
    }
  };

  init();
})();
