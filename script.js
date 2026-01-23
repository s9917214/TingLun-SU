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

// ==================== 語言切換功能 ====================
const langButtons = document.querySelectorAll('.lang-btn');

langButtons.forEach(button => {
    button.addEventListener('click', function() {
        // 移除所有 active 類
        langButtons.forEach(btn => btn.classList.remove('active'));
        // 添加 active 到當前按鈕
        this.classList.add('active');

        const selectedLang = this.getAttribute('data-lang');
        console.log(`Language switched to: ${selectedLang}`);

        // 這裡可以添加實際的語言切換邏輯
        // 例如：載入不同的語言檔案或切換顯示的內容
    });
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

// 觸發統計數字動畫
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statValues = entry.target.querySelectorAll('.stat-value');

            statValues.forEach(stat => {
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
}, { threshold: 0.5 });

const quickStats = document.querySelector('.quick-stats');
if (quickStats) {
    statsObserver.observe(quickStats);
}

// ==================== 影片懶加載 ====================
const videoWrappers = document.querySelectorAll('.video-wrapper');

const videoObserver = new IntersectionObserver((entries) => {
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

            videoObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

videoWrappers.forEach(wrapper => {
    videoObserver.observe(wrapper);
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

    // 數字鍵快速導航（1-6）
    if (e.key >= '1' && e.key <= '6' && !e.ctrlKey && !e.metaKey) {
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
console.log('• Press 1-6 to navigate between sections');
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
    } else {
        // 恢復播放（可選）
        document.querySelectorAll('video[data-was-playing="true"]').forEach(video => {
            // video.play(); // 取消註解以自動恢復播放
            video.removeAttribute('data-was-playing');
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

// ==================== 智能照片检测和自动布局 ====================

/**
 * 检测文件夹中的照片（支持多种命名模式）
 * @param {string} folder - 文件夹路径（如 "awards/2025"）
 * @param {string} year - 年份标识（用于特殊命名模式）
 * @returns {Promise<string[]>} - 返回存在的照片路径数组
 */
async function detectPhotos(folder, year) {
    const basePatterns = ['award', 'photo', 'image'];
    const specialPatterns = {
        '2023': ['tdk', 'award'],
        'early': ['medal', 'award']
    };

    // 确定使用的命名模式
    const patterns = specialPatterns[year] || basePatterns;
    const photos = [];

    // 检测最多8张照片
    for (let i = 1; i <= 8; i++) {
        let found = false;

        // 尝试不同的命名模式和扩展名（优先 WebP）
        for (const pattern of patterns) {
            for (const ext of ['webp', 'jpg', 'jpeg', 'png']) {
                const photoPath = `images/${folder}/${pattern}${i}.${ext}`;

                try {
                    const exists = await checkImageExists(photoPath);
                    if (exists) {
                        photos.push(photoPath);
                        found = true;
                        break;
                    }
                } catch (e) {
                    // 图片不存在，继续尝试
                }
            }
            if (found) break;
        }

        // 如果连续缺失，停止检测
        if (!found && i > 1) break;
    }

    return photos;
}

/**
 * 检查图片是否存在
 * @param {string} url - 图片URL
 * @returns {Promise<boolean>} - 图片是否存在
 */
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;

        // 设置超时（优化为 500ms）
        setTimeout(() => resolve(false), 500);
    });
}

/**
 * 生成单张照片布局
 */
function generateSingleLayout(photos, caption, year) {
    return `
        <img src="${photos[0]}" alt="${year} Award Photo" class="award-img">
        <p class="photo-caption">${caption}</p>
    `;
}

/**
 * 生成两张照片布局（左右分割）
 */
function generateTwoPhotoLayout(photos, caption, year) {
    return `
        <div class="photo-grid-two">
            <img src="${photos[0]}" alt="${year} Award Photo 1" class="grid-img-two">
            <img src="${photos[1]}" alt="${year} Award Photo 2" class="grid-img-two">
        </div>
        <p class="photo-caption">${caption}</p>
    `;
}

/**
 * 生成三张照片拼贴布局（1大2小）
 */
function generateCollageLayout(photos, caption, year) {
    return `
        <div class="photo-grid">
            <img src="${photos[0]}" alt="${year} Award Main Photo" class="grid-img main">
            <div class="grid-side">
                <img src="${photos[1]}" alt="${year} Award Photo 2" class="grid-img">
                <img src="${photos[2]}" alt="${year} Award Photo 3" class="grid-img">
            </div>
        </div>
        <p class="photo-caption">${caption}</p>
    `;
}

/**
 * 生成四张照片网格布局（2x2）
 */
function generateGridLayout(photos, caption, year) {
    return `
        <div class="photo-grid-four">
            <img src="${photos[0]}" alt="${year} Award Photo 1" class="grid-img-four">
            <img src="${photos[1]}" alt="${year} Award Photo 2" class="grid-img-four">
            <img src="${photos[2]}" alt="${year} Award Photo 3" class="grid-img-four">
            <img src="${photos[3]}" alt="${year} Award Photo 4" class="grid-img-four">
        </div>
        <p class="photo-caption">${caption}</p>
    `;
}

/**
 * 生成轮播图布局（5张及以上）
 */
function generateCarouselLayout(photos, caption, year) {
    const imagesHTML = photos.map((photo, index) =>
        `<img src="${photo}" alt="${year} Award Photo ${index + 1}" class="carousel-img ${index === 0 ? 'active' : ''}">`
    ).join('');

    const dotsHTML = photos.map((_, index) =>
        `<span class="dot ${index === 0 ? 'active' : ''}" onclick="currentSlide(this, ${index})"></span>`
    ).join('');

    return `
        <div class="photo-carousel">
            <div class="carousel-images">
                ${imagesHTML}
            </div>
            <button class="carousel-btn prev" onclick="changeSlide(this, -1)">‹</button>
            <button class="carousel-btn next" onclick="changeSlide(this, 1)">›</button>
            <div class="carousel-dots">
                ${dotsHTML}
            </div>
        </div>
        <p class="photo-caption">${caption}</p>
    `;
}

/**
 * 生成占位图（当没有照片时）
 */
function generatePlaceholder(caption) {
    return `
        <div class="photo-placeholder">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p>No photos available</p>
        </div>
        <p class="photo-caption">${caption}</p>
    `;
}

/**
 * 初始化照片画廊（智能检测和布局）
 */
async function initPhotoGalleries() {
    const galleries = document.querySelectorAll('.photo-gallery');

    for (const gallery of galleries) {
        const awardPhoto = gallery.closest('.award-photo');
        const folder = awardPhoto.dataset.folder;
        const year = awardPhoto.dataset.year;
        const caption = gallery.dataset.caption;

        // 显示加载状态
        gallery.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">Loading photos...</p>';

        try {
            // 检测照片
            const photos = await detectPhotos(folder, year);

            // 根据照片数量生成不同布局
            let layoutHTML;
            if (photos.length === 0) {
                layoutHTML = generatePlaceholder(caption);
            } else if (photos.length === 1) {
                layoutHTML = generateSingleLayout(photos, caption, year);
            } else if (photos.length === 2) {
                layoutHTML = generateTwoPhotoLayout(photos, caption, year);
            } else if (photos.length === 3) {
                layoutHTML = generateCollageLayout(photos, caption, year);
            } else if (photos.length === 4) {
                layoutHTML = generateGridLayout(photos, caption, year);
            } else {
                layoutHTML = generateCarouselLayout(photos, caption, year);
            }

            gallery.innerHTML = layoutHTML;

            // 如果是轮播图，启动自动播放
            if (photos.length >= 5) {
                const carousel = gallery.querySelector('.photo-carousel');
                if (carousel) {
                    setInterval(() => {
                        const nextBtn = carousel.querySelector('.carousel-btn.next');
                        if (nextBtn) {
                            changeSlide(nextBtn, 1);
                        }
                    }, 5000);
                }
            }

        } catch (error) {
            console.error(`Error loading photos for ${folder}:`, error);
            gallery.innerHTML = generatePlaceholder(caption);
        }
    }
}

// 页面加载完成后初始化照片画廊
document.addEventListener('DOMContentLoaded', () => {
    // 立即初始化照片画廊
    initPhotoGalleries();
});
