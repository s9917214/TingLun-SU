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
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 滾動超過 100px 時加強陰影
    if (scrollTop > 100) {
        navbar.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06)';
    }

    lastScrollTop = scrollTop;
});

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

window.addEventListener('scroll', highlightNavigation);

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

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});
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

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });

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

window.addEventListener('scroll', optimizedScrollHandler);

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
