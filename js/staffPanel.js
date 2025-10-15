/**
 * Staff Panel - Handles staff-specific functionality
 */

class StaffPanel {
    constructor() {
        this.currentStaffId = null;
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for staff panel
     */
    initializeEventListeners() {
        // Submit feedback button
        document.getElementById('submit-feedback-btn')?.addEventListener('click', () => {
            this.showFeedbackModal();
        });

        // Preview report button
        document.getElementById('preview-report-btn')?.addEventListener('click', () => {
            this.previewReport();
        });

        // Send report button
        document.getElementById('send-report-btn')?.addEventListener('click', () => {
            this.sendReport();
        });

        // Export buttons
        document.getElementById('export-my-students-btn')?.addEventListener('click', () => {
            this.exportMyStudents();
        });

        document.getElementById('export-feedback-btn')?.addEventListener('click', () => {
            this.exportMyFeedback();
        });

        // Report preview modal close buttons
        document.getElementById('close-preview-modal')?.addEventListener('click', () => {
            this.closeModal('report-preview-modal');
        });

        // Send report from preview
        document.getElementById('send-report-btn')?.addEventListener('click', () => {
            this.sendReportFromPreview();
        });

        // Click outside modal to close
        document.getElementById('report-preview-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'report-preview-modal') {
                this.closeModal('report-preview-modal');
            }
        });

        // Feedback modal close buttons
        document.getElementById('close-feedback-modal')?.addEventListener('click', () => {
            this.closeModal('feedback-modal');
        });

        document.getElementById('cancel-feedback')?.addEventListener('click', () => {
            this.closeModal('feedback-modal');
        });

        // Feedback form submission
        document.getElementById('feedback-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        // Click outside modal to close
        document.getElementById('feedback-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'feedback-modal') {
                this.closeModal('feedback-modal');
            }
        });
    }

    /**
     * Show staff panel
     */
    show() {
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('admin-section').classList.add('hidden');
        document.getElementById('staff-section').classList.remove('hidden');
        
        // Set current staff ID from authenticated user
        const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
        if (currentUser && currentUser.role === 'staff') {
            this.currentStaffId = currentUser.id;
        }
        
        this.updateStaffStats();
        this.renderStaffStudentTable();
    }

    /**
     * Update staff statistics
     */
    updateStaffStats() {
        if (!this.currentStaffId) return;
        
        const myStudents = dataManager.getStudentsByStaff(this.currentStaffId);
        const pendingStudents = myStudents.filter(s => s.status === 'pending');
        const completedStudents = myStudents.filter(s => s.status !== 'pending');
        const completionRate = myStudents.length > 0 ? (completedStudents.length / myStudents.length * 100).toFixed(1) : 0;
        
        document.getElementById('my-students-count').textContent = myStudents.length;
        document.getElementById('my-pending-count').textContent = pendingStudents.length;
        document.getElementById('my-completed-count').textContent = completedStudents.length;
        document.getElementById('my-assigned-count').textContent = myStudents.length;
        document.getElementById('my-completion-rate').textContent = completionRate + '%';
    }

    /**
     * Render staff student table
     */
    renderStaffStudentTable() {
        const tableBody = document.getElementById('staff-student-table');
        const myStudents = dataManager.getStudentsByStaff(this.currentStaffId);
        
        if (myStudents.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-user-friends text-4xl mb-4"></i>
                        <p class="text-lg font-medium">No students assigned</p>
                        <p class="text-sm">Contact admin to get student assignments</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = myStudents.map(student => {
            const statusClass = this.getStatusClass(student.status);
            const studentFeedback = dataManager.feedback.filter(f => f.studentId === student.id).pop();
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div>
                                <div class="text-sm font-medium text-gray-900">${student.name}</div>
                                ${student.isSpecial ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Special</span>' : ''}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.phone}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.rank}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.category}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                            ${this.capitalizeFirst(student.status)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs">
                        <div class="truncate" title="${studentFeedback?.remarks || 'No feedback yet'}">
                            ${studentFeedback?.remarks || 'No feedback yet'}
                        </div>
                        ${studentFeedback ? `<div class="text-xs text-gray-400">${new Date(studentFeedback.timestamp).toLocaleDateString()}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="staffPanel.quickUpdateStatus(${student.id}, 'contacted')" 
                                    class="text-blue-600 hover:text-blue-900" title="Mark as Contacted">
                                <i class="fas fa-phone"></i>
                            </button>
                            <button onclick="staffPanel.quickUpdateStatus(${student.id}, 'interested')" 
                                    class="text-green-600 hover:text-green-900" title="Mark as Interested">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="staffPanel.quickUpdateStatus(${student.id}, 'not-interested')" 
                                    class="text-red-600 hover:text-red-900" title="Mark as Not Interested">
                                <i class="fas fa-times"></i>
                            </button>
                            <button onclick="staffPanel.showFeedbackModal(${student.id})" 
                                    class="text-purple-600 hover:text-purple-900" title="Add Feedback">
                                <i class="fas fa-comment"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Get status CSS class
     */
    getStatusClass(status) {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'contacted': 'bg-blue-100 text-blue-800',
            'interested': 'bg-green-100 text-green-800',
            'not-interested': 'bg-red-100 text-red-800',
            'not-reachable': 'bg-gray-100 text-gray-800',
            'call-back': 'bg-purple-100 text-purple-800'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
    }

    /**
     * Quick update student status
     */
    quickUpdateStatus(studentId, status) {
        const student = dataManager.students.find(s => s.id === studentId);
        if (!student) return;

        // Update student status
        dataManager.updateStudent(studentId, { status });
        
        // Add basic feedback
        const remarks = this.getDefaultRemarks(status);
        dataManager.addFeedback(studentId, this.currentStaffId, status, remarks);
        
        this.showMessage(`Student status updated to ${this.capitalizeFirst(status)}`, 'success');
        
        // Update display
        this.updateStaffStats();
        this.renderStaffStudentTable();
    }

    /**
     * Get default remarks for status
     */
    getDefaultRemarks(status) {
        const defaultRemarks = {
            'contacted': 'Student contacted successfully',
            'interested': 'Student showed interest in the program',
            'not-interested': 'Student not interested',
            'not-reachable': 'Could not reach student',
            'call-back': 'Student requested to call back later'
        };
        return defaultRemarks[status] || 'Status updated';
    }

    /**
     * Show feedback modal
     */
    showFeedbackModal(studentId = null) {
        const modal = document.getElementById('feedback-modal');
        const studentSelect = document.getElementById('feedback-student');
        
        // Populate student dropdown
        const myStudents = dataManager.getStudentsByStaff(this.currentStaffId);
        studentSelect.innerHTML = myStudents.map(student => 
            `<option value="${student.id}" ${studentId === student.id ? 'selected' : ''}>${student.name} (Rank: ${student.rank})</option>`
        ).join('');

        // Reset form
        document.getElementById('feedback-form').reset();
        if (studentId) {
            studentSelect.value = studentId;
        }

        // Set current status if student is pre-selected
        if (studentId) {
            const student = dataManager.students.find(s => s.id === studentId);
            if (student) {
                document.getElementById('feedback-status').value = student.status;
            }
        }

        this.showModal('feedback-modal');
    }

    /**
     * Submit feedback
     */
    submitFeedback() {
        const studentId = parseInt(document.getElementById('feedback-student').value);
        const status = document.getElementById('feedback-status').value;
        const remarks = document.getElementById('feedback-remarks').value.trim();

        if (!studentId || !status) {
            this.showMessage('Please select a student and status', 'error');
            return;
        }

        if (!remarks) {
            this.showMessage('Please provide remarks', 'error');
            return;
        }

        // Add feedback
        dataManager.addFeedback(studentId, this.currentStaffId, status, remarks);
        
        this.showMessage('Feedback submitted successfully!', 'success');
        this.closeModal('feedback-modal');
        
        // Update display
        this.updateStaffStats();
        this.renderStaffStudentTable();
    }

    /**
     * Preview report before sending
     */
    previewReport() {
        // Ensure currentStaffId is set
        if (!this.currentStaffId) {
            const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
            if (currentUser && currentUser.role === 'staff') {
                this.currentStaffId = currentUser.id;
            } else {
                this.showMessage('Unable to identify staff member', 'error');
                return;
            }
        }

        const myStudents = dataManager.getStudentsByStaff(this.currentStaffId);
        const completedStudents = myStudents.filter(s => s.status !== 'pending');
        const pendingStudents = myStudents.filter(s => s.status === 'pending');
        const myFeedback = dataManager.feedback.filter(f => f.staffId === this.currentStaffId);
        
        if (myStudents.length === 0) {
            this.showMessage('No students assigned to generate report', 'error');
            return;
        }

        // Create report content
        const reportContent = this.generateReportContent(myStudents, completedStudents, pendingStudents, myFeedback);
        
        // Show in preview modal
        const previewContent = document.getElementById('report-preview-content');
        if (previewContent) {
            previewContent.innerHTML = reportContent;
            this.showModal('report-preview-modal');
        } else {
            this.showMessage('Preview modal not found', 'error');
        }
    }

    /**
     * Generate report content
     */
    generateReportContent(myStudents, completedStudents, pendingStudents, myFeedback) {
        const completionRate = myStudents.length > 0 ? (completedStudents.length / myStudents.length * 100).toFixed(1) : 0;
        const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
        
        return `
            <div class="space-y-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Staff Performance Report</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">${myStudents.length}</div>
                            <div class="text-sm text-gray-600">Total Assigned</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">${completedStudents.length}</div>
                            <div class="text-sm text-gray-600">Completed</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-600">${pendingStudents.length}</div>
                            <div class="text-sm text-gray-600">Pending</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-purple-600">${completionRate}%</div>
                            <div class="text-sm text-gray-600">Completion Rate</div>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Student Status Breakdown</h4>
                    <div class="space-y-2">
                        ${this.getStatusBreakdown(myStudents).map(item => `
                            <div class="flex justify-between items-center p-2 bg-white rounded">
                                <span class="font-medium">${item.status}</span>
                                <span class="text-lg font-bold text-gray-700">${item.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Recent Activity</h4>
                    <div class="space-y-2">
                        ${myFeedback.slice(-5).map(feedback => {
                            const student = dataManager.students.find(s => s.id === feedback.studentId);
                            return `
                                <div class="p-2 bg-white rounded text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">${student?.name || 'Unknown'}</span>
                                        <span class="text-gray-500">${new Date(feedback.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div class="text-gray-600">${feedback.remarks}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Summary</h4>
                    <div class="text-gray-700 space-y-2">
                        <p><strong>Staff Member:</strong> ${currentUser?.name || 'Unknown'}</p>
                        <p><strong>Role:</strong> ${currentUser?.role || 'Staff Member'}</p>
                        <p><strong>Completion Rate:</strong> ${completionRate}%</p>
                        <p><strong>Total Feedback Entries:</strong> ${myFeedback.length}</p>
                        <p><strong>Special Students:</strong> ${myStudents.filter(s => s.isSpecial).length}</p>
                        <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Send report from preview modal
     */
    sendReportFromPreview() {
        this.closeModal('report-preview-modal');
        this.showMessage('Report sent to admin successfully!', 'success');
        
        // Add to admin notifications (in a real app, this would be an API call)
        const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
        
        notifications.push({
            id: Date.now(),
            type: 'report',
            from: currentUser?.name || 'Staff Member',
            message: 'New performance report received',
            timestamp: new Date().toISOString(),
            read: false
        });
        
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }

    /**
     * Send report to admin
     */
    sendReport() {
        const myStudents = dataManager.getStudentsByStaff(this.currentStaffId);
        const completedStudents = myStudents.filter(s => s.status !== 'pending');
        const pendingStudents = myStudents.filter(s => s.status === 'pending');
        const myFeedback = dataManager.feedback.filter(f => f.staffId === this.currentStaffId);
        
        if (myStudents.length === 0) {
            this.showMessage('No students assigned to generate report', 'error');
            return;
        }

        // Create report content
        const reportContent = `
            <div class="space-y-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Staff Performance Report</h4>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">${myStudents.length}</div>
                            <div class="text-sm text-gray-600">Total Assigned</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">${completedStudents.length}</div>
                            <div class="text-sm text-gray-600">Completed</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-600">${pendingStudents.length}</div>
                            <div class="text-sm text-gray-600">Pending</div>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Student Status Breakdown</h4>
                    <div class="space-y-2">
                        ${this.getStatusBreakdown(myStudents).map(item => `
                            <div class="flex justify-between items-center p-2 bg-white rounded">
                                <span class="font-medium">${item.status}</span>
                                <span class="text-lg font-bold text-gray-700">${item.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Recent Activity</h4>
                    <div class="space-y-2">
                        ${myFeedback.slice(-5).map(feedback => {
                            const student = dataManager.students.find(s => s.id === feedback.studentId);
                            return `
                                <div class="p-2 bg-white rounded text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">${student?.name || 'Unknown'}</span>
                                        <span class="text-gray-500">${new Date(feedback.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div class="text-gray-600">${feedback.remarks}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Summary</h4>
                    <p class="text-gray-700">
                        Completion Rate: ${myStudents.length > 0 ? (completedStudents.length / myStudents.length * 100).toFixed(1) : 0}%
                        <br>
                        Total Feedback Entries: ${myFeedback.length}
                        <br>
                        Special Students: ${myStudents.filter(s => s.isSpecial).length}
                    </p>
                </div>
            </div>
        `;

        // Show report in modal
        document.getElementById('report-content').innerHTML = reportContent;
        document.getElementById('modal-title').textContent = 'Staff Report';
        this.showModal('report-modal');
        
        // Simulate sending to admin (in real app, this would be an API call)
        setTimeout(() => {
            this.showMessage('Report sent to admin successfully!', 'success');
        }, 1000);
    }

    /**
     * Get status breakdown for students
     */
    getStatusBreakdown(students) {
        const breakdown = {};
        students.forEach(student => {
            breakdown[student.status] = (breakdown[student.status] || 0) + 1;
        });

        return Object.entries(breakdown).map(([status, count]) => ({
            status: this.capitalizeFirst(status),
            count
        }));
    }

    /**
     * Export my students data
     */
    exportMyStudents() {
        const myStudents = dataManager.getStudentsByStaff(this.currentStaffId);
        
        if (myStudents.length === 0) {
            this.showMessage('No students to export', 'error');
            return;
        }

        const exportData = myStudents.map(student => {
            const feedback = dataManager.feedback.filter(f => f.studentId === student.id).pop();
            return {
                'Student Name': student.name,
                'Phone': student.phone,
                'EAMCET Rank': student.rank,
                'Category': student.category,
                'Status': student.status,
                'Last Feedback': feedback?.remarks || 'No feedback',
                'Last Updated': feedback ? new Date(feedback.timestamp).toLocaleDateString() : 'Never'
            };
        });

        dataManager.exportToCSV(exportData, `my_students_${new Date().toISOString().split('T')[0]}.csv`);
        this.showMessage('Student data exported successfully!', 'success');
    }

    /**
     * Set current staff ID (for demo purposes)
     */
    setStaffId(staffId) {
        this.currentStaffId = staffId;
        this.updateStaffStats();
        this.renderStaffStudentTable();
    }

    /**
     * Quick bulk update for multiple students
     */
    quickBulkUpdate(status) {
        const myStudents = dataManager.getStudentsByStaff(this.currentStaffId);
        const pendingStudents = myStudents.filter(s => s.status === 'pending');
        
        if (pendingStudents.length === 0) {
            this.showMessage('No pending students to update', 'info');
            return;
        }

        if (confirm(`Are you sure you want to mark ${pendingStudents.length} students as ${status.replace('-', ' ')}?`)) {
            let updatedCount = 0;
            pendingStudents.forEach(student => {
                dataManager.updateStudent(student.id, { status });
                const remarks = this.getDefaultRemarks(status);
                dataManager.addFeedback(student.id, this.currentStaffId, status, remarks);
                updatedCount++;
            });

            this.showMessage(`${updatedCount} students updated successfully!`, 'success');
            this.updateStaffStats();
            this.renderStaffStudentTable();
        }
    }

    /**
     * Export my students data
     */
    exportMyStudents() {
        const myStudents = dataManager.getStudentsByStaff(this.currentStaffId);
        const includePending = document.getElementById('include-pending')?.checked ?? true;
        const includeFeedback = document.getElementById('include-feedback')?.checked ?? true;
        
        let studentsToExport = myStudents;
        if (!includePending) {
            studentsToExport = myStudents.filter(s => s.status !== 'pending');
        }

        if (studentsToExport.length === 0) {
            this.showMessage('No students to export', 'error');
            return;
        }

        const exportData = studentsToExport.map(student => {
            const feedback = includeFeedback ? 
                dataManager.feedback.filter(f => f.studentId === student.id).pop() : null;
            
            return {
                'Student Name': student.name,
                'Phone': student.phone,
                'EAMCET Rank': student.rank,
                'Category': student.category,
                'Status': student.status,
                'Special Student': student.isSpecial ? 'Yes' : 'No',
                'Last Feedback': feedback?.remarks || 'No feedback',
                'Last Updated': feedback ? new Date(feedback.timestamp).toLocaleDateString() : 'Never',
                'Assigned Date': student.uploadDate
            };
        });

        const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
        const filename = `my_students_${currentUser?.name?.replace(' ', '_') || 'staff'}_${new Date().toISOString().split('T')[0]}.csv`;
        
        dataManager.exportToCSV(exportData, filename);
        this.showMessage('Student data exported successfully!', 'success');
    }

    /**
     * Export my feedback data
     */
    exportMyFeedback() {
        const myFeedback = dataManager.feedback.filter(f => f.staffId === this.currentStaffId);
        
        if (myFeedback.length === 0) {
            this.showMessage('No feedback to export', 'error');
            return;
        }

        const exportData = myFeedback.map(feedback => {
            const student = dataManager.students.find(s => s.id === feedback.studentId);
            return {
                'Student Name': student?.name || 'Unknown',
                'Student Rank': student?.rank || 'N/A',
                'Student Category': student?.category || 'N/A',
                'Feedback Status': feedback.status,
                'Remarks': feedback.remarks,
                'Date': new Date(feedback.timestamp).toLocaleDateString(),
                'Time': new Date(feedback.timestamp).toLocaleTimeString()
            };
        });

        const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
        const filename = `feedback_${currentUser?.name?.replace(' ', '_') || 'staff'}_${new Date().toISOString().split('T')[0]}.csv`;
        
        dataManager.exportToCSV(exportData, filename);
        this.showMessage('Feedback data exported successfully!', 'success');
    }

    /**
     * Show modal
     */
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    /**
     * Close modal
     */
    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    /**
     * Show message
     */
    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
            type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
        }`;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
}

// Create global instance
window.staffPanel = new StaffPanel();
