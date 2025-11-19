// ===== UTILITY FUNCTIONS =====
const Utils = {
    // Format large numbers (125000 -> 125K, 1250000 -> 1.2M)
    formatNumber: (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },
    
    // Format seconds to duration string (125 -> "2:05")
    formatDuration: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Debounce function for search input
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Get random blue color for thumbnails
    getRandomColor: () => {
        const colors = [
            'linear-gradient(135deg, #1a73e8, #0d47a1)',
            'linear-gradient(135deg, #0d47a1, #42a5f5)',
            'linear-gradient(135deg, #42a5f5, #90caf9)',
            'linear-gradient(135deg, #1565c0, #1e88e5)',
            'linear-gradient(135deg, #1976d2, #2196f3)',
            'linear-gradient(135deg, #0d47a1, #1565c0)',
            'linear-gradient(135deg, #42a5f5, #64b5f6)',
            'linear-gradient(135deg, #1565c0, #1976d2)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // Show notification - NO ALERTS!
    showNotification: (message, type = 'info') => {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    },
    
    // Toggle sidebar on mobile
    toggleSidebar: () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    },
    
    // Generate random view count
    getRandomViews: () => {
        const views = [125000, 342000, 89000, 1200000, 56000, 210000, 75000, 850000];
        return Utils.formatNumber(views[Math.floor(Math.random() * views.length)]);
    },
    
    // Generate random time ago
    getRandomTimeAgo: () => {
        const times = ['2 days ago', '1 week ago', '3 days ago', '1 month ago', '5 days ago', '2 weeks ago', '4 days ago', '3 weeks ago'];
        return times[Math.floor(Math.random() * times.length)];
    }
};