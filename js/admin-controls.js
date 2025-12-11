// admin-controls.js - Admin & Owner Controls
class AdminControls {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentUser = window.currentUser;
        this.adminPanelOpen = false;
        
        this.initializeAdminControls();
    }
    
    initializeAdminControls() {
        // Only initialize if user is admin or owner
        if (this.currentUser.role !== 'admin' && this.currentUser.role !== 'owner') {
            return;
        }
        
        this.setupEventListeners();
        this.setupModals();
        
        console.log('Admin controls initialized for:', this.currentUser.role);
    }
    
    setupEventListeners() {
        // Admin toggle button
        const adminToggleBtn = document.getElementById('adminToggleBtn');
        if (adminToggleBtn) {
            adminToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleAdminPanel();
            });
        }
        
        // Close admin panel when clicking outside
        document.addEventListener('click', (e) => {
            const adminControls = document.getElementById('adminControls');
            if (adminControls && !adminControls.contains(e.target) && this.adminPanelOpen) {
                this.closeAdminPanel();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.adminPanelOpen) {
                this.closeAdminPanel();
            }
        });
    }
    
    setupModals() {
        // Announcement modal
        const announceBtn = document.getElementById('announceBtn');
        const announcementModalClose = document.getElementById('announcementModalClose');
        const sendAnnouncementBtn = document.getElementById('sendAnnouncementBtn');
        
        if (announceBtn) {
            announceBtn.addEventListener('click', () => {
                this.openModal('announcementModal');
            });
        }
        
        if (announcementModalClose) {
            announcementModalClose.addEventListener('click', () => {
                this.closeModal('announcementModal');
            });
        }
        
        if (sendAnnouncementBtn) {
            sendAnnouncementBtn.addEventListener('click', () => {
                this.sendAnnouncement();
            });
        }
        
        // Kick user modal
        const kickUserBtn = document.getElementById('kickUserBtn');
        const kickUserModalClose = document.getElementById('kickUserModalClose');
        const confirmKickBtn = document.getElementById('confirmKickBtn');
        
        if (kickUserBtn) {
            kickUserBtn.addEventListener('click', () => {
                this.openModal('kickUserModal');
            });
        }
        
        if (kickUserModalClose) {
            kickUserModalClose.addEventListener('click', () => {
                this.closeModal('kickUserModal');
            });
        }
        
        if (confirmKickBtn) {
            confirmKickBtn.addEventListener('click', () => {
                this.kickUser();
            });
        }
        
        // Grant admin modal
        const grantAdminBtn = document.getElementById('grantAdminBtn');
        const grantAdminModalClose = document.getElementById('grantAdminModalClose');
        const confirmGrantAdminBtn = document.getElementById('confirmGrantAdminBtn');
        
        if (grantAdminBtn) {
            grantAdminBtn.addEventListener('click', () => {
                this.openModal('grantAdminModal');
            });
        }
        
        if (grantAdminModalClose) {
            grantAdminModalClose.addEventListener('click', () => {
                this.closeModal('grantAdminModal');
            });
        }
        
        if (confirmGrantAdminBtn) {
            confirmGrantAdminBtn.addEventListener('click', () => {
                this.grantAdmin();
            });
        }
        
        // Revoke admin modal
        const revokeAdminBtn = document.getElementById('revokeAdminBtn');
        const revokeAdminModalClose = document.getElementById('revokeAdminModalClose');
        const confirmRevokeAdminBtn = document.getElementById('confirmRevokeAdminBtn');
        
        if (revokeAdminBtn) {
            revokeAdminBtn.addEventListener('click', () => {
                this.openModal('revokeAdminModal');
            });
        }
        
        if (revokeAdminModalClose) {
            revokeAdminModalClose.addEventListener('click', () => {
                this.closeModal('revokeAdminModal');
            });
        }
        
        if (confirmRevokeAdminBtn) {
            confirmRevokeAdminBtn.addEventListener('click', () => {
                this.revokeAdmin();
            });
        }
        
        // Clear chat modal
        const clearChatBtn = document.getElementById('clearChatBtn');
        const clearChatModalClose = document.getElementById('clearChatModalClose');
        const confirmClearChatBtn = document.getElementById('confirmClearChatBtn');
        const cancelClearChatBtn = document.getElementById('cancelClearChatBtn');
        
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => {
                this.openModal('clearChatModal');
            });
        }
        
        if (clearChatModalClose) {
            clearChatModalClose.addEventListener('click', () => {
                this.closeModal('clearChatModal');
            });
        }
        
        if (confirmClearChatBtn) {
            confirmClearChatBtn.addEventListener('click', () => {
                this.clearChat();
            });
        }
        
        if (cancelClearChatBtn) {
            cancelClearChatBtn.addEventListener('click', () => {
                this.closeModal('clearChatModal');
            });
        }
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }
    
    toggleAdminPanel() {
        const adminControls = document.getElementById('adminControls');
        if (!adminControls) return;
        
        if (this.adminPanelOpen) {
            this.closeAdminPanel();
        } else {
            this.openAdminPanel();
        }
    }
    
    openAdminPanel() {
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            adminControls.classList.add('open');
            this.adminPanelOpen = true;
        }
    }
    
    closeAdminPanel() {
        const adminControls = document.getElementById('adminControls');
        if (adminControls) {
            adminControls.classList.remove('open');
            this.adminPanelOpen = false;
        }
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            this.closeAdminPanel(); // Close admin panel when opening modal
            
            // Focus on first input if exists
            const input = modal.querySelector('input, textarea');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
            
            // Clear inputs
            modal.querySelectorAll('input, textarea').forEach(input => {
                input.value = '';
            });
        }
    }
    
    async sendAnnouncement() {
        const announcementText = document.getElementById('announcementText').value.trim();
        
        if (!announcementText) {
            this.showError('Please enter an announcement message.');
            return;
        }
        
        if (announcementText.length > 500) {
            this.showError('Announcement too long (max 500 characters).');
            return;
        }
        
        try {
            const { data, error } = await this.supabase
                .from('announcements')
                .insert([
                    {
                        text: announcementText,
                        created_by: this.currentUser.id,
                        timestamp: new Date().toISOString(),
                        read_by: []
                    }
                ]);
            
            if (error) throw error;
            
            // Close modal
            this.closeModal('announcementModal');
            
            // Show success message
            this.showSuccess('Announcement sent successfully!');
            
            // Send announcement to all users via chat
            await this.sendAnnouncementToChat(announcementText);
            
        } catch (error) {
            console.error('Error sending announcement:', error);
            this.showError('Failed to send announcement.');
        }
    }
    
    async sendAnnouncementToChat(announcementText) {
        try {
            const messageData = {
                text: `📢 **ANNOUNCEMENT**: ${announcementText}`,
                sender_id: this.currentUser.id,
                sender_name: 'System Announcement',
                room: 'public',
                timestamp: new Date().toISOString(),
                likes: [],
                dislikes: [],
                deleted: false
            };
            
            const { error } = await this.supabase
                .from('messages')
                .insert([messageData]);
            
            if (error) throw error;
            
            // Play special announcement sound
            this.playAnnouncementSound();
            
        } catch (error) {
            console.error('Error sending announcement to chat:', error);
        }
    }
    
    playAnnouncementSound() {
        // Create announcement sound
        const announcementSound = new Audio('msg.mp3');
        announcementSound.volume = 0.5;
        
        // Play it twice for announcement effect
        announcementSound.play();
        setTimeout(() => {
            announcementSound.currentTime = 0;
            announcementSound.play();
        }, 300);
    }
    
    async kickUser() {
        const username = document.getElementById('kickUsername').value.trim();
        
        if (!username) {
            this.showError('Please enter a username.');
            return;
        }
        
        // Cannot kick yourself
        if (username.toLowerCase() === this.currentUser.username.toLowerCase()) {
            this.showError('You cannot kick yourself.');
            return;
        }
        
        // Owner can kick anyone, admins cannot kick owner or other admins
        if (this.currentUser.role === 'admin') {
            const user = await this.getUserByUsername(username);
            if (user) {
                if (user.role === 'owner') {
                    this.showError('Admins cannot kick the owner.');
                    return;
                }
                if (user.role === 'admin') {
                    this.showError('Admins cannot kick other admins.');
                    return;
                }
            }
        }
        
        try {
            // Update user status to offline
            const { error } = await this.supabase
                .from('users')
                .update({ online: false })
                .eq('username', username);
            
            if (error) throw error;
            
            // Close modal
            this.closeModal('kickUserModal');
            
            // Show success message
            this.showSuccess(`User "${username}" has been kicked.`);
            
            // Send system message about kick
            await this.sendSystemMessage(`${username} has been kicked from the chat.`);
            
        } catch (error) {
            console.error('Error kicking user:', error);
            this.showError('Failed to kick user. They may not exist.');
        }
    }
    
    async grantAdmin() {
        // Only owner can grant admin
        if (this.currentUser.role !== 'owner') {
            this.showError('Only the owner can grant admin privileges.');
            return;
        }
        
        const username = document.getElementById('grantAdminUsername').value.trim();
        
        if (!username) {
            this.showError('Please enter a username.');
            return;
        }
        
        // Cannot grant admin to yourself (already owner)
        if (username.toLowerCase() === this.currentUser.username.toLowerCase()) {
            this.showError('You are already the owner.');
            return;
        }
        
        try {
            // Update user role to admin
            const { error } = await this.supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('username', username);
            
            if (error) throw error;
            
            // Close modal
            this.closeModal('grantAdminModal');
            
            // Show success message
            this.showSuccess(`User "${username}" has been granted admin privileges.`);
            
            // Send system message
            await this.sendSystemMessage(`${username} has been granted admin privileges!`);
            
        } catch (error) {
            console.error('Error granting admin:', error);
            this.showError('Failed to grant admin. User may not exist.');
        }
    }
    
    async revokeAdmin() {
        // Only owner can revoke admin
        if (this.currentUser.role !== 'owner') {
            this.showError('Only the owner can revoke admin privileges.');
            return;
        }
        
        const username = document.getElementById('revokeAdminUsername').value.trim();
        
        if (!username) {
            this.showError('Please enter a username.');
            return;
        }
        
        // Cannot revoke admin from yourself
        if (username.toLowerCase() === this.currentUser.username.toLowerCase()) {
            this.showError('You cannot revoke admin from yourself (you are owner).');
            return;
        }
        
        try {
            // Update user role to user
            const { error } = await this.supabase
                .from('users')
                .update({ role: 'user' })
                .eq('username', username);
            
            if (error) throw error;
            
            // Close modal
            this.closeModal('revokeAdminModal');
            
            // Show success message
            this.showSuccess(`Admin privileges revoked from "${username}".`);
            
            // Send system message
            await this.sendSystemMessage(`${username}'s admin privileges have been revoked.`);
            
        } catch (error) {
            console.error('Error revoking admin:', error);
            this.showError('Failed to revoke admin. User may not exist.');
        }
    }
    
    async clearChat() {
        const currentRoom = window.chatCore ? window.chatCore.currentRoom : 'public';
        
        try {
            // Mark all messages in current room as deleted
            const { error } = await this.supabase
                .from('messages')
                .update({ deleted: true })
                .eq('room', currentRoom);
            
            if (error) throw error;
            
            // Close modal
            this.closeModal('clearChatModal');
            
            // Show success message
            this.showSuccess(`Chat cleared successfully.`);
            
            // Send system message
            await this.sendSystemMessage(`Chat has been cleared by ${this.currentUser.displayName}.`);
            
            // Reload messages
            if (window.chatCore && window.chatCore.loadMessages) {
                await window.chatCore.loadMessages();
            }
            
        } catch (error) {
            console.error('Error clearing chat:', error);
            this.showError('Failed to clear chat.');
        }
    }
    
    async sendSystemMessage(text) {
        try {
            const messageData = {
                text: `⚙️ **SYSTEM**: ${text}`,
                sender_id: this.currentUser.id,
                sender_name: 'System',
                room: 'public',
                timestamp: new Date().toISOString(),
                likes: [],
                dislikes: [],
                deleted: false
            };
            
            const { error } = await this.supabase
                .from('messages')
                .insert([messageData]);
            
            if (error) throw error;
            
        } catch (error) {
            console.error('Error sending system message:', error);
        }
    }
    
    async getUserByUsername(username) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();
            
            if (error) return null;
            return data;
            
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }
    
    showError(message) {
        if (window.authManager && window.authManager.showError) {
            window.authManager.showError(message);
        } else {
            alert(message);
        }
    }
    
    showSuccess(message) {
        if (window.authManager && window.authManager.showSuccess) {
            window.authManager.showSuccess(message);
        } else {
            alert(message);
        }
    }
    
    // Add admin-specific styles
    static addAdminStyles() {
        const styleId = 'admin-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Admin badge styling */
            .role-badge.admin {
                background: var(--admin-gradient);
                color: white;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                display: inline-block;
                margin-left: 6px;
                animation: adminGlow 2s infinite alternate;
            }
            
            @keyframes adminGlow {
                from { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
                to { box-shadow: 0 0 10px rgba(139, 92, 246, 0.8); }
            }
            
            /* Owner badge styling - INSANELY GOOD POPPY */
            .role-badge.owner {
                background: var(--owner-gradient);
                color: white;
                padding: 4px 10px;
                border-radius: 14px;
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
                display: inline-block;
                margin-left: 6px;
                animation: ownerPop 0.5s ease, ownerPulse 2s infinite;
                position: relative;
                overflow: hidden;
                z-index: 1;
            }
            
            .role-badge.owner::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: var(--owner-gradient);
                z-index: -1;
                border-radius: 16px;
                filter: blur(4px);
                opacity: 0.7;
                animation: ownerShimmer 3s infinite linear;
            }
            
            @keyframes ownerPop {
                0% { transform: scale(0.8); opacity: 0; }
                70% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes ownerPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes ownerShimmer {
                0% { background-position: -200px 0; }
                100% { background-position: 200px 0; }
            }
            
            /* Admin message styling */
            .message.admin {
                border-left: 4px solid;
                border-image: var(--admin-gradient) 1;
                background: linear-gradient(135deg, 
                    rgba(139, 92, 246, 0.05), 
                    rgba(124, 58, 237, 0.05));
                position: relative;
            }
            
            .message.admin::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: var(--admin-gradient);
                opacity: 0.3;
            }
            
            /* Owner message styling - INSANELY GOOD POPPY */
            .message.owner {
                animation: ownerMessageEntry 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                transform-origin: left center;
            }
            
            @keyframes ownerMessageEntry {
                0% { 
                    transform: translateX(-50px) scale(0.8);
                    opacity: 0;
                }
                60% { 
                    transform: translateX(10px) scale(1.05);
                }
                100% { 
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
            }
            
            .message.owner:hover {
                transform: translateY(-2px) scale(1.01);
                transition: transform 0.3s ease;
            }
            
            /* Admin controls hover effects */
            .admin-btn {
                background: linear-gradient(135deg, var(--danger-color), #dc2626);
                position: relative;
                overflow: hidden;
            }
            
            .admin-btn::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    to right,
                    rgba(255, 255, 255, 0) 0%,
                    rgba(255, 255, 255, 0.1) 50%,
                    rgba(255, 255, 255, 0) 100%
                );
                transform: rotate(30deg);
                animation: adminShine 3s infinite linear;
            }
            
            @keyframes adminShine {
                0% { transform: translateX(-100%) rotate(30deg); }
                100% { transform: translateX(100%) rotate(30deg); }
            }
            
            /* System message styling */
            .message[data-sender="System"] {
                background: linear-gradient(135deg, 
                    rgba(59, 130, 246, 0.1), 
                    rgba(37, 99, 235, 0.1));
                border: 1px solid rgba(59, 130, 246, 0.3);
                font-style: italic;
            }
            
            .message[data-sender="System Announcement"] {
                background: linear-gradient(135deg, 
                    rgba(245, 158, 11, 0.1), 
                    rgba(217, 119, 6, 0.1));
                border: 2px solid rgba(245, 158, 11, 0.5);
                animation: announcementPulse 2s infinite;
            }
            
            @keyframes announcementPulse {
                0%, 100% { border-color: rgba(245, 158, 11, 0.5); }
                50% { border-color: rgba(245, 158, 11, 0.8); }
            }
            
            /* Modal animations */
            .modal.open .modal-content {
                animation: modalAppear 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }
            
            @keyframes modalAppear {
                0% { 
                    transform: translateY(-50px) scale(0.9);
                    opacity: 0;
                }
                100% { 
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }
            
            /* Admin panel animation */
            .admin-controls.open .admin-panel {
                animation: panelSlideDown 0.3s ease;
            }
            
            @keyframes panelSlideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Kick user animation (visual feedback) */
            .user-item.kicked {
                animation: userKickAnimation 0.5s ease forwards;
            }
            
            @keyframes userKickAnimation {
                0% { 
                    opacity: 1;
                    transform: translateX(0);
                }
                100% { 
                    opacity: 0;
                    transform: translateX(-100%);
                    display: none;
                }
            }
            
            /* Clear chat confirmation styling */
            #clearChatModal .send-btn {
                transition: all 0.3s ease;
            }
            
            #clearChatModal .send-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }
            
            #clearChatModal .send-btn:active {
                transform: translateY(0);
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Add admin styles when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AdminControls.addAdminStyles();
    
    // Initialize AdminControls if user is admin/owner
    setTimeout(() => {
        if (window.currentUser && (window.currentUser.role === 'admin' || window.currentUser.role === 'owner')) {
            window.adminControls = new AdminControls();
        }
    }, 1000); // Wait for auth to initialize
});

// Export for other files
window.AdminControls = AdminControls;
