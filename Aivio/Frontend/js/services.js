// ===== MOCK DATA - Videos will show immediately =====
const MOCK_VIDEOS = [
    {
        id: 1,
        title: "Introduction to Aivio - The Future of Video Sharing",
        channel: "Aivio Official",
        views: "125K",
        date: "2 days ago",
        duration: "10:25",
        thumbnail: "linear-gradient(135deg, #1a73e8, #0d47a1)"
    },
    {
        id: 2,
        title: "Top 10 Tech Innovations of 2023 - Amazing AI Breakthroughs",
        channel: "Tech Today", 
        views: "342K",
        date: "1 week ago",
        duration: "15:42",
        thumbnail: "linear-gradient(135deg, #0d47a1, #42a5f5)"
    },
    {
        id: 3,
        title: "Gaming on the New Aivio Platform - First Look and Review",
        channel: "Gaming Central",
        views: "89K",
        date: "3 days ago", 
        duration: "8:15",
        thumbnail: "linear-gradient(135deg, #42a5f5, #90caf9)"
    },
    {
        id: 4,
        title: "Chill Vibes: Lo-Fi Music Mix for Study & Relaxation - 24/7 Stream",
        channel: "Music Channel",
        views: "1.2M",
        date: "1 month ago",
        duration: "22:30",
        thumbnail: "linear-gradient(135deg, #1565c0, #1e88e5)"
    },
    {
        id: 5,
        title: "How to Create Amazing Content on Aivio - Complete Tutorial",
        channel: "Channel One",
        views: "56K", 
        date: "5 days ago",
        duration: "12:05",
        thumbnail: "linear-gradient(135deg, #1976d2, #2196f3)"
    },
    {
        id: 6,
        title: "The Future of AI in Video Creation - Revolutionary Tools",
        channel: "Tech Today",
        views: "210K",
        date: "2 weeks ago",
        duration: "18:42",
        thumbnail: "linear-gradient(135deg, #0d47a1, #1565c0)"
    },
    {
        id: 7,
        title: "5 Tips to Grow Your Gaming Channel on Aivio - Expert Advice", 
        channel: "Gaming Central",
        views: "75K",
        date: "4 days ago",
        duration: "9:15",
        thumbnail: "linear-gradient(135deg, #42a5f5, #64b5f6)"
    },
    {
        id: 8,
        title: "Best of 2023: Music Hits Compilation - Top Chart Songs",
        channel: "Music Channel",
        views: "850K",
        date: "3 weeks ago",
        duration: "25:10",
        thumbnail: "linear-gradient(135deg, #1565c0, #1976d2)"
    }
];

// ===== VIDEO SERVICE =====
class VideoService {
    static async searchVideos(query) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!query || query.trim() === '') {
            return MOCK_VIDEOS;
        }
        
        // Filter mock videos based on query
        const filteredVideos = MOCK_VIDEOS.filter(video => 
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.channel.toLowerCase().includes(query.toLowerCase())
        );
        
        return filteredVideos.length > 0 ? filteredVideos : MOCK_VIDEOS;
    }
    
    static async getTrendingVideos() {
        // Return videos immediately without API call
        return MOCK_VIDEOS;
    }
    
    static async getVideosByCategory(category) {
        if (category === 'all') {
            return MOCK_VIDEOS;
        }
        
        // Simple category filtering
        return MOCK_VIDEOS.filter(video => 
            video.title.toLowerCase().includes(category) ||
            video.channel.toLowerCase().includes(category)
        );
    }

    static async getVideo(videoId) {
        return MOCK_VIDEOS.find(video => video.id == videoId) || MOCK_VIDEOS[0];
    }
}

// ===== AUTH SERVICE =====
class AuthService {
    static async login(email, password) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock authentication
        const user = {
            id: 1,
            name: email.split('@')[0],
            email: email,
            channelName: email.split('@')[0]
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token: 'mock-jwt-token' };
    }

    static async register(userData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = {
            id: Date.now(),
            name: userData.username,
            email: userData.email,
            channelName: userData.channelName || userData.username
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token: 'mock-jwt-token' };
    }

    static async getCurrentUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

    static logout() {
        localStorage.removeItem('user');
        window.location.reload();
    }
}

// ===== NAVIGATION =====
class Navigation {
    static navigateToVideo(videoId) {
        // Show video player modal
        const modalHTML = `
            <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div class="modal-content" style="background: white; padding: 20px; border-radius: 12px; max-width: 800px; width: 90%;">
                    <div style="background: linear-gradient(135deg, #1a73e8, #0d47a1); height: 400px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; margin-bottom: 20px;">
                        <i class="fas fa-play-circle" style="font-size: 64px; margin-right: 20px;"></i>
                        Video Player - Now Playing
                    </div>
                    <h3 style="color: #333; margin-bottom: 10px;">Video #${videoId}</h3>
                    <p style="color: #666; margin-bottom: 20px;">This is where your video would play. In production, this would be a real video player.</p>
                    <button class="close-modal" style="padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 6px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.querySelector('.modal-overlay').remove();
        });
    }
}

// ===== UTILS =====
class ModalService {
    static openUploadModal() {
        const modalHTML = `
            <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div class="modal-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
                    <h3 style="color: #1a73e8; margin-bottom: 20px;">Upload Video</h3>
                    <div style="text-align: center; padding: 40px 20px; border: 2px dashed #ddd; border-radius: 8px; margin-bottom: 20px;">
                        <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #1a73e8; margin-bottom: 10px;"></i>
                        <p style="color: #666;">Drag and drop your video file here</p>
                        <button style="padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 6px; margin-top: 10px; cursor: pointer;">Browse Files</button>
                    </div>
                    <button class="close-modal" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%;">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.querySelector('.modal-overlay').remove();
        });
    }
}