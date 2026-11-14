// ==================== 平滑滾動導航 ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // 關閉手機選單（如果有開啟）
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.remove('active');
            }

            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== 導航列滾動效果 ====================
const navbar = document.querySelector('.navbar');

if (navbar) {
    let navbarScrolled = null;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrolled = scrollTop > 100;

        // 只在狀態改變時寫入，避免每次 scroll 都觸發 style recalc
        if (scrolled !== navbarScrolled) {
            navbarScrolled = scrolled;
            navbar.style.boxShadow = scrolled
                ? '0 4px 8px rgba(0, 0, 0, 0.1)'
                : '0 1px 3px rgba(0, 0, 0, 0.06)';
        }
    }, { passive: true });
}

// ==================== 導航選單高亮 ====================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

function highlightNavigation() {
    const scrollPosition = window.scrollY + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// 註：scroll 監聽統一註冊在檔案下方的 optimizedScrollHandler（已 debounce），
// 此處不要再綁一次未節流的版本，否則 debounce 形同虛設。

// ==================== 手機選單切換 ====================
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');

        // 動畫效果
        const spans = menuToggle.querySelectorAll('span');
        if (menuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
        } else {
            spans.forEach(span => {
                span.style.transform = '';
                span.style.opacity = '';
            });
        }
    });
}

// 註：initializePage() 統一由檔案下方唯一一處 DOMContentLoaded 呼叫。
// 這裡曾重複註冊過一次，導致所有初始化（輪播 interval、BibTeX listener、
// IntersectionObserver）都被建立兩份。

// ==================== 滾動顯示動畫 ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            // 如果是技能條，觸發進度動畫
            if (entry.target.classList.contains('expertise-category')) {
                const skillBars = entry.target.querySelectorAll('.skill-progress');
                skillBars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                });
            }
        }
    });
}, observerOptions);

// 為需要動畫的元素添加觀察
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.research-project, .publication-item, .patent-card, .award-card-compact, .early-achievements-compact, .expertise-category, .contact-card'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ==================== 統計數字動畫 ====================
function animateCounter(element, start, end, duration, suffix = '') {
    let startTime = null;
    const originalText = element.textContent;

    const step = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = currentValue + suffix;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end + suffix;
        }
    };

    window.requestAnimationFrame(step);
}

// 初始化統計數字動畫（延遲到 initializePage 中調用）
function initStatsAnimation() {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statValues = entry.target.querySelectorAll('.stat-value');

                statValues.forEach(stat => {
                    // 避免重複動畫
                    if (stat.dataset.animated === 'true') return;
                    stat.dataset.animated = 'true';

                    const text = stat.textContent;
                    const numberMatch = text.match(/\d+/);

                    if (numberMatch) {
                        const number = parseInt(numberMatch[0]);
                        const suffix = text.replace(/\d+/, '');
                        animateCounter(stat, 0, number, 1500, suffix);
                    }
                });

                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const quickStats = document.querySelector('.quick-stats');
    if (quickStats) {
        statsObserver.observe(quickStats);
    }
}

// ==================== YouTube 滾動自動播放 ====================
let youtubePlayers = {};

// 1. 動態載入 YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. API 準備好後會呼叫此函數
window.onYouTubeIframeAPIReady = function() {
    const playerDivs = document.querySelectorAll('.youtube-player');
    playerDivs.forEach(playerDiv => {
        const videoId = playerDiv.dataset.videoId;
        const playerId = playerDiv.id;
        const startTime = parseInt(playerDiv.dataset.start) || 0; // 讀取開始時間（秒），預設為 0

        const player = new YT.Player(playerId, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'mute': 1,
                'controls': 0,
                'loop': 1,
                'playlist': videoId, // loop需要playlist
                'start': startTime, // 設定開始時間
                'modestbranding': 1,
                'showinfo': 0,
                'rel': 0
            },
            events: {
                'onReady': onPlayerReady
            }
        });
        youtubePlayers[playerId] = player;
    });
};

// 3. 播放器準備好後的處理
function onPlayerReady(event) {
    const player = event.target;
    const playerWrapper = player.getIframe().closest('.video-wrapper');

    // 設定預設播放速度為 2x
    player.setPlaybackRate(2);

    // 建立速度控制按鈕
    const speedButton = document.createElement('div');
    speedButton.className = 'speed-button';
    speedButton.textContent = '2x';
    speedButton.dataset.currentSpeed = '2';
    playerWrapper.appendChild(speedButton);

    // 速度選項
    const speedOptions = [1, 1.25, 1.5, 1.75, 2];
    speedButton.addEventListener('click', () => {
        const currentIndex = speedOptions.indexOf(parseFloat(speedButton.dataset.currentSpeed));
        const nextIndex = (currentIndex + 1) % speedOptions.length;
        const newSpeed = speedOptions[nextIndex];
        player.setPlaybackRate(newSpeed);
        speedButton.dataset.currentSpeed = newSpeed.toString();
        speedButton.textContent = newSpeed === 1 ? '1x' : newSpeed + 'x';
    });

    // 建立取消靜音按鈕
    const unmuteButton = document.createElement('div');
    unmuteButton.className = 'unmute-button';
    unmuteButton.innerHTML = `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
        <path fill="currentColor" d="M1.7,14.7L3.1,16.1L4.8,14.4L6.5,16.1L7.9,14.7L6.2,13L7.9,11.3L6.5,9.9L4.8,11.6L3.1,9.9L1.7,11.3L3.4,13L1.7,14.7Z" style="transform: scale(0.6) translate(28px, 6px);" />
    </svg>`;
    playerWrapper.appendChild(unmuteButton);

    unmuteButton.addEventListener('click', () => {
        player.unMute();
        unmuteButton.classList.add('hidden');
    });

    // 設定 Intersection Observer
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                player.playVideo();
            } else {
                player.pauseVideo();
            }
        });
    }, { threshold: 0.8 }); // 當80%的影片可見時觸發

    videoObserver.observe(playerWrapper);
}


// ==================== 非YouTube影片懶加載 ====================
document.addEventListener('DOMContentLoaded', () => {
    const otherVideoWrappers = document.querySelectorAll('.video-wrapper:not([data-video-type="youtube"])');
    const otherVideoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target.querySelector('iframe');
                const video = entry.target.querySelector('video');

                if (iframe && iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                    iframe.removeAttribute('data-src');
                }

                if (video && video.dataset.src) {
                    video.src = video.dataset.src;
                    video.removeAttribute('data-src');
                    video.load();
                }

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    otherVideoWrappers.forEach(wrapper => {
        otherVideoObserver.observe(wrapper);
    });
});


// ==================== 平滑滾動到頂部按鈕 ====================
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--color-accent);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    `;

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    let buttonVisible = null;

    window.addEventListener('scroll', () => {
        const visible = window.scrollY > 500;

        if (visible !== buttonVisible) {
            buttonVisible = visible;
            button.style.opacity = visible ? '1' : '0';
            button.style.visibility = visible ? 'visible' : 'hidden';
        }
    }, { passive: true });

    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-5px)';
        button.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    });

    document.body.appendChild(button);
}

// 初始化滾動到頂部按鈕
createScrollToTopButton();

// ==================== Google Drive 影片處理 ====================
function updateGoogleDriveVideos() {
    const gdriveWrappers = document.querySelectorAll('[data-video-type="gdrive"] iframe');

    gdriveWrappers.forEach(iframe => {
        const src = iframe.getAttribute('src');

        // 確保 Google Drive URL 格式正確
        if (src && src.includes('drive.google.com')) {
            const fileId = src.match(/\/d\/(.+?)\/|\/file\/d\/(.+?)\//);
            if (fileId && (fileId[1] || fileId[2])) {
                const id = fileId[1] || fileId[2];
                iframe.setAttribute('src', `https://drive.google.com/file/d/${id}/preview`);
            }
        }
    });
}

// 初始化 Google Drive 影片
document.addEventListener('DOMContentLoaded', updateGoogleDriveVideos);

// ==================== 本地影片控制 ====================
const localVideos = document.querySelectorAll('[data-video-type="local"] video');

localVideos.forEach(video => {
    // 添加播放/暫停控制
    video.addEventListener('click', function() {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    });

    // 錯誤處理
    video.addEventListener('error', function() {
        const wrapper = this.closest('.video-wrapper');
        if (wrapper) {
            const note = wrapper.querySelector('.video-note');
            if (note) {
                note.innerHTML = '<strong>錯誤:</strong> 無法載入影片。請確認影片檔案路徑是否正確。';
                note.style.background = '#f8d7da';
                note.style.borderColor = '#dc3545';
                note.style.color = '#721c24';
            }
        }
    });
});

// ==================== 複製引用功能 ====================
function addCopyBibTexFeature() {
    const bibTexLinks = document.querySelectorAll('.pub-link');

    bibTexLinks.forEach(link => {
        if (link.textContent.trim().toLowerCase().includes('bibtex')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                // 取得論文資訊
                const pubItem = this.closest('.publication-item');
                const title = pubItem.querySelector('.pub-title')?.textContent || '';
                const authors = pubItem.querySelector('.pub-authors')?.textContent || '';
                const venue = pubItem.querySelector('.pub-venue')?.textContent || '';

                // 生成 BibTeX（簡化版）
                const bibtex = `@article{citation_key,
  title={${title}},
  author={${authors}},
  journal={${venue}},
  year={2024}
}`;

                // 複製到剪貼簿
                navigator.clipboard.writeText(bibtex).then(() => {
                    const originalText = this.textContent;
                    this.textContent = '✓ Copied!';
                    this.style.background = '#d4edda';

                    setTimeout(() => {
                        this.textContent = originalText;
                        this.style.background = '';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    alert('無法複製到剪貼簿');
                });
            });
        }
    });
}

// 初始化複製 BibTeX 功能
document.addEventListener('DOMContentLoaded', addCopyBibTexFeature);

// ==================== 鍵盤快捷鍵 ====================
document.addEventListener('keydown', (e) => {
    // Esc 關閉手機選單
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    }

    // 數字鍵快速導航（1-8）
    if (e.key >= '1' && e.key <= '8' && !e.ctrlKey && !e.metaKey) {
        const index = parseInt(e.key) - 1;
        const links = Array.from(navLinks);
        if (links[index]) {
            links[index].click();
        }
    }
});

// ==================== 效能優化：防抖函數 ====================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 優化滾動事件
const optimizedScrollHandler = debounce(() => {
    highlightNavigation();
}, 50);

window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

// ==================== 視窗大小改變處理 ====================
let windowWidth = window.innerWidth;

window.addEventListener('resize', debounce(() => {
    const newWidth = window.innerWidth;

    // 從手機版切換到桌面版時，關閉選單
    if (windowWidth <= 768 && newWidth > 768) {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        if (menuToggle) {
            menuToggle.classList.remove('active');
        }
    }

    windowWidth = newWidth;
}, 250));

// ==================== 列印優化 ====================
window.addEventListener('beforeprint', () => {
    // 展開所有摺疊的內容
    document.querySelectorAll('.video-wrapper').forEach(wrapper => {
        const caption = wrapper.nextElementSibling;
        if (caption && caption.classList.contains('video-caption')) {
            const note = document.createElement('p');
            note.textContent = '(Video content - see online version)';
            note.style.fontStyle = 'italic';
            note.style.color = '#666';
            wrapper.parentNode.insertBefore(note, wrapper);
        }
    });
});

// ==================== 控制台彩蛋 ====================
console.log('%c🎓 Academic Portfolio', 'color: #3498db; font-size: 24px; font-weight: bold;');
console.log('%cBuilt with ❤️ for graduate school applications', 'color: #7f8c8d; font-size: 14px;');
console.log('%c\n📚 Tech Stack:', 'color: #2c3e50; font-size: 16px; font-weight: bold;');
console.log('• HTML5 Semantic Markup');
console.log('• CSS3 Grid & Flexbox');
console.log('• Vanilla JavaScript (ES6+)');
console.log('• Responsive Design');
console.log('• Intersection Observer API');
console.log('• Web Accessibility (WCAG)');
console.log('\n💡 Keyboard Shortcuts:');
console.log('• Press 1-8 to navigate between sections');
console.log('• Press ESC to close mobile menu');
console.log('\n🔗 Source: https://github.com/yourusername');

// ==================== 頁面載入完成 ====================
window.addEventListener('load', () => {
    console.log('✓ Page fully loaded');
    console.log(`✓ ${sections.length} sections detected`);
    console.log(`✓ ${document.querySelectorAll('.research-project').length} research projects`);
    console.log(`✓ ${document.querySelectorAll('.publication-item').length} publications`);
    console.log(`✓ ${document.querySelectorAll('.patent-card').length} patents`);
});

// ==================== Service Worker 註冊（PWA 支援） ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 可以在這裡註冊 service worker 以支援離線訪問
        // navigator.serviceWorker.register('/sw.js');
    });
}

// ==================== 無障礙功能增強 ====================
// 為所有互動元素添加鍵盤支援
document.querySelectorAll('.tech-badge, .skill-tag').forEach(element => {
    element.setAttribute('tabindex', '0');
    element.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            element.click();
        }
    });
});

// ==================== 影片自動暫停（離開視窗時） ====================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 暫停所有正在播放的影片
        document.querySelectorAll('video').forEach(video => {
            if (!video.paused) {
                video.pause();
                video.dataset.wasPlaying = 'true';
            }
        });
        // 暫停所有YouTube影片
        Object.values(youtubePlayers).forEach(player => {
            if (player && typeof player.pauseVideo === 'function' && player.getPlayerState() === 1) {
                player.pauseVideo();
            }
        });
    }
});

// ==================== 照片轮播图功能 ====================
function changeSlide(btn, direction) {
    const carousel = btn.closest('.photo-carousel');
    const images = carousel.querySelectorAll('.carousel-img');
    const dots = carousel.querySelectorAll('.dot');

    let currentIndex = 0;
    images.forEach((img, index) => {
        if (img.classList.contains('active')) {
            currentIndex = index;
        }
    });

    // 移除当前 active
    images[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');

    // 计算新索引
    let newIndex = currentIndex + direction;
    if (newIndex >= images.length) newIndex = 0;
    if (newIndex < 0) newIndex = images.length - 1;

    // 添加新 active
    images[newIndex].classList.add('active');
    dots[newIndex].classList.add('active');
}

function currentSlide(dot, index) {
    const carousel = dot.closest('.photo-carousel');
    const images = carousel.querySelectorAll('.carousel-img');
    const dots = carousel.querySelectorAll('.dot');

    // 移除所有 active
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    // 添加新 active
    images[index].classList.add('active');
    dots[index].classList.add('active');
}

// 自动轮播（每5秒切换一次）
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.photo-carousel');

    carousels.forEach(carousel => {
        setInterval(() => {
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            if (nextBtn) {
                changeSlide(nextBtn, 1);
            }
        }, 5000); // 5秒自动切换
    });
});

// ==================== 照片輪播功能（僅在需要時使用） ====================
// 注意：照片現已直接定義在 HTML 中，不再需要動態檢測
// 此區塊僅保留輪播功能供未來使用

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', initializePage);

function initializePage() {
    // 照片已直接定義在 HTML 中，不再需要動態檢測
    // 初始化其他功能
    updateGoogleDriveVideos(); // Ensure Google Drive videos are updated
    addCopyBibTexFeature(); // Initialize BibTeX copy feature

    // 初始化輪播自動播放（如果頁面中有輪播）
    const carousels = document.querySelectorAll('.photo-carousel');
    carousels.forEach(carousel => {
        setInterval(() => {
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            if (nextBtn) {
                changeSlide(nextBtn, 1);
            }
        }, 5000); // 5秒自動切換
    });

    // 初始化滾動動畫
    const animatedElements = document.querySelectorAll(
        '.research-project, .publication-item, .patent-card, .award-card-compact, .early-achievements-compact, .expertise-category, .contact-card'
    );
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // 初始化統計數字動畫
    initStatsAnimation();
}

// ==================== 手機版長文字收合 ====================
// 手機寬度時，摘要類長段落預設只顯示約 3 行，點「Read more」展開
function initMobileReadMore() {
    const mq = window.matchMedia('(max-width: 768px)');
    const selector = [
        '.project-details > .detail-section:first-child > p',
        '.pub-abstract',
        '.patent-abstract',
        '.column-text'
    ].join(', ');
    const items = Array.from(document.querySelectorAll(selector));
    const buttons = new Map();

    function getButton(el) {
        let btn = buttons.get(el);
        if (btn) return btn;
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'm-more';
        btn.textContent = 'Read more';
        btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', () => {
            const open = el.classList.contains('m-clamp');
            el.classList.toggle('m-clamp', !open);
            el.dataset.mOpen = open ? '1' : '';
            btn.textContent = open ? 'Show less' : 'Read more';
            btn.setAttribute('aria-expanded', String(open));
        });
        el.after(btn);
        buttons.set(el, btn);
        return btn;
    }

    function apply() {
        items.forEach(el => {
            const existing = buttons.get(el);
            if (!mq.matches) {
                el.classList.remove('m-clamp');
                if (existing) existing.hidden = true;
                return;
            }
            if (el.dataset.mOpen === '1') {
                if (existing) existing.hidden = false;
                return;
            }
            el.classList.add('m-clamp');
            const overflows = el.scrollHeight > el.clientHeight + 4;
            if (!overflows) {
                el.classList.remove('m-clamp');
                if (existing) existing.hidden = true;
                return;
            }
            getButton(el).hidden = false;
        });
    }

    apply();
    mq.addEventListener('change', apply);
}

document.addEventListener('DOMContentLoaded', initMobileReadMore);

// ==================== 手機版 Technical Expertise 收合卡片 ====================
// 手機寬度時，每個分類只顯示標題與數量，點了才展開內容
function initMobileExpertiseAccordion() {
    const mq = window.matchMedia('(max-width: 768px)');
    const cards = Array.from(document.querySelectorAll('.expertise-category'));

    cards.forEach(card => {
        const title = card.querySelector('.category-title');
        if (!title) return;
        const n = card.querySelectorAll('.tech-badge, .skill-item').length;
        const count = document.createElement('span');
        count.className = 'm-acc-count';
        count.textContent = n + (n === 1 ? ' item' : ' items');
        count.hidden = true;
        title.appendChild(count);

        const toggle = () => {
            if (!card.classList.contains('m-acc')) return;
            const open = card.classList.toggle('open');
            title.setAttribute('aria-expanded', String(open));
        };
        title.addEventListener('click', toggle);
        title.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });
    });

    function apply() {
        cards.forEach(card => {
            const title = card.querySelector('.category-title');
            const count = card.querySelector('.m-acc-count');
            if (!title) return;
            if (mq.matches) {
                card.classList.add('m-acc');
                title.setAttribute('role', 'button');
                title.setAttribute('tabindex', '0');
                title.setAttribute('aria-expanded', String(card.classList.contains('open')));
                if (count) count.hidden = false;
            } else {
                card.classList.remove('m-acc', 'open');
                title.removeAttribute('role');
                title.removeAttribute('tabindex');
                title.removeAttribute('aria-expanded');
                if (count) count.hidden = true;
            }
        });
    }

    apply();
    mq.addEventListener('change', apply);
}

document.addEventListener('DOMContentLoaded', initMobileExpertiseAccordion);

// ==================== 手機版 Academic Objective 收合 ====================
function initMobileGoalToggle() {
    // 手機、電腦都預設收合（原本只有手機）
    const mq = { matches: true, addEventListener() {} };
    const box = document.querySelector('.academic-goal');
    const title = box && box.querySelector('.goal-content h4');
    if (!title) return;

    const toggle = () => {
        if (!box.classList.contains('m-goal')) return;
        const open = box.classList.toggle('open');
        title.setAttribute('aria-expanded', String(open));
    };
    title.addEventListener('click', toggle);
    title.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
        }
    });

    function apply() {
        if (mq.matches) {
            box.classList.add('m-goal');
            title.setAttribute('role', 'button');
            title.setAttribute('tabindex', '0');
            title.setAttribute('aria-expanded', String(box.classList.contains('open')));
        } else {
            box.classList.remove('m-goal', 'open');
            title.removeAttribute('role');
            title.removeAttribute('tabindex');
            title.removeAttribute('aria-expanded');
        }
    }

    apply();
    mq.addEventListener('change', apply);
}

document.addEventListener('DOMContentLoaded', initMobileGoalToggle);

// ==================== 章節刻度尺（相機變焦轉盤效果） ====================
// 在導覽列下方放一條由左到右的刻度線；捲動時刻度連續滑動，
// 最接近中央指針的章節名稱會放大、變色，讓讀者知道目前位置與後面還有什麼。
function initSectionRuler() {
    const nav = document.querySelector('.navbar');
    const sections = Array.from(document.querySelectorAll('section[id]'));
    if (!nav || sections.length < 2) return;

    const names = {
        overview: 'Overview',
        awards: 'Awards',
        research: 'Research',
        publications: 'Publications',
        experiences: 'Experiences',
        patents: 'Patents',
        expertise: 'Expertise',
        laboratory: 'Laboratory',
        contact: 'Contact'
    };

    const ruler = document.createElement('div');
    ruler.className = 'section-ruler';
    ruler.setAttribute('aria-label', 'Section progress');
    ruler.style.setProperty('--n-1', sections.length - 1);

    const track = document.createElement('div');
    track.className = 'sr-track';

    const labels = sections.map((section, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sr-label';
        btn.textContent = names[section.id] || section.id;
        btn.style.left = `calc(var(--sp) * ${i})`;
        btn.addEventListener('click', () => {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        track.appendChild(btn);
        return btn;
    });

    const pointer = document.createElement('span');
    pointer.className = 'sr-pointer';

    ruler.append(track, pointer);
    nav.appendChild(ruler);

    let tops = [];
    let spacing = 120;
    let currentIndex = -1;
    let shown = 0;          // 畫面上顯示的位置（平滑追趕 target）
    let target = 0;         // 由捲動位置算出的目標位置
    let rafId = 0;
    let measureQueued = false;

    // 拖曳刻度條的狀態
    let dragging = false;
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartF = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;       // px / ms
    const maxF = sections.length - 1;

    function measure() {
        measureQueued = false;
        document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
        tops = sections.map(s => s.getBoundingClientRect().top + window.scrollY);
        spacing = parseFloat(getComputedStyle(ruler).getPropertyValue('--sp')) || 120;
        target = position();
        render(target);
        shown = target;
    }

    function queueMeasure() {
        if (measureQueued) return;
        measureQueued = true;
        requestAnimationFrame(measure);
    }

    function smooth(t) {
        return t * t * (3 - 2 * t);
    }

    // 章節內前 70% 只微微移動，最後 30% 才平滑轉到下一章（段位感）
    function detent(frac) {
        if (frac < 0.7) return (frac / 0.7) * 0.12;
        return 0.12 + 0.88 * smooth((frac - 0.7) / 0.3);
    }

    // 回傳連續位置：整數部分 = 章節索引，小數部分 = 在該章節內的進度
    function position() {
        const ref = window.scrollY + 150; // 與 highlightNavigation 相同基準
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll - 2) return maxF;
        for (let i = tops.length - 1; i >= 0; i--) {
            if (ref >= tops[i]) {
                if (i === tops.length - 1) return i;
                const frac = (ref - tops[i]) / (tops[i + 1] - tops[i]);
                return i + detent(Math.min(Math.max(frac, 0), 1));
            }
        }
        return 0;
    }

    // 位置 → 頁面捲動高度（拖曳時用，線性對應）
    function scrollForF(f) {
        const i = Math.min(maxF, Math.max(0, Math.floor(f)));
        const frac = f - i;
        const top = i < maxF ? tops[i] + frac * (tops[i + 1] - tops[i]) : tops[i];
        return Math.max(0, top - 150);
    }

    function render(f) {
        track.style.transform = `translate3d(${(-f * spacing).toFixed(2)}px, 0, 0)`;
        ruler.dataset.f = f.toFixed(4);
        ruler.dataset.n = sections.length;

        labels.forEach((label, i) => {
            const d = Math.abs(i - f);
            if (d > 3) {
                if (label.dataset.far !== '1') {
                    label.style.transform = 'translateX(-50%)';
                    label.style.opacity = '0.35';
                    label.dataset.far = '1';
                }
                return;
            }
            label.dataset.far = '';
            const near = Math.max(0, 1 - d);          // 1 = 正中央, 0 = 一格以外
            const scale = 1 + 0.32 * near;
            const opacity = Math.max(0.35, 1 - d * 0.3);
            label.style.transform = `translateX(-50%) scale(${scale.toFixed(3)})`;
            label.style.opacity = opacity.toFixed(2);
        });

        // 目前章節用無條件捨去，與導覽列高亮在同一刻切換
        const idx = Math.min(labels.length - 1, Math.max(0, Math.floor(f + 0.001)));
        if (idx !== currentIndex) {
            if (labels[currentIndex]) {
                labels[currentIndex].classList.remove('is-current');
                labels[currentIndex].removeAttribute('aria-current');
            }
            labels[idx].classList.add('is-current');
            ruler.dataset.current = sections[idx].id;
            labels[idx].setAttribute('aria-current', 'true');
            currentIndex = idx;
        }
    }

    // 每一幀讓顯示位置平滑追上目標，避免捲動事件不均勻造成的頓挫
    function tick() {
        rafId = 0;
        if (!dragging) target = position();
        const diff = target - shown;
        if (Math.abs(diff) < 0.0005) {
            shown = target;
        } else {
            shown += diff * (dragging ? 0.5 : 0.22);
        }
        render(shown);
        if (shown !== target) rafId = requestAnimationFrame(tick);
    }

    function kick() {
        if (!rafId) rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', queueMeasure);
    window.addEventListener('load', measure);
    // 圖片延遲載入會改變章節位置，重新量測（合併到下一幀，避免頻繁計算）
    if ('ResizeObserver' in window) {
        new ResizeObserver(queueMeasure).observe(document.body);
    }

    // ---------- 直接拖曳刻度條 ----------
    // 左右滑動刻度條＝前後切換章節；放開時依滑動速度吸附到最近的章節
    ruler.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        // 電腦版刻度改由選單＋粒子線呈現，只在手機開放拖曳
        if (window.matchMedia('(min-width: 769px)').matches) return;
        dragging = true;
        dragMoved = false;
        dragStartX = lastX = e.clientX;
        lastT = performance.now();
        velocity = 0;
        dragStartF = shown;
        target = shown;
    });

    ruler.addEventListener('pointermove', e => {
        if (!dragging) return;
        const dx = e.clientX - dragStartX;
        if (!dragMoved && Math.abs(dx) > 6) {
            dragMoved = true;
            ruler.classList.add('is-dragging');
            try { ruler.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        }
        if (!dragMoved) return;
        const now = performance.now();
        const dt = Math.max(1, now - lastT);
        velocity = 0.8 * velocity + 0.2 * ((e.clientX - lastX) / dt);
        lastX = e.clientX;
        lastT = now;

        target = Math.min(maxF, Math.max(0, dragStartF - dx / spacing));
        window.scrollTo({ top: scrollForF(target), behavior: 'instant' });
        kick();
    });

    function endDrag() {
        if (!dragging) return;
        dragging = false;
        ruler.classList.remove('is-dragging');
        if (!dragMoved) return;
        // 依甩動速度往前／往後多推一點，再吸附到最近的章節
        const projected = target - (velocity * 180) / spacing;
        const snap = Math.min(maxF, Math.max(0, Math.round(projected)));
        sections[snap].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    ruler.addEventListener('pointerup', endDrag);
    ruler.addEventListener('pointercancel', endDrag);

    // 拖曳後放開不要觸發標籤的點擊
    ruler.addEventListener('click', e => {
        if (dragMoved) {
            e.stopPropagation();
            e.preventDefault();
            dragMoved = false;
        }
    }, true);

    measure();
}

document.addEventListener('DOMContentLoaded', initSectionRuler);


// ==================== 電腦版：刻度尺 → 選單的粒子連線 ====================
// 電腦版刻度尺不顯示文字，改由中央指針放出一道粒子流，
// 沿曲線飛向上方選單中「目前章節」的文字；換章節時連線平滑移到下一個項目。
function initRulerParticles() {
    const nav = document.querySelector('.navbar');
    const ruler = nav && nav.querySelector('.section-ruler');
    if (!ruler) return;

    const desktop = window.matchMedia('(min-width: 769px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const canvas = document.createElement('canvas');
    canvas.className = 'ruler-particles';
    canvas.setAttribute('aria-hidden', 'true');
    nav.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const ACCENT = '52, 152, 219';
    const particles = Array.from({ length: 22 }, (_, i) => ({
        t: i / 22,
        speed: 0.0045 + Math.random() * 0.0045,
        r: 0.9 + Math.random() * 1.1,
        wobble: Math.random() * Math.PI * 2
    }));

    let w = 0, h = 0, dpr = 1;
    let tx = null, ty = null;      // 目前連線終點（平滑追蹤）
    let alpha = 0;                 // 連線整體透明度（平滑淡入淡出）
    let running = false;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = nav.clientWidth;
        h = nav.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function targetPoint() {
        const id = ruler.dataset.current;
        const link = id && nav.querySelector(`.nav-menu a[href="#${id}"]`);
        if (!link) return null;
        const navBox = nav.getBoundingClientRect();
        const box = link.getBoundingClientRect();
        return {
            x: box.left + box.width / 2 - navBox.left,
            y: box.bottom - navBox.top + 7
        };
    }

    // 每個章節刻度的 x：有選單項目的對齊項目中心；
    // 沒有選單項目的章節（例如 Experiences）放在前後兩個項目中間
    function tickPositions(navBox) {
        const ids = Array.from(document.querySelectorAll('section[id]')).map(sec => sec.id);
        const xs = ids.map(id => {
            const link = nav.querySelector(`.nav-menu a[href="#${id}"]`);
            if (!link) return null;
            const b = link.getBoundingClientRect();
            return b.left + b.width / 2 - navBox.left;
        });
        for (let i = 0; i < xs.length; i++) {
            if (xs[i] !== null) continue;
            let a = i - 1, b = i + 1;
            while (a >= 0 && xs[a] === null) a--;
            while (b < xs.length && xs[b] === null) b++;
            const left = a >= 0 ? xs[a] : (b < xs.length ? xs[b] - 60 : 0);
            const right = b < xs.length ? xs[b] : left + 60;
            xs[i] = left + (right - left) * ((i - a) / (b - a));
        }
        return xs;
    }

    function bezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    }

    function frame() {
        running = false;
        if (!desktop.matches) {
            ctx.clearRect(0, 0, w, h);
            return;
        }

        const navBox = nav.getBoundingClientRect();
        const rBox = ruler.getBoundingClientRect();
        const content = nav.querySelector('.nav-content') || ruler;
        const cBox = content.getBoundingClientRect();

        // 電腦版刻度尺：每個章節的刻度對齊上方選單項目的正下方，
        // 起點依閱讀進度在刻度之間由左往右移動
        const lx = cBox.left - navBox.left;
        const lw = cBox.width;
        const ly = rBox.top - navBox.top + rBox.height / 2;
        const f = parseFloat(ruler.dataset.f) || 0;
        const xs = tickPositions(navBox);
        const n = xs.length;
        const fi = Math.min(n - 1, Math.floor(f));
        const sx = fi >= n - 1 ? xs[n - 1] : xs[fi] + (f - fi) * (xs[fi + 1] - xs[fi]);
        const sy = ly;
        const target = targetPoint();
        if (target) {
            if (tx === null) { tx = target.x; ty = target.y; }
            tx += (target.x - tx) * 0.12;
            ty += (target.y - ty) * 0.12;
        }
        alpha += ((target ? 1 : 0) - alpha) * 0.1;

        ctx.clearRect(0, 0, w, h);

        // 底線、已讀進度、章節刻度
        const base = ctx.createLinearGradient(lx, 0, lx + lw, 0);
        base.addColorStop(0, 'rgba(203, 213, 225, 0)');
        base.addColorStop(Math.max(0, (xs[0] - lx) / lw - 0.08), 'rgba(203, 213, 225, 0)');
        base.addColorStop(Math.max(0, (xs[0] - lx) / lw), 'rgba(203, 213, 225, 0.9)');
        base.addColorStop(1, 'rgba(203, 213, 225, 0.9)');
        ctx.fillStyle = base;
        ctx.fillRect(lx, ly - 0.5, Math.max(0, xs[n - 1] - lx), 1);
        const prog = ctx.createLinearGradient(xs[0], 0, Math.max(sx, xs[0] + 1), 0);
        prog.addColorStop(0, `rgba(${ACCENT}, 0.25)`);
        prog.addColorStop(1, `rgba(${ACCENT}, 0.9)`);
        ctx.fillStyle = prog;
        ctx.fillRect(xs[0], ly - 1, Math.max(0, sx - xs[0]), 2);
        for (let i = 0; i < n; i++) {
            const x = xs[i];
            const passed = i <= f + 0.001;
            ctx.fillStyle = passed ? `rgba(${ACCENT}, 0.85)` : 'rgba(148, 163, 184, 0.7)';
            ctx.fillRect(Math.round(x) - 0.5, ly - 3.5, 1, 7);
        }

        // 起點亮點（會往右移動）
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT}, 1)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT}, 0.15)`;
        ctx.fill();

        if (tx === null || alpha < 0.01) {
            schedule();
            return;
        }

        // 曲線：從指針往上，再彎向選單文字
        const c1x = sx, c1y = sy - (sy - ty) * 0.8;
        const c2x = tx, c2y = ty + (sy - ty) * 0.6;

        // 淡淡的導引線
        const grad = ctx.createLinearGradient(sx, sy, tx, ty);
        grad.addColorStop(0, `rgba(${ACCENT}, ${0.05 * alpha})`);
        grad.addColorStop(1, `rgba(${ACCENT}, ${0.35 * alpha})`);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, tx, ty);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 粒子
        const animate = !reduced.matches;
        particles.forEach(p => {
            if (animate) {
                p.t += p.speed;
                if (p.t > 1) p.t -= 1;
                p.wobble += 0.08;
            }
            const x = bezier(sx, c1x, c2x, tx, p.t);
            const y = bezier(sy, c1y, c2y, ty, p.t) + Math.sin(p.wobble) * 0.8;
            const a = Math.sin(Math.PI * p.t) * 0.85 * alpha;
            ctx.beginPath();
            ctx.arc(x, y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${ACCENT}, ${a.toFixed(3)})`;
            ctx.fill();
        });

        // 兩端亮點
        ctx.beginPath();
        ctx.arc(tx, ty, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT}, ${0.9 * alpha})`;
        ctx.fill();

        if (animate) schedule();
    }

    function schedule() {
        if (running || document.hidden || !desktop.matches) return;
        running = true;
        requestAnimationFrame(frame);
    }

    resize();
    schedule();
    window.addEventListener('resize', () => { resize(); schedule(); });
    window.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    desktop.addEventListener('change', () => { resize(); tx = null; schedule(); frame(); });
}

document.addEventListener('DOMContentLoaded', () => {
    // 等刻度尺建立後再啟動
    requestAnimationFrame(initRulerParticles);
});
