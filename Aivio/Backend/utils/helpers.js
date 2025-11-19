// Format duration from seconds to HH:MM:SS
exports.formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
};

// Generate random string for IDs
exports.generateRandomId = (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

// Sanitize filename
exports.sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
};

// Calculate video file size
exports.formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};