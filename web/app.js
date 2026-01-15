// CDN Video Streaming Platform - Carousel Style
class VideoApp {
    constructor() {
        this.videos = [];
        this.hls = null;
        this.currentSlide = 0;
        this.slideInterval = null;
        this.init();
    }

    async init() {
        await this.loadVideos();
        this.renderMovieCarousels();
        this.setupEventListeners();
    }

    async loadVideos() {
        const loadingContainer = document.getElementById('loadingContainer');
        const contentLayoutContainer = document.getElementById('contentLayoutContainer');

        try {
            const response = await fetch('http://localhost:8001/videos');
            const data = await response.json();
            this.videos = data.videos || [];
            console.log('✓ Loaded videos from server:', this.videos);
        } catch (error) {
            console.warn('⚠ Controller unavailable, using fallback videos');
            this.videos = [
                '1sFLfFCnGgk', '2Jfk2limySw', '4Er3DosVO5w',
                '8oC50pKc6Vc', '9CRgT0LMZQA', 'BvpEAfTN7fk',
                'HDMKovooZ3o', 'IKEwEzTaMCU', 'movie',
                'nature1', 'tech2', 'travel3', 'music4',
                'education5', 'sports6', 'cooking7', 'art8',
                'science9', 'lifestyle10', 'adventure11', 'gaming12'
            ];
        }

        // Hide loading, show content
        if (loadingContainer) loadingContainer.style.display = 'none';
        if (contentLayoutContainer) contentLayoutContainer.style.display = 'block';
    }

    renderHeroCarousel() {
        const heroSlides = document.getElementById('heroSlides');
        if (!heroSlides) return;

        // Take first 5 videos for hero carousel
        const featuredVideos = this.videos.slice(0, 5);

        heroSlides.innerHTML = featuredVideos.map((id, index) => {
            const title = this.generateTitle(id);
            const description = this.generateDescription(id);
            const duration = this.generateDuration();
            const thumbnail = `http://localhost:8101/thumbnails/${id}.jpg`;
            const fallbackThumbnail = `https://picsum.photos/seed/${id}/800/1000`;

            return `
                <div class="hero-slide ${index === 0 ? 'active' : ''}" data-id="${id}">
                    <div class="hero-content-wrapper">
                        <span class="hero-badge">Featured</span>
                        <h1 class="hero-slide-title">${title}</h1>
                        <div class="hero-meta">
                            <span><i class="fas fa-clock"></i> ${duration}</span>
                            <span><i class="fas fa-star"></i> 4.5</span>
                        </div>
                        <p class="hero-description">${description}</p>
                        <button class="hero-cta" onclick="app.playVideoFromSlide('${id}')">
                            <i class="fas fa-play"></i> Watch Now
                        </button>
                    </div>
                    <div class="hero-image-wrapper">
                        <div class="hero-image">
                            <img src="${thumbnail}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackThumbnail}';">
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        console.log(`✓ Rendered ${featuredVideos.length} hero slides`);
    }

    renderMovieCarousels() {
        const container = document.getElementById('latestMovies');
        const carouselTitle = document.getElementById('carouselTitle');

        if (!container) return;

        // Show all videos in the carousel
        const videos = this.videos;

        if (carouselTitle) {
            carouselTitle.textContent = 'Latest Movies';
        }

        container.innerHTML = videos.map((id, index) => {
            const title = this.generateTitle(id);
            const thumbnail = `http://localhost:8101/thumbnails/${id}.jpg`;
            const fallbackThumbnail = `https://picsum.photos/seed/movie-${id}-${index}/300/450`;
            const delay = index * 0.05;

            return `
                <div class="movie-card" data-id="${id}" style="animation-delay: ${delay}s">
                    <div class="movie-poster">
                        <img src="${thumbnail}" alt="${title}" onerror="this.onerror=null; this.src='${fallbackThumbnail}';">
                        <div class="movie-overlay">
                            <div class="play-button">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">${title}</h3>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        container.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.dataset.id;
                this.playVideo(videoId);
            });
        });

        console.log('✓ Rendered movie carousel');
    }

    searchVideos(query) {
        const searchTerm = query.trim().toLowerCase();
        const container = document.getElementById('latestMovies');
        const carouselTitle = document.getElementById('carouselTitle');

        console.log('🔍 Search triggered:', { query, searchTerm, totalVideos: this.videos.length });

        if (!container) {
            console.error('Container not found: latestMovies');
            return;
        }

        if (!searchTerm) {
            // Show all videos
            console.log('Empty search - showing all videos');
            this.renderMovieCarousels();
            return;
        }

        // Filter videos by title match
        const filtered = this.videos.filter(id => {
            const title = this.generateTitle(id).toLowerCase();
            const matches = title.includes(searchTerm);
            console.log(`  ${id}: "${title}" - ${matches ? '✓ MATCH' : '✗ no match'}`);
            return matches;
        });

        console.log(`✓ Filtered results: ${filtered.length} videos found`);

        // Update carousel title
        if (carouselTitle) {
            if (filtered.length > 0) {
                carouselTitle.textContent = `Search Results for "${query}" (${filtered.length})`;
            } else {
                carouselTitle.textContent = `No results found for "${query}"`;
            }
        }

        // Render filtered results
        container.innerHTML = filtered.map((id, index) => {
            const title = this.generateTitle(id);
            const thumbnail = `http://localhost:8101/thumbnails/${id}.jpg`;
            const fallbackThumbnail = `https://picsum.photos/seed/movie-${id}-${index}/300/450`;
            const delay = index * 0.05;

            return `
                <div class="movie-card" data-id="${id}" style="animation-delay: ${delay}s">
                    <div class="movie-poster">
                        <img src="${thumbnail}" alt="${title}" onerror="this.onerror=null; this.src='${fallbackThumbnail}';">
                        <div class="movie-overlay">
                            <div class="play-button">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">${title}</h3>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        container.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.dataset.id;
                this.playVideo(videoId);
            });
        });

        console.log(`✓ Rendered ${filtered.length} search results`);
    }

    playVideoFromSlide(videoId) {
        this.playVideo(videoId);
    }

    startAutoSlide() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }

    nextSlide() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        slides[this.currentSlide].classList.remove('active');
        this.currentSlide = (this.currentSlide + 1) % slides.length;
        slides[this.currentSlide].classList.add('active');
    }

    prevSlide() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        slides[this.currentSlide].classList.remove('active');
        this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
        slides[this.currentSlide].classList.add('active');
    }

    setupHero() {
        const startWatchingBtn = document.getElementById('startWatchingBtn');

        // Set images for floating cards
        const card1 = document.querySelector('.card-1 .card-image');
        const card2 = document.querySelector('.card-2 .card-image');
        const card3 = document.querySelector('.card-3 .card-image');

        if (card1) card1.style.backgroundImage = `url(https://picsum.photos/seed/nature/400/300)`;
        if (card2) card2.style.backgroundImage = `url(https://picsum.photos/seed/tech/400/300)`;
        if (card3) card3.style.backgroundImage = `url(https://picsum.photos/seed/travel/400/300)`;

        // Start watching button scrolls to videos
        if (startWatchingBtn) {
            startWatchingBtn.addEventListener('click', () => {
                document.querySelector('.videos-library').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    }

    renderVideoGrid() {
        const videosGrid = document.getElementById('videosGrid');

        videosGrid.innerHTML = this.videos.map(id => {
            return this.createVideoCard(id);
        }).join('');

        // Add click listeners
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.dataset.id;
                this.playVideo(videoId);
            });
        });
    }

    renderSidebarVideoGrid() {
        const videoGridContainer = document.getElementById('videoGridContainer');

        if (!videoGridContainer) {
            console.error('videoGridContainer not found');
            return;
        }

        videoGridContainer.innerHTML = this.videos.map(id => {
            const title = this.generateTitle(id);
            const duration = this.generateDuration();
            const thumbnail = `http://localhost:8101/thumbnails/${id}.jpg`;
            const fallbackThumbnail = `https://picsum.photos/seed/${id}/320/180`;

            return `
                <div class="video-grid-item" data-id="${id}">
                    <div class="video-grid-thumb">
                        <img src="${thumbnail}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackThumbnail}';">
                        <div class="video-grid-overlay">
                            <div class="video-grid-play-icon">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                        <div class="video-duration">${duration}</div>
                    </div>
                    <div class="video-grid-info">
                        <h4 class="video-grid-title">${title}</h4>
                    </div>
                </div>
            `;
        }).join('');

        console.log(`✓ Rendered ${this.videos.length} videos in sidebar grid`);

        // Add click listeners
        document.querySelectorAll('.video-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const videoId = item.dataset.id;
                this.playVideo(videoId);
            });
        });
    }

    createVideoCard(id) {
        const title = this.generateTitle(id);
        const duration = this.generateDuration();
        const views = this.generateViews();
        const timeAgo = this.getTimeAgo();
        const thumbnail = `http://localhost:8101/thumbnails/${id}.jpg`;
        const fallbackThumbnail = `https://picsum.photos/seed/${id}/640/360`;

        return `
            <div class="video-card" data-id="${id}">
                <div class="video-thumbnail">
                    <img src="${thumbnail}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackThumbnail}';">
                    <div class="video-play-overlay">
                        <div class="play-icon">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="video-duration">${duration}</div>
                </div>
                <div class="video-card-content">
                    <h3 class="video-card-title">${title}</h3>
                    <div class="video-card-meta">
                        <span>${views} views</span>
                        <span>•</span>
                        <span>${timeAgo}</span>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Search functionality
        const heroSearchInput = document.getElementById('heroSearchInput');
        const navbarSearchInput = document.getElementById('searchInput');
        let searchTimeout;

        // Debounced search function
        const performSearch = (query) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchVideos(query);
            }, 300);
        };

        // Hero search input
        if (heroSearchInput) {
            heroSearchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                performSearch(query);
            });

            // Search on Enter key
            heroSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    this.searchVideos(e.target.value);
                }
            });
        }

        // Navbar search input
        if (navbarSearchInput) {
            navbarSearchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                performSearch(query);
            });

            // Search on Enter key
            navbarSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    this.searchVideos(e.target.value);
                }
            });
        }

        // Hero search button
        const heroSearchButton = document.querySelector('.hero-search-button');
        if (heroSearchButton && heroSearchInput) {
            heroSearchButton.addEventListener('click', () => {
                clearTimeout(searchTimeout);
                this.searchVideos(heroSearchInput.value);
            });
        }

        // Movie carousel navigation
        document.querySelectorAll('.carousel-nav').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const carouselId = button.dataset.carousel;
                const container = document.getElementById(`${carouselId}Movies`);

                if (!container) {
                    console.error(`Container not found: ${carouselId}Movies`);
                    return;
                }

                // Scroll by 4 card widths (125px per card + 1rem gap)
                const scrollAmount = 550;

                if (button.classList.contains('carousel-prev')) {
                    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }

                console.log(`Scrolling ${carouselId} by ${scrollAmount}px`);
            });
        });

        // Close player
        const closePlayer = document.getElementById('closePlayer');
        if (closePlayer) {
            closePlayer.addEventListener('click', () => this.closePlayer());
        }

        // PiP button
        const pipButton = document.getElementById('pipButton');
        if (pipButton) {
            pipButton.addEventListener('click', () => this.togglePiP());
        }

        // Fullscreen button
        const fullscreenButton = document.getElementById('fullscreenButton');
        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const html = document.documentElement;
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? '' : 'dark';
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);

                // Update icon
                const icon = themeToggle.querySelector('i');
                if (newTheme === 'dark') {
                    icon.className = 'fas fa-sun';
                } else {
                    icon.className = 'fas fa-moon';
                }
            });

            // Load saved theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                const icon = themeToggle.querySelector('i');
                if (savedTheme === 'dark') {
                    icon.className = 'fas fa-sun';
                }
            }
        }

        // Favorite button
        const favoriteButton = document.getElementById('favoriteButton');
        favoriteButton.addEventListener('click', () => {
            const icon = favoriteButton.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.showToast('Added to favorites', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.showToast('Removed from favorites', 'info');
            }
        });

        // Share button
        const shareButton = document.getElementById('shareButton');
        shareButton.addEventListener('click', () => {
            this.showToast('Link copied to clipboard', 'success');
        });

        // Server selection buttons
        const serverButtons = document.querySelectorAll('.server-btn');
        serverButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const server = btn.getAttribute('data-server');
                this.switchServer(server);
            });
        });

        // Error modal close
        const closeError = document.getElementById('closeError');
        const retryButton = document.getElementById('retryButton');
        closeError.addEventListener('click', () => this.hideError());
        retryButton.addEventListener('click', () => {
            this.hideError();
            // Retry logic here
        });
    }

    async playVideo(videoId, server = 'auto') {
        const modal = document.getElementById('playerModal');
        const videoPlayer = document.getElementById('videoPlayer');
        const playerOverlay = document.getElementById('playerOverlay');
        const playerTitle = document.getElementById('playerTitle');
        const videoTitle = document.getElementById('videoTitle');
        const videoDescription = document.getElementById('videoDescription');

        // Store current video ID for server switching
        this.currentVideoId = videoId;
        this.currentServer = server;

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Update info
        const title = this.generateTitle(videoId);
        playerTitle.textContent = title;
        videoTitle.textContent = title;
        videoDescription.textContent = this.generateDescription(videoId);

        // Update server button states
        this.updateServerButtons(server);

        // Show loading
        playerOverlay.classList.add('active');

        try {
            // Determine video URL based on server selection
            let videoUrl;
            if (server === 'auto') {
                // Use controller for load balancing
                videoUrl = `http://localhost:8001/play/${videoId}`;
            } else {
                // Direct replica URL
                const port = 8100 + parseInt(server);
                videoUrl = `http://localhost:${port}/videos/${videoId}/index.m3u8`;
            }

            // Destroy previous HLS instance
            if (this.hls) {
                this.hls.destroy();
            }

            if (Hls.isSupported()) {
                this.hls = new Hls({
                    debug: false,
                    enableWorker: true,
                    lowLatencyMode: true
                });

                this.hls.loadSource(videoUrl);
                this.hls.attachMedia(videoPlayer);

                this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    playerOverlay.classList.remove('active');
                    videoPlayer.play().catch(e => console.log('Autoplay prevented'));
                });

                this.hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('HLS error:', data);
                    if (data.fatal) {
                        playerOverlay.classList.remove('active');
                        this.showError('Error loading video. Please try again.');
                    }
                });
            } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari fallback
                videoPlayer.src = videoUrl;
                videoPlayer.addEventListener('loadeddata', () => {
                    playerOverlay.classList.remove('active');
                    videoPlayer.play().catch(e => console.log('Autoplay prevented'));
                });
            } else {
                throw new Error('HLS not supported');
            }
        } catch (error) {
            console.error('Error playing video:', error);
            playerOverlay.classList.remove('active');
            this.showError('Unable to play video. Please check if the server is running.');
        }
    }

    closePlayer() {
        const modal = document.getElementById('playerModal');
        const videoPlayer = document.getElementById('videoPlayer');

        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Stop video
        videoPlayer.pause();
        videoPlayer.currentTime = 0;

        // Destroy HLS
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        // Reset favorite button
        const favoriteButton = document.getElementById('favoriteButton');
        const icon = favoriteButton.querySelector('i');
        icon.classList.remove('fas');
        icon.classList.add('far');
    }

    updateServerButtons(server) {
        // Update button states to show which server is active
        const buttons = document.querySelectorAll('.server-btn');
        buttons.forEach(btn => {
            const btnServer = btn.getAttribute('data-server');
            if (btnServer === server) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    switchServer(server) {
        // Switch to a different server without closing the player
        if (this.currentVideoId) {
            // Save current playback position
            const videoPlayer = document.getElementById('videoPlayer');
            const currentTime = videoPlayer.currentTime;

            // Reload video with new server
            this.playVideo(this.currentVideoId, server).then(() => {
                // Restore playback position
                if (currentTime > 0) {
                    videoPlayer.currentTime = currentTime;
                }
            });
        }
    }

    togglePiP() {
        const videoPlayer = document.getElementById('videoPlayer');
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            videoPlayer.requestPictureInPicture().catch(err => {
                this.showToast('Picture-in-Picture not available', 'error');
            });
        }
    }

    toggleFullscreen() {
        const playerContainer = document.querySelector('.player-container');
        if (!document.fullscreenElement) {
            playerContainer.requestFullscreen().catch(err => {
                this.showToast('Fullscreen not available', 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }

    showError(message) {
        const errorModal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorModal.classList.add('active');
    }

    hideError() {
        const errorModal = document.getElementById('errorModal');
        errorModal.classList.remove('active');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');

        toastMessage.textContent = message;

        // Set icon based on type
        if (type === 'success') {
            toastIcon.className = 'toast-icon fas fa-check-circle';
            toastIcon.style.color = '#10b981';
        } else if (type === 'error') {
            toastIcon.className = 'toast-icon fas fa-exclamation-circle';
            toastIcon.style.color = '#ef4444';
        } else {
            toastIcon.className = 'toast-icon fas fa-info-circle';
            toastIcon.style.color = '#3b82f6';
        }

        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    generateTitle(id) {
        // Find the index of this video in the videos array
        const index = this.videos.indexOf(id);
        if (index !== -1) {
            return `Video ${index + 1}`;
        }
        // Fallback if video not found in array
        return `Video ${id}`;
    }

    generateDescription(id) {
        const descriptions = [
            'Explore the wonders of the natural world in this captivating documentary.',
            'Discover the latest innovations shaping our technological future.',
            'Join us on an unforgettable journey across breathtaking destinations.',
            'Experience an electrifying live performance from world-class artists.',
            'Learn something new with our comprehensive educational series.',
            'Witness the most thrilling moments in sports history.',
            'Master culinary skills with guidance from expert chefs.',
            'Unleash your creativity with professional art and design techniques.',
            'Dive into fascinating scientific discoveries and experiments.',
            'Transform your life with expert wellness and lifestyle advice.'
        ];
        const hash = id.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return descriptions[Math.abs(hash) % descriptions.length];
    }

    generateDuration() {
        const minutes = Math.floor(Math.random() * 45) + 5;
        const seconds = Math.floor(Math.random() * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    generateViews() {
        const views = Math.floor(Math.random() * 50000) + 1000;
        return views.toLocaleString();
    }

    getTimeAgo() {
        const options = ['2 hours ago', '1 day ago', '3 days ago', '1 week ago', '2 weeks ago', '1 month ago'];
        return options[Math.floor(Math.random() * options.length)];
    }
}

// Initialize app
const app = new VideoApp();
