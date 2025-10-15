/**
 * Data Manager - Handles all data operations and localStorage persistence
 */

class DataManager {
    constructor() {
        this.students = [];
        this.staff = [];
        this.feedback = [];
        this.initializeData();
    }

    /**
     * Initialize data from localStorage or create default data
     */
    initializeData() {
        this.loadFromStorage();
        
        // Create default staff if none exist
        if (this.staff.length === 0) {
            this.createDefaultStaff();
        }
        
        // Create sample students if none exist
        if (this.students.length === 0) {
            this.createSampleStudents();
        }
        
        // Create sample feedback if none exist
        if (this.feedback.length === 0) {
            this.createSampleFeedback();
        }
    }

    /**
     * Load data from localStorage
     */
    loadFromStorage() {
        try {
            this.students = JSON.parse(localStorage.getItem('eamcet_students')) || [];
            this.staff = JSON.parse(localStorage.getItem('eamcet_staff')) || [];
            this.feedback = JSON.parse(localStorage.getItem('eamcet_feedback')) || [];
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            this.students = [];
            this.staff = [];
            this.feedback = [];
        }
    }

    /**
     * Save data to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('eamcet_students', JSON.stringify(this.students));
            localStorage.setItem('eamcet_staff', JSON.stringify(this.staff));
            localStorage.setItem('eamcet_feedback', JSON.stringify(this.feedback));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }

    /**
     * Create default staff members (legacy - now handled by authManager)
     */
    createDefaultStaff() {
        // This is now handled by the authentication manager
        // Keep for backward compatibility but don't create staff here
        if (this.staff.length === 0) {
            this.staff = [];
            this.saveToStorage();
        }
    }

    /**
     * Create sample feedback for demonstration
     */
    createSampleFeedback() {
        this.feedback = [
            {
                id: 1,
                studentId: 1,
                staffId: 2,
                status: 'contacted',
                remarks: 'Student contacted successfully. Showed interest in computer science programs.',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                studentId: 2,
                staffId: 2,
                status: 'interested',
                remarks: 'Very interested in engineering programs. Wants to visit campus.',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                studentId: 3,
                staffId: 3,
                status: 'pending',
                remarks: 'Unable to reach student. Will try again tomorrow.',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 4,
                studentId: 4,
                staffId: 3,
                status: 'not_interested',
                remarks: 'Student not interested in our programs. Looking for different field.',
                timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        this.saveToStorage();
    }

    /**
     * Create sample students for demonstration
     */
    createSampleStudents() {
        this.students = [
            {
                id: 1,
                name: 'Aarav Sharma',
                phone: '9876543210',
                rank: 1250,
                category: 'OC',
                assignedStaff: 2, // Assigned to John Smith
                status: 'contacted',
                uploadDate: new Date().toISOString().split('T')[0],
                isSpecial: false
            },
            {
                id: 2,
                name: 'Diya Patel',
                phone: '9876543211',
                rank: 2300,
                category: 'BC-A',
                assignedStaff: 2, // Assigned to John Smith
                status: 'interested',
                uploadDate: new Date().toISOString().split('T')[0],
                isSpecial: false
            },
            {
                id: 3,
                name: 'Rohan Reddy',
                phone: '9876543212',
                rank: 850,
                category: 'OC',
                assignedStaff: 3, // Assigned to Sarah Johnson
                status: 'pending',
                uploadDate: new Date().toISOString().split('T')[0],
                isSpecial: true
            },
            {
                id: 4,
                name: 'Priya Kumar',
                phone: '9876543213',
                rank: 3100,
                category: 'SC',
                assignedStaff: 3, // Assigned to Sarah Johnson
                status: 'not_interested',
                uploadDate: new Date().toISOString().split('T')[0],
                isSpecial: false
            },
            {
                id: 5,
                name: 'Vikram Singh',
                phone: '9876543214',
                rank: 4500,
                category: 'OC',
                assignedStaff: null,
                status: 'pending',
                uploadDate: new Date().toISOString().split('T')[0],
                isSpecial: false
            }
        ];
        this.saveToStorage();
    }

    /**
     * Add new students from uploaded file
     */
    addStudents(newStudents) {
        const maxId = Math.max(...this.students.map(s => s.id), 0);
        newStudents.forEach((student, index) => {
            student.id = maxId + index + 1;
            student.assignedStaff = null;
            student.status = 'pending';
            student.uploadDate = new Date().toISOString().split('T')[0];
            student.isSpecial = false;
        });
        
        this.students.push(...newStudents);
        this.saveToStorage();
        return newStudents.length;
    }

    /**
     * Update student information
     */
    updateStudent(studentId, updates) {
        const index = this.students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            this.students[index] = { ...this.students[index], ...updates };
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Delete student
     */
    deleteStudent(studentId) {
        const index = this.students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            this.students.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Auto-assign students to staff equally
     */
    autoAssignStudents() {
        // Get staff from auth manager
        const activeStaff = window.authManager ? 
            window.authManager.getUsersByRole('staff') : 
            this.staff.filter(s => s.isActive);
        const unassignedStudents = this.students.filter(s => !s.assignedStaff);
        
        if (activeStaff.length === 0 || unassignedStudents.length === 0) {
            return 0;
        }

        let assignmentCount = 0;
        unassignedStudents.forEach((student, index) => {
            const staffIndex = index % activeStaff.length;
            student.assignedStaff = activeStaff[staffIndex].id;
            assignmentCount++;
        });

        this.saveToStorage();
        return assignmentCount;
    }

    /**
     * Manually assign student to staff
     */
    assignStudentToStaff(studentId, staffId) {
        const student = this.students.find(s => s.id === studentId);
        const staff = this.staff.find(s => s.id === staffId);
        
        if (student && staff) {
            student.assignedStaff = staffId;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Assign special students to top-performing staff only
     */
    assignSpecialStudents() {
        const specialStudents = this.students.filter(s => s.isSpecial && !s.assignedStaff);
        const topStaff = this.getTopPerformingStaff();
        
        if (topStaff.length === 0 || specialStudents.length === 0) {
            return 0;
        }

        // Only assign to the top 2 performers to ensure quality
        const topPerformers = topStaff.slice(0, 2);
        if (topPerformers.length === 0) {
            this.showMessage('No top-performing staff available for special assignments', 'warning');
            return 0;
        }

        let assignmentCount = 0;
        specialStudents.forEach((student, index) => {
            const staffIndex = index % topPerformers.length;
            student.assignedStaff = topPerformers[staffIndex].id;
            assignmentCount++;
        });

        this.saveToStorage();
        return assignmentCount;
    }

    /**
     * Get top-performing staff based on completion rate
     */
    getTopPerformingStaff() {
        const staff = window.authManager ? 
            window.authManager.getUsersByRole('staff') : 
            this.staff.filter(s => s.isActive);
            
        return staff.map(staffMember => {
            const assignedStudents = this.students.filter(s => s.assignedStaff === staffMember.id);
            const completedStudents = assignedStudents.filter(s => s.status !== 'pending');
            const completionRate = assignedStudents.length > 0 ? completedStudents.length / assignedStudents.length : 0;
            
            return {
                ...staffMember,
                completionRate,
                assignedCount: assignedStudents.length,
                completedCount: completedStudents.length
            };
        })
        .filter(staff => staff.assignedCount > 0) // Only staff with assigned students
        .sort((a, b) => {
            // Sort by completion rate first, then by total completed students
            if (b.completionRate !== a.completionRate) {
                return b.completionRate - a.completionRate;
            }
            return b.completedCount - a.completedCount;
        })
        .slice(0, 3); // Top 3 performers
    }

    /**
     * Add feedback for a student
     */
    addFeedback(studentId, staffId, status, remarks) {
        const feedback = {
            id: Date.now(),
            studentId,
            staffId,
            status,
            remarks,
            timestamp: new Date().toISOString()
        };
        
        this.feedback.push(feedback);
        
        // Update student status
        this.updateStudent(studentId, { status });
        
        this.saveToStorage();
        return feedback.id;
    }

    /**
     * Get students assigned to specific staff
     */
    getStudentsByStaff(staffId) {
        return this.students.filter(s => s.assignedStaff === staffId);
    }

    /**
     * Get statistics for dashboard
     */
    getStatistics() {
        const totalStudents = this.students.length;
        const assignedStudents = this.students.filter(s => s.assignedStaff).length;
        const pendingStudents = this.students.filter(s => s.status === 'pending').length;
        const completedStudents = this.students.filter(s => s.status !== 'pending').length;
        const activeStaff = window.authManager ? 
            window.authManager.getUsersByRole('staff').length : 
            this.staff.filter(s => s.isActive).length;
        const specialStudents = this.students.filter(s => s.isSpecial).length;

        return {
            totalStudents,
            assignedStudents,
            pendingStudents,
            completedStudents,
            activeStaff,
            specialStudents,
            assignmentRate: totalStudents > 0 ? (assignedStudents / totalStudents * 100).toFixed(1) : 0,
            completionRate: totalStudents > 0 ? (completedStudents / totalStudents * 100).toFixed(1) : 0
        };
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const stats = this.getStatistics();
        const staffPerformance = this.getStaffPerformanceReport();
        
        const report = {
            generatedAt: new Date().toISOString(),
            statistics: stats,
            staffPerformance,
            studentBreakdown: this.getStudentBreakdown(),
            feedback: this.feedback.slice(-10) // Last 10 feedback entries
        };
        
        return report;
    }

    /**
     * Get staff performance report
     */
    getStaffPerformanceReport() {
        const staff = window.authManager ? 
            window.authManager.getUsersByRole('staff') : 
            this.staff;
            
        return staff.map(staffMember => {
            const assignedStudents = this.getStudentsByStaff(staffMember.id);
            const completedStudents = assignedStudents.filter(s => s.status !== 'pending');
            const feedbackCount = this.feedback.filter(f => f.staffId === staffMember.id).length;
            
            return {
                staffId: staffMember.id,
                staffName: staffMember.name,
                assignedCount: assignedStudents.length,
                completedCount: completedStudents.length,
                pendingCount: assignedStudents.length - completedStudents.length,
                completionRate: assignedStudents.length > 0 ? 
                    (completedStudents.length / assignedStudents.length * 100).toFixed(1) : 0,
                feedbackCount
            };
        });
    }

    /**
     * Get student breakdown by category and status
     */
    getStudentBreakdown() {
        const breakdown = {
            byCategory: {},
            byStatus: {},
            byStaff: {}
        };

        // Category breakdown
        this.students.forEach(student => {
            breakdown.byCategory[student.category] = (breakdown.byCategory[student.category] || 0) + 1;
        });

        // Status breakdown
        this.students.forEach(student => {
            breakdown.byStatus[student.status] = (breakdown.byStatus[student.status] || 0) + 1;
        });

        // Staff breakdown
        this.students.forEach(student => {
            if (student.assignedStaff) {
                let staffName = 'Unknown';
                if (window.authManager) {
                    const staff = window.authManager.getUsersByRole('staff').find(s => s.id === student.assignedStaff);
                    staffName = staff?.name || 'Unknown';
                } else {
                    staffName = this.staff.find(s => s.id === student.assignedStaff)?.name || 'Unknown';
                }
                breakdown.byStaff[staffName] = (breakdown.byStaff[staffName] || 0) + 1;
            }
        });

        return breakdown;
    }

    /**
     * Export data to CSV format
     */
    exportToCSV(data, filename) {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Clear all data (for testing/reset purposes)
     */
    clearAllData() {
        this.students = [];
        this.staff = [];
        this.feedback = [];
        this.saveToStorage();
    }

    /**
     * Search students by various criteria
     */
    searchStudents(query, filters = {}) {
        let results = [...this.students];
        
        // Text search
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(student => 
                student.name.toLowerCase().includes(searchTerm) ||
                student.phone.includes(searchTerm) ||
                student.rank.toString().includes(searchTerm)
            );
        }
        
        // Apply filters
        if (filters.category) {
            results = results.filter(s => s.category === filters.category);
        }
        
        if (filters.status) {
            results = results.filter(s => s.status === filters.status);
        }
        
        if (filters.staffId) {
            results = results.filter(s => s.assignedStaff === filters.staffId);
        }
        
        if (filters.isSpecial !== undefined) {
            results = results.filter(s => s.isSpecial === filters.isSpecial);
        }
        
        return results;
    }
}

// Create global instance
window.dataManager = new DataManager();
