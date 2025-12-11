// upload.js - Image Upload Handling (5MB limit)
class UploadManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentUser = window.currentUser;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.uploading = false;
        
        this.initializeUpload();
    }
    
    initializeUpload() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Attach image button
        const attachBtn = document.getElementById('attachImageBtn');
        const fileInput = document.getElementById('imageUpload');
        
        if (attachBtn && fileInput) {
            attachBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e);
            });
        }
        
        // Drag and drop for message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                messageInput.classList.add('drag-over');
            });
            
            messageInput.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                messageInput.classList.remove('drag-over');
            });
            
            messageInput.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                messageInput.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFiles(files);
                }
            });
        }
    }
    
    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.handleFiles(files);
        }
    }
    
    async handleFiles(files) {
        const file = files[0];
        
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }
        
        // Show uploading indicator
        this.showUploadingIndicator();
        
        try {
            // Upload file
            const imageUrl = await this.uploadFile(file);
            
            // Send message with image
            await this.sendImageMessage(imageUrl, file.name);
            
            // Hide uploading indicator
            this.hideUploadingIndicator();
            
            // Reset file input
            const fileInput = document.getElementById('imageUpload');
            if (fileInput) {
                fileInput.value = '';
            }
            
        } catch (error) {
            console.error('Error uploading file:', error);
            this.showError('Failed to upload image. Please try again.');
            this.hideUploadingIndicator();
        }
    }
    
    validateFile(file) {
        // Check if file exists
        if (!file) {
            return { valid: false, message: 'No file selected.' };
        }
        
        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
            const allowedFormats = this.allowedTypes.map(t => t.split('/')[1]).join(', ');
            return { 
                valid: false, 
                message: `Invalid file type. Allowed formats: ${allowedFormats}` 
            };
        }
        
        // Check file size (5MB limit)
        if (file.size > this.maxFileSize) {
            const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
            return { 
                valid: false, 
                message: `File too large (${sizeInMB}MB). Maximum size is 5MB.` 
            };
        }
        
        return { valid: true, message: 'File is valid.' };
    }
    
    async uploadFile(file) {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `chat_${this.currentUser.id}_${timestamp}_${randomString}.${file.name.split('.').pop()}`;
        
        // Upload to Supabase Storage
        const { data, error } = await this.supabase.storage
            .from('chat-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
        
        // Get public URL
        const { data: { publicUrl } } = this.supabase.storage
            .from('chat-images')
            .getPublicUrl(fileName);
        
        return publicUrl;
    }
    
    async sendImageMessage(imageUrl, originalFileName) {
        // Get chat core instance
        const chatCore = window.chatCore;
        if (!chatCore) {
            throw new Error('Chat core not initialized');
        }
        
        // Create message with image
        const message = `[Image: ${originalFileName}]`;
        await chatCore.sendMessage(message, imageUrl);
    }
    
    showUploadingIndicator() {
        this.uploading = true;
        
        // Disable send button and show uploading text
        const sendBtn = document.getElementById('sendMessageBtn');
        const messageInput = document.getElementById('messageInput');
        
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = `
                <div class="loading-spinner" style="width: 16px; height: 16px;"></div>
                Uploading...
            `;
        }
        
        if (messageInput) {
            messageInput.disabled = true;
            messageInput.placeholder = 'Uploading image...';
        }
        
        // Show progress notification
        this.showNotification('Uploading image...', 'info');
    }
    
    hideUploadingIndicator() {
        this.uploading = false;
        
        // Re-enable send button
        const sendBtn = document.getElementById('sendMessageBtn');
        const messageInput = document.getElementById('messageInput');
        
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = `
                <div class="send-btn-icon">${window.getIcon('send')}</div>
                Send
            `;
        }
        
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = 'Type your message here (emojis disabled)...';
            messageInput.focus();
        }
        
        // Hide progress notification
        this.hideNotification();
    }
    
    showNotification(message, type = 'info') {
        // Create or update notification
        let notification = document.getElementById('uploadNotification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'uploadNotification';
            notification.className = `upload-notification ${type}`;
            document.body.appendChild(notification);
        }
        
        notification.innerHTML = `
            <div class="upload-notification-content">
                <div class="upload-notification-icon">
                    ${type === 'info' ? window.getIcon('image') : window.getIcon('warning')}
                </div>
                <div class="upload-notification-text">${message}</div>
                <button class="upload-notification-close" onclick="window.uploadManager.hideNotification()">
                    ${window.getIcon('close')}
                </button>
            </div>
        `;
        
        notification.classList.add('show');
        
        // Auto-hide after 3 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                this.hideNotification();
            }, 3000);
        }
    }
    
    hideNotification() {
        const notification = document.getElementById('uploadNotification');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }
    
    showError(message) {
        if (window.authManager && window.authManager.showError) {
            window.authManager.showError(message);
        } else {
            alert(message);
        }
    }
    
    // Add CSS for upload notification
    static addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .upload-notification {
                position: fixed;
                bottom: 100px;
                right: 30px;
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 15px;
                box-shadow: var(--shadow-xl);
                z-index: 10000;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                max-width: 300px;
            }
            
            .upload-notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .upload-notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .upload-notification-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
            }
            
            .upload-notification-text {
                flex: 1;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .upload-notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }
            
            .upload-notification-close:hover {
                background: rgba(0,0,0,0.05);
            }
            
            .upload-notification.info {
                border-left: 4px solid var(--info-color);
            }
            
            .upload-notification.success {
                border-left: 4px solid var(--success-color);
            }
            
            .upload-notification.error {
                border-left: 4px solid var(--danger-color);
            }
            
            .message-input.drag-over {
                border-color: var(--primary-color) !important;
                background: rgba(59, 130, 246, 0.05) !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            }
            
            .loading-spinner {
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .reply-indicator {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-sm);
                padding: 10px;
                margin-bottom: 10px;
                animation: slideDown 0.3s ease;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .reply-indicator-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .reply-details {
                flex: 1;
                overflow: hidden;
            }
            
            .reply-to {
                font-weight: 600;
                font-size: 0.9rem;
                margin-bottom: 2px;
            }
            
            .reply-text {
                font-size: 0.85rem;
                color: var(--text-secondary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .reply-cancel-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            
            .reply-cancel-btn:hover {
                background: rgba(0,0,0,0.05);
            }
            
            .reply-preview {
                background: rgba(59, 130, 246, 0.05);
                border-left: 3px solid var(--primary-color);
                padding: 8px 12px;
                margin-bottom: 10px;
                border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .reply-icon {
                width: 16px;
                height: 16px;
                opacity: 0.7;
            }
            
            .reply-content {
                flex: 1;
                font-size: 0.9rem;
                color: var(--text-secondary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .date-separator {
                display: flex;
                align-items: center;
                margin: 20px 0;
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            .date-line {
                flex: 1;
                height: 1px;
                background: var(--border-color);
            }
            
            .date-text {
                padding: 0 15px;
                white-space: nowrap;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Add styles when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UploadManager.addStyles();
    
    // Initialize UploadManager
    window.uploadManager = new UploadManager();
});

// Export for other files
window.UploadManager = UploadManager;
