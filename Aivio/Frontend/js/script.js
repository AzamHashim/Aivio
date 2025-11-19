// ===== CONFIGURATION =====
const CONFIG = {
    API_BASE_URL: 'https://api.aivio.com/v1',
    MAX_UPLOAD_SIZE: 500 * 1024 * 1024, // 500MB
    SUPPORTED_FORMATS: ['mp4', 'avi', 'mov', 'wmv']
};

// ===== STATE MANAGEMENT =====
class AppState {
    constructor() {
        this.user = null;
        this.videos = [];
        this.currentPage = 'home';
        this.searchQuery = '';
        this.isLoading = false;
        this.currentCategory = 'all';
    }
    
    setUser(user) {
        this.user = user;
        this.updateUI();
    }
    
    setVideos(videos) {
        this.videos = videos;
        this.renderVideos();
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.updateLoadingState();
    }
    
    setCategory(category) {
        this.currentCategory = category;
        this.updateCategoryState();
    }
    
    updateUI() {
        this.updateUserSection();
        this.updateUploadButton();
    }
    
    updateUserSection() {
        const userSection = document.querySelector('.user-section');
        if (!userSection) return;
        
        if (this.user) {
            userSection.innerHTML = `
                <div class="user-menu">
                    <div class="user-avatar">${this.user.name.charAt(0).toUpperCase()}</div>
                    <span>${this.user.name}</span>
                </div>
            `;
        }
    }
    
    updateUploadButton() {
        const uploadBtn = document.querySelector('.upload-btn');
        if (!uploadBtn) return;
        
        if (this.user) {
            uploadBtn.textContent = 'Upload';
            uploadBtn.style.background = 'var(--gradient-primary)';
        } else {
            uploadBtn.textContent = 'Upload';
            uploadBtn.style.background = 'var(--gradient-primary)';
        }
    }
    
    updateLoadingState() {
        const videoGrid = document.querySelector('.video-grid');
        if (!videoGrid) return;
        
        if (this.isLoading) {
            videoGrid.innerHTML = `
                <div class="loading-spinner-container">
                    <div class="loading-spinner"></div>
                    <p>Loading amazing content...</p>
                </div>
            `;
        }
    }
    
    updateCategoryState() {
        document.querySelectorAll('.filter-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Find and activate the current category
        const activeItem = Array.from(document.querySelectorAll('.filter-item')).find(item => 
            item.textContent.trim().toLowerCase() === this.currentCategory
        );
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
    
    renderVideos(videos = this.videos) {
        const videoGrid = document.querySelector('.video-grid');
        if (!videoGrid) return;
        
        if (videos.length === 0) {
            videoGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-video-slash"></i>
                    <h3>No videos found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        videoGrid.innerHTML = videos.map(video => `
            <div class="video-card" data-video-id="${video.id}">
                <div class="thumbnail">
                    <div class="thumbnail-image" style="background: ${video.thumbnail || Utils.getRandomColor()}"></div>
                    <div class="video-duration">${video.duration}</div>
                </div>
                <div class="video-info">
                    <div class="channel-avatar">${video.channel?.charAt(0) || 'A'}</div>
                    <div class="video-details">
                        <h3 class="video-title">${video.title}</h3>
                        <p class="channel-name">${video.channel}</p>
                        <p class="video-meta">${video.views} views • ${video.date}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.attachVideoCardEvents();
    }
    
    attachVideoCardEvents() {
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.getAttribute('data-video-id');
                EventHandlers.handleVideoClick(videoId);
            });
        });
    }
}

// Initialize app state
const appState = new AppState();

// ===== DOM ELEMENTS =====
const DOM = {
    searchForm: document.querySelector('.search-form'),
    searchInput: document.querySelector('.search-input'),
    videoGrid: document.querySelector('.video-grid'),
    sidebarItems: document.querySelectorAll('.sidebar-item'),
    filterItems: document.querySelectorAll('.filter-item'),
    uploadBtn: document.querySelector('.upload-btn'),
    menuToggle: document.querySelector('.menu-toggle'),
    userAvatar: document.querySelector('.user-avatar')
};

// ===== EVENT HANDLERS =====
class EventHandlers {
    static handleSearch(e) {
        e.preventDefault();
        const query = DOM.searchInput.value.trim();
        if (query) {
            appState.searchQuery = query;
            appState.setLoading(true);
            
            VideoService.searchVideos(query)
                .then(videos => {
                    appState.setVideos(videos);
                    appState.setLoading(false);
                })
                .catch(error => {
                    console.error('Search failed:', error);
                    appState.setLoading(false);
                });
        } else {
            Utils.showNotification('Please enter a search term', 'info');
        }
    }
    
    static handleSidebarClick(e) {
        e.preventDefault();
        const item = e.currentTarget;
        const page = item.textContent.trim().toLowerCase();
        
        document.querySelectorAll('.sidebar-item').forEach(i => {
            i.classList.remove('active');
        });
        item.classList.add('active');
        
        appState.currentPage = page;
        Navigation.navigateToPage(page);
    }
    
    static handleVideoClick(videoId) {
        Navigation.navigateToVideo(videoId);
    }
    
    static handleUploadClick() {
        if (appState.user) {
            ModalService.openUploadModal();
        } else {
            AuthService.showLoginPrompt();
        }
    }
    
    static handleFilterClick(e) {
        const item = e.currentTarget;
        const category = item.textContent.trim().toLowerCase();
        
        document.querySelectorAll('.filter-item').forEach(i => {
            i.classList.remove('active');
        });
        item.classList.add('active');
        
        appState.setCategory(category);
        appState.setLoading(true);
        
        if (category === 'all') {
            VideoService.getTrendingVideos()
                .then(videos => {
                    appState.setVideos(videos);
                    appState.setLoading(false);
                });
        } else {
            VideoService.getVideosByCategory(category)
                .then(videos => {
                    appState.setVideos(videos);
                    appState.setLoading(false);
                });
        }
    }
    
    static handleMenuToggle() {
        Utils.toggleSidebar();
    }
    
    static handleUserAvatarClick() {
        AuthService.showLoginPrompt();
    }
}

// ===== INITIALIZATION =====
class AppInitializer {
    static init() {
        this.bindEvents();
        this.loadInitialData();
        this.applyAdditionalStyles();
        this.handleResize();
        console.log('🚀 Aivio initialized successfully!');
    }
    
    static bindEvents() {
        // Search form
        if (DOM.searchForm) {
            DOM.searchForm.addEventListener('submit', EventHandlers.handleSearch);
            
            // Real-time search with debounce
            DOM.searchInput.addEventListener('input', Utils.debounce((e) => {
                if (e.target.value.length > 2) {
                    console.log('Real-time search:', e.target.value);
                }
            }, 500));
        }
        
        // Sidebar navigation
        DOM.sidebarItems.forEach(item => {
            item.addEventListener('click', EventHandlers.handleSidebarClick);
        });
        
        // Filter items
        DOM.filterItems.forEach(item => {
            item.addEventListener('click', EventHandlers.handleFilterClick);
        });
        
        // Upload button
        if (DOM.uploadBtn) {
            DOM.uploadBtn.addEventListener('click', EventHandlers.handleUploadClick);
        }
        
        // Menu toggle
        if (DOM.menuToggle) {
            DOM.menuToggle.addEventListener('click', EventHandlers.handleMenuToggle);
        }
        
        // User avatar
        if (DOM.userAvatar) {
            DOM.userAvatar.addEventListener('click', EventHandlers.handleUserAvatarClick);
        }
        
        // Video cards (initial load)
        appState.attachVideoCardEvents();
    }
    
    static async loadInitialData() {
        appState.setLoading(true);
        try {
            const videos = await VideoService.getTrendingVideos();
            appState.setVideos(videos);
            appState.setLoading(false);
            Utils.showNotification('Welcome to Aivio! 🎬', 'success');
        } catch (error) {
            console.error('Failed to load initial data:', error);
            appState.setLoading(false);
            Utils.showNotification('Failed to load videos', 'error');
        }
    }
    
    static applyAdditionalStyles() {
        const additionalStyles = `
            <style>
                .loading-spinner-container {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-secondary);
                }
                
                .loading-spinner {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: var(--electric-blue);
                    animation: spin 1s ease-in-out infinite;
                    margin-bottom: 16px;
                }
                
                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 80px 20px;
                    color: var(--text-secondary);
                }
                
                .empty-state i {
                    font-size: 64px;
                    margin-bottom: 20px;
                    opacity: 0.5;
                    color: var(--electric-blue);
                }
                
                .notification {
                    position: fixed;
                    top: 90px;
                    right: 20px;
                    background: var(--background-card);
                    padding: 16px 20px;
                    border-radius: var(--radius-medium);
                    border-left: 4px solid var(--electric-blue);
                    box-shadow: var(--shadow-glow);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 1001;
                    animation: slideInRight 0.3s ease;
                    border: 1px solid var(--border-glow);
                    color: var(--text-primary) !important;
                }
                
                .notification span {
                    color: var(--text-primary) !important;
                    font-weight: 500;
                }
                
                .notification-success {
                    border-left-color: #00ff88;
                }
                
                .notification-error {
                    border-left-color: #ff4444;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                }
                
                .notification-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', additionalStyles);
    }
    
    static handleResize() {
        // Handle window resize for perfect fit
        window.addEventListener('resize', () => {
            this.adjustLayout();
        });
        
        // Initial adjustment
        this.adjustLayout();
    }
    
    static adjustLayout() {
        const sidebar = document.querySelector('.sidebar');
        const content = document.querySelector('.content');
        const videoGrid = document.querySelector('.video-grid');
        
        if (sidebar && content) {
            // Adjust for mobile
            if (window.innerWidth <= 768) {
                content.style.marginLeft = '0';
                content.style.width = '100%';
            } else {
                content.style.marginLeft = '280px';
                content.style.width = 'calc(100% - 280px)';
            }
            
            // Adjust video grid columns based on available space
            if (videoGrid) {
                const containerWidth = content.offsetWidth;
                const minCardWidth = 280;
                const maxColumns = Math.floor(containerWidth / minCardWidth);
                const columns = Math.max(1, Math.min(maxColumns, 4));
                
                videoGrid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`;
            }
        }
    }
}



// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
    AppInitializer.init();
});