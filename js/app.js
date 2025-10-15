/**
 * Main Application - Handles navigation and initialization
 */

class App {
    constructor() {
        this.currentView = 'welcome';
        this.initializeApp();
    }

    /**
     * Initialize the application
     */
    initializeApp() {
        this.initializeEventListeners();
        this.loadInitialData();
        
        // Check if user is already authenticated
        if (window.authManager && window.authManager.loadCurrentUser()) {
            // User is authenticated, app will be shown by authManager
            return;
        }
        
        // Show welcome view if not authenticated
        this.showWelcomeView();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Navigation buttons
        document.getElementById('admin-btn')?.addEventListener('click', () => {
            this.showAdminPanel();
        });

        document.getElementById('staff-btn')?.addEventListener('click', () => {
            this.showStaffPanel();
        });

        // Welcome page buttons
        document.getElementById('admin-welcome-btn')?.addEventListener('click', () => {
            this.showAdminPanel();
        });

        document.getElementById('staff-welcome-btn')?.addEventListener('click', () => {
            this.showStaffPanel();
        });

        // Staff selector will be added when staff panel is shown

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.showAdminPanel();
                        break;
                    case '2':
                        e.preventDefault();
                        this.showStaffPanel();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showWelcomeView();
                        break;
                }
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.navigateToView(e.state.view);
            }
        });
    }

    /**
     * Load initial data
     */
    loadInitialData() {
        // Data is automatically loaded by DataManager
        console.log('App initialized with data:', {
            students: dataManager.students.length,
            staff: dataManager.staff.length,
            feedback: dataManager.feedback.length
        });
    }

    /**
     * Show welcome view
     */
    showWelcomeView() {
        this.currentView = 'welcome';
        this.hideAllSections();
        document.getElementById('welcome-section').classList.remove('hidden');
        this.updateNavigationState();
        this.updatePageTitle('Welcome');
        
        // Update browser history
        history.pushState({ view: 'welcome' }, '', window.location.pathname);
    }

    /**
     * Show admin panel
     */
    showAdminPanel() {
        this.currentView = 'admin';
        this.hideAllSections();
        document.getElementById('admin-section').classList.remove('hidden');
        adminPanel.show();
        this.updateNavigationState();
        this.updatePageTitle('Admin Panel');
        
        // Update browser history
        history.pushState({ view: 'admin' }, '', window.location.pathname + '?view=admin');
    }

    /**
     * Show staff panel
     */
    showStaffPanel() {
        this.currentView = 'staff';
        this.hideAllSections();
        document.getElementById('staff-section').classList.remove('hidden');
        staffPanel.show();
        this.updateNavigationState();
        this.updatePageTitle('Staff Panel');
        this.addStaffSelector();
        
        // Update browser history
        history.pushState({ view: 'staff' }, '', window.location.pathname + '?view=staff');
    }

    /**
     * Hide all sections
     */
    hideAllSections() {
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('admin-section').classList.add('hidden');
        document.getElementById('staff-section').classList.add('hidden');
        
        // Remove staff selector when switching away from staff panel
        const existingSelector = document.getElementById('staff-selector');
        if (existingSelector) {
            existingSelector.remove();
        }
    }

    /**
     * Update navigation state
     */
    updateNavigationState() {
        const adminBtn = document.getElementById('admin-btn');
        const staffBtn = document.getElementById('staff-btn');

        // Remove active classes
        adminBtn?.classList.remove('bg-indigo-700', 'ring-2', 'ring-indigo-500');
        staffBtn?.classList.remove('bg-green-700', 'ring-2', 'ring-green-500');

        // Add active class to current view
        if (this.currentView === 'admin') {
            adminBtn?.classList.add('bg-indigo-700', 'ring-2', 'ring-indigo-500');
        } else if (this.currentView === 'staff') {
            staffBtn?.classList.add('bg-green-700', 'ring-2', 'ring-green-500');
        }
    }

    /**
     * Update page title
     */
    updatePageTitle(suffix) {
        document.title = `EAMCET Portal - ${suffix}`;
    }

    /**
     * Add staff selector for demo purposes
     */
    addStaffSelector() {
        const nav = document.querySelector('nav .flex.items-center.space-x-4');
        if (nav && this.currentView === 'staff') {
            // Remove existing staff selector if any
            const existingSelector = document.getElementById('staff-selector');
            if (existingSelector) {
                existingSelector.remove();
            }

            const staffSelector = document.createElement('div');
            staffSelector.id = 'staff-selector';
            staffSelector.className = 'flex items-center space-x-2';
            staffSelector.innerHTML = `
                <label class="text-sm font-medium text-gray-700">Staff:</label>
                <select id="staff-dropdown" class="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    ${dataManager.staff.map(staff => 
                        `<option value="${staff.id}">${staff.name}</option>`
                    ).join('')}
                </select>
            `;

            nav.appendChild(staffSelector);

            // Add event listener for staff selection
            document.getElementById('staff-dropdown').addEventListener('change', (e) => {
                const staffId = parseInt(e.target.value);
                staffPanel.setStaffId(staffId);
            });
        }
    }

    /**
     * Navigate to specific view
     */
    navigateToView(view) {
        switch (view) {
            case 'welcome':
                this.showWelcomeView();
                break;
            case 'admin':
                this.showAdminPanel();
                break;
            case 'staff':
                this.showStaffPanel();
                break;
            default:
                this.showWelcomeView();
        }
    }

    /**
     * Handle URL parameters on page load
     */
    handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        
        if (view) {
            this.navigateToView(view);
        } else {
            this.showWelcomeView();
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                }"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    /**
     * Handle errors
     */
    handleError(error, context = 'Application') {
        console.error(`${context} Error:`, error);
        this.showNotification(`An error occurred: ${error.message}`, 'error');
    }

    /**
     * Export application data
     */
    exportAllData() {
        const exportData = {
            students: dataManager.students,
            staff: dataManager.staff,
            feedback: dataManager.feedback,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eamcet_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('All data exported successfully!', 'success');
    }

    /**
     * Import application data
     */
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.students && data.staff && data.feedback) {
                    dataManager.students = data.students;
                    dataManager.staff = data.staff;
                    dataManager.feedback = data.feedback;
                    dataManager.saveToStorage();
                    
                    this.showNotification('Data imported successfully!', 'success');
                    
                    // Refresh current view
                    if (this.currentView === 'admin') {
                        adminPanel.show();
                    } else if (this.currentView === 'staff') {
                        staffPanel.show();
                    }
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                this.handleError(error, 'Data Import');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Reset application data
     */
    resetData() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            dataManager.clearAllData();
            this.showNotification('All data has been reset', 'warning');
            
            // Refresh current view
            if (this.currentView === 'admin') {
                adminPanel.show();
            } else if (this.currentView === 'staff') {
                staffPanel.show();
            }
        }
    }

    /**
     * Get application statistics
     */
    getAppStats() {
        return {
            students: dataManager.students.length,
            staff: dataManager.staff.length,
            feedback: dataManager.feedback.length,
            lastUpdated: new Date().toISOString(),
            storageUsed: this.getStorageUsage()
        };
    }

    /**
     * Get localStorage usage
     */
    getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.handleURLParams();
    
    // Add keyboard shortcuts info
    console.log('Keyboard shortcuts:');
    console.log('Ctrl/Cmd + 1: Admin Panel');
    console.log('Ctrl/Cmd + 2: Staff Panel');
    console.log('Ctrl/Cmd + H: Home/Welcome');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh data when page becomes visible
        if (window.app && window.app.currentView === 'admin') {
            adminPanel.updateDashboardStats();
        } else if (window.app && window.app.currentView === 'staff') {
            staffPanel.updateStaffStats();
        }
    }
});

// Handle window beforeunload for data persistence
window.addEventListener('beforeunload', () => {
    dataManager.saveToStorage();
});
