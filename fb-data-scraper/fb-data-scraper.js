/**
 * Facebook Data Scraper (Interaction & Comment Extractor)
 * GitHub: supasentai/facebook-tools
 */

(function () {
    'use strict';

    const CONFIG = {
        COMMENT_SELECTOR: 'div[role="article"]',
        USER_LINK_SELECTOR: 'a[role="link"]',
        COMMENT_TEXT_SELECTOR: 'div[dir="auto"]'
    };

    const downloadCSV = (data, filename = 'fb_scraped_data.csv') => {
        if (!data || !data.length) return;
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => 
            Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        
        const csvContent = '\uFEFF' + [headers, ...rows].join('\n'); // Thêm BOM để tránh lỗi font tiếng Việt trên Excel
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const scrapeComments = () => {
        const commentElements = document.querySelectorAll(CONFIG.COMMENT_SELECTOR);
        const extractedData = [];

        commentElements.forEach(comment => {
            const userLink = comment.querySelector(CONFIG.USER_LINK_SELECTOR);
            const commentTextEl = comment.querySelector(CONFIG.COMMENT_TEXT_SELECTOR);

            if (userLink && commentTextEl) {
                const userName = userLink.textContent.trim();
                let profileUrl = userLink.getAttribute('href') || '';
                
                if (profileUrl.includes('?')) {
                    profileUrl = profileUrl.split('?')[0];
                }

                const commentText = commentTextEl.textContent.trim();

                if (userName && commentText && !profileUrl.includes('/groups/')) {
                    extractedData.push({
                        'Author Name': userName,
                        'Profile URL': profileUrl,
                        'Comment Content': commentText
                    });
                }
            }
        });

        if (extractedData.length > 0) {
            downloadCSV(extractedData, `fb_comments_${Date.now()}.csv`);
        }
    };

    const init = () => {
        scrapeComments();
    };

    init();
})();