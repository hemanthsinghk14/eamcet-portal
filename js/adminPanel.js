/**
 * Admin Panel - Handles admin-specific functionality
 */

class AdminPanel {
    constructor() {
        this.currentView = 'admin';
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for admin panel
     */
    initializeEventListeners() {
        // File upload
        document.getElementById('upload-btn')?.addEventListener('click', () => {
            document.getElementById('dataset-upload').click();
        });

        document.getElementById('dataset-upload')?.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        // Staff assignment
        document.getElementById('assign-staff-btn')?.addEventListener('click', () => {
            this.handleStaffAssignment();
        });

        // Report preview
        document.getElementById('preview-report-btn')?.addEventListener('click', () => {
            this.previewReport();
        });

        // Data export
        document.getElementById('export-data-btn')?.addEventListener('click', () => {
            this.exportData();
        });

        // Export report
        document.getElementById('export-report-btn')?.addEventListener('click', () => {
            this.exportReport();
        });

        // View feedback
        document.getElementById('view-feedback-btn')?.addEventListener('click', () => {
            this.viewFeedback();
        });

        // Modal close buttons
        document.getElementById('close-report-modal')?.addEventListener('click', () => {
            this.closeModal('report-modal');
        });

        document.getElementById('close-admin-preview-modal')?.addEventListener('click', () => {
            this.closeModal('admin-report-preview-modal');
        });

        document.getElementById('export-from-preview-btn')?.addEventListener('click', () => {
            this.exportReportFromPreview();
        });

        // Click outside modal to close
        document.getElementById('report-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'report-modal') {
                this.closeModal('report-modal');
            }
        });
    }

    /**
     * Show admin panel
     */
    show() {
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('staff-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        
        this.updateDashboardStats();
        this.renderStudentTable();
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats() {
        const stats = dataManager.getStatistics();
        
        document.getElementById('total-students').textContent = stats.totalStudents;
        document.getElementById('active-staff').textContent = stats.activeStaff;
        document.getElementById('pending-calls').textContent = stats.pendingStudents;
        document.getElementById('completed-calls').textContent = stats.completedStudents;
        
        // Update panel stats
        const unassignedCount = dataManager.students.filter(s => !s.assignedStaff).length;
        const assignedCount = dataManager.students.filter(s => s.assignedStaff).length;
        const completionRate = stats.totalStudents > 0 ? (stats.completedStudents / stats.totalStudents * 100).toFixed(1) : 0;
        
        document.getElementById('unassigned-count').textContent = unassignedCount;
        document.getElementById('assigned-count').textContent = assignedCount;
        document.getElementById('completion-rate').textContent = completionRate + '%';
        document.getElementById('active-staff-count').textContent = stats.activeStaff;
    }

    /**
     * Handle file upload
     */
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileType = file.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
            this.showMessage('Please upload a valid CSV or Excel file.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let jsonData;
                
                if (fileType === 'csv') {
                    jsonData = this.parseCSV(e.target.result);
                } else {
                    // Handle Excel files
                    const workbook = XLSX.read(e.target.result, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    jsonData = XLSX.utils.sheet_to_json(worksheet);
                }

                if (jsonData.length === 0) {
                    this.showMessage('The file appears to be empty.', 'error');
                    return;
                }

                // Validate and transform data
                const students = this.validateAndTransformData(jsonData);
                if (students.length === 0) {
                    this.showMessage('No valid student data found. Please check your file format.', 'error');
                    return;
                }

                // Add students to data manager
                const addedCount = dataManager.addStudents(students);
                this.showMessage(`${addedCount} students uploaded successfully!`, 'success');
                
                // Update the display
                this.updateDashboardStats();
                this.renderStudentTable();
                
            } catch (error) {
                console.error('Error processing file:', error);
                this.showMessage('Error processing file. Please try again.', 'error');
            }
        };

        reader.readAsArrayBuffer(file);
    }

    /**
     * Parse CSV content
     */
    parseCSV(csvContent) {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row = {};
                headers.forEach((header, index) => {
                    row[header.toLowerCase()] = values[index] || '';
                });
                data.push(row);
            }
        }

        return data;
    }

    /**
     * Validate and transform uploaded data
     */
    validateAndTransformData(jsonData) {
        const validStudents = [];
        
        jsonData.forEach((row, index) => {
            // Check for required fields (flexible column names)
            const name = row.name || row.Name || row.student_name || row['Student Name'];
            const phone = row.phone || row.Phone || row.contact || row['Contact Number'];
            const rank = row.rank || row.Rank || row.eamcet_rank || row['EAMCET Rank'];
            const category = row.category || row.Category || row.caste || row['Category'];

            if (name && phone && rank && category) {
                validStudents.push({
                    name: name.toString().trim(),
                    phone: phone.toString().trim(),
                    rank: parseInt(rank) || 0,
                    category: category.toString().trim()
                });
            }
        });

        return validStudents;
    }

    /**
     * Handle staff assignment
     */
    handleStaffAssignment() {
        const assignmentType = document.getElementById('assignment-type').value;
        let assignedCount = 0;

        if (assignmentType === 'auto') {
            assignedCount = dataManager.autoAssignStudents();
            this.showMessage(`${assignedCount} students assigned automatically to staff.`, 'success');
        } else if (assignmentType === 'special') {
            const specialStudents = dataManager.students.filter(s => s.isSpecial && !s.assignedStaff);
            const topStaff = dataManager.getTopPerformingStaff();
            
            if (specialStudents.length === 0) {
                this.showMessage('No unassigned special students found.', 'warning');
                return;
            }
            
            if (topStaff.length === 0) {
                this.showMessage('No staff with performance data available for special assignment.', 'warning');
                return;
            }
            
            // Show special assignment interface
            this.showSpecialAssignmentInterface(specialStudents, topStaff);
            return;
        } else {
            // For manual assignment, show assignment interface
            this.showManualAssignmentInterface();
            return;
        }

        this.updateDashboardStats();
        this.renderStudentTable();
    }

    /**
     * Show special assignment interface
     */
    showSpecialAssignmentInterface(specialStudents, topStaff) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
        modal.innerHTML = `
            <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Special Student Assignment</h3>
                        <button id="close-special-assignment" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-medium text-gray-900 mb-3">Special Students (${specialStudents.length})</h4>
                            <div class="space-y-2 max-h-64 overflow-y-auto">
                                ${specialStudents.map(student => `
                                    <div class="p-3 border rounded-lg bg-yellow-50">
                                        <div class="font-medium">${student.name}</div>
                                        <div class="text-sm text-gray-600">Rank: ${student.rank} | ${student.category}</div>
                                        <div class="text-sm text-gray-600">Phone: ${student.phone}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-medium text-gray-900 mb-3">Top Performing Staff</h4>
                            <div class="space-y-2">
                                ${topStaff.map((staff, index) => `
                                    <div class="p-3 border rounded-lg bg-green-50">
                                        <div class="flex justify-between items-center">
                                            <div>
                                                <div class="font-medium">${staff.name}</div>
                                                <div class="text-sm text-gray-600">Completion Rate: ${Math.round(staff.completionRate)}%</div>
                                                <div class="text-sm text-gray-600">Completed: ${staff.completedCount}/${staff.assignedCount}</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-sm font-medium text-green-600">#${index + 1}</div>
                                                <button onclick="adminPanel.assignSpecialToStaff(${staff.id})" 
                                                        class="mt-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                                    Assign All
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h5 class="font-medium text-blue-900 mb-2">Assignment Strategy</h5>
                        <p class="text-sm text-blue-800">
                            Special students will be assigned to the selected top-performing staff member. 
                            This ensures high-priority students receive the best service.
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle close
        document.getElementById('close-special-assignment').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Handle click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * Assign all special students to a specific staff member
     */
    assignSpecialToStaff(staffId) {
        const specialStudents = dataManager.students.filter(s => s.isSpecial && !s.assignedStaff);
        let assignedCount = 0;

        specialStudents.forEach(student => {
            student.assignedStaff = staffId;
            assignedCount++;
        });

        dataManager.saveToStorage();
        this.updateDashboardStats();
        this.renderStudentTable();
        
        const staff = window.authManager ? 
            window.authManager.getUsersByRole('staff').find(s => s.id === staffId) : 
            dataManager.staff.find(s => s.id === staffId);
        
        this.showMessage(`${assignedCount} special students assigned to ${staff?.name || 'selected staff'}.`, 'success');
        
        // Close the modal
        const modal = document.querySelector('.fixed.inset-0.bg-gray-600');
        if (modal) {
            document.body.removeChild(modal);
        }
    }

    /**
     * Show manual assignment interface
     */
    showManualAssignmentInterface() {
        // Create a simple modal for manual assignment
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full';
        modal.id = 'assignment-modal';
        
        const unassignedStudents = dataManager.students.filter(s => !s.assignedStaff);
        const activeStaff = window.authManager ? 
            window.authManager.getUsersByRole('staff') : 
            dataManager.staff.filter(s => s.isActive);
        
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Manual Staff Assignment</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="space-y-4">
                        ${unassignedStudents.map(student => `
                            <div class="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <span class="font-medium">${student.name}</span>
                                    <span class="text-gray-500 ml-2">(${student.rank} - ${student.category})</span>
                                </div>
                                <select class="border rounded px-2 py-1" data-student-id="${student.id}">
                                    <option value="">Select Staff</option>
                                    ${activeStaff.map(staff => `
                                        <option value="${staff.id}">${staff.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button onclick="this.closest('.fixed').remove()" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors">
                            Cancel
                        </button>
                        <button onclick="adminPanel.applyManualAssignments()" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                            Apply Assignments
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Apply manual assignments
     */
    applyManualAssignments() {
        const modal = document.getElementById('assignment-modal');
        const selects = modal.querySelectorAll('select[data-student-id]');
        let assignedCount = 0;

        selects.forEach(select => {
            const studentId = parseInt(select.dataset.studentId);
            const staffId = parseInt(select.value);
            
            if (staffId) {
                if (dataManager.assignStudentToStaff(studentId, staffId)) {
                    assignedCount++;
                }
            }
        });

        this.showMessage(`${assignedCount} students assigned manually.`, 'success');
        modal.remove();
        
        this.updateDashboardStats();
        this.renderStudentTable();
    }

    /**
     * Preview comprehensive report
     */
    previewReport() {
        const report = dataManager.generateReport();
        const reportContent = document.getElementById('admin-report-preview-content');
        
        reportContent.innerHTML = this.generateAdminReportContent(report);
        this.showModal('admin-report-preview-modal');
    }

    /**
     * Generate admin report content for preview
     */
    generateAdminReportContent(report) {
        const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
        
        return `
            <div class="space-y-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">EAMCET Student Management Report</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">${report.statistics.totalStudents}</div>
                            <div class="text-sm text-gray-600">Total Students</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">${report.statistics.assignedStudents}</div>
                            <div class="text-sm text-gray-600">Assigned</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-600">${report.statistics.pendingStudents}</div>
                            <div class="text-sm text-gray-600">Pending</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-purple-600">${report.statistics.completedStudents}</div>
                            <div class="text-sm text-gray-600">Completed</div>
                        </div>
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Completion Rate:</span>
                            <span class="font-semibold text-green-600">${report.statistics.completionRate}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Assignment Rate:</span>
                            <span class="font-semibold text-blue-600">${report.statistics.assignmentRate}%</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Staff Performance</h4>
                    <div class="space-y-2">
                        ${report.staffPerformance.map(staff => `
                            <div class="flex justify-between items-center p-3 bg-white rounded">
                                <div>
                                    <span class="font-medium">${staff.staffName}</span>
                                    <div class="text-xs text-gray-500">
                                        Assigned: ${staff.assignedCount} | Completed: ${staff.completedCount} | Pending: ${staff.pendingCount}
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-semibold text-green-600">${staff.completionRate}%</div>
                                    <div class="text-xs text-gray-500">${staff.feedbackCount} feedback</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Student Breakdown</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h5 class="font-medium mb-2">By Category</h5>
                            ${Object.entries(report.studentBreakdown.byCategory).map(([category, count]) => `
                                <div class="flex justify-between text-sm">
                                    <span>${category}:</span>
                                    <span class="font-semibold">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div>
                            <h5 class="font-medium mb-2">By Status</h5>
                            ${Object.entries(report.studentBreakdown.byStatus).map(([status, count]) => `
                                <div class="flex justify-between text-sm">
                                    <span>${status}:</span>
                                    <span class="font-semibold">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Recent Feedback</h4>
                    <div class="space-y-2">
                        ${report.feedback.slice(-5).map(feedback => {
                            const student = dataManager.students.find(s => s.id === feedback.studentId);
                            const staff = window.authManager ? 
                                window.authManager.getUsersByRole('staff').find(s => s.id === feedback.staffId) : 
                                dataManager.staff.find(s => s.id === feedback.staffId);
                            return `
                                <div class="p-2 bg-white rounded text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">${student?.name || 'Unknown'}</span>
                                        <span class="text-gray-500">${new Date(feedback.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div class="text-gray-600">${feedback.remarks}</div>
                                    <div class="text-xs text-gray-500">Staff: ${staff?.name || 'Unknown'} | Status: ${feedback.status}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Report Summary</h4>
                    <div class="text-gray-700 space-y-2">
                        <p><strong>Generated By:</strong> ${currentUser?.name || 'Admin'}</p>
                        <p><strong>Generated Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Active Staff:</strong> ${report.statistics.activeStaff}</p>
                        <p><strong>Special Students:</strong> ${report.statistics.specialStudents}</p>
                        <p><strong>Total Feedback Entries:</strong> ${report.feedback.length}</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Export report from preview
     */
    exportReportFromPreview() {
        this.closeModal('admin-report-preview-modal');
        this.exportReport();
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const report = dataManager.generateReport();
        const reportContent = document.getElementById('report-content');
        
        reportContent.innerHTML = `
            <div class="space-y-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Summary Statistics</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">${report.statistics.totalStudents}</div>
                            <div class="text-sm text-gray-600">Total Students</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">${report.statistics.assignedStudents}</div>
                            <div class="text-sm text-gray-600">Assigned</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-600">${report.statistics.pendingStudents}</div>
                            <div class="text-sm text-gray-600">Pending</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-purple-600">${report.statistics.completedStudents}</div>
                            <div class="text-sm text-gray-600">Completed</div>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Staff Performance</h4>
                    <div class="space-y-2">
                        ${report.staffPerformance.map(staff => `
                            <div class="flex justify-between items-center p-2 bg-white rounded">
                                <span class="font-medium">${staff.staffName}</span>
                                <div class="flex space-x-4 text-sm">
                                    <span>Assigned: ${staff.assignedCount}</span>
                                    <span>Completed: ${staff.completedCount}</span>
                                    <span class="font-semibold text-green-600">${staff.completionRate}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-2">Recent Feedback</h4>
                    <div class="space-y-2">
                        ${report.feedback.length > 0 ? report.feedback.map(feedback => `
                            <div class="p-2 bg-white rounded text-sm">
                                <div class="flex justify-between">
                                    <span class="font-medium">Student ID: ${feedback.studentId}</span>
                                    <span class="text-gray-500">${new Date(feedback.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div class="text-gray-600">${feedback.remarks}</div>
                            </div>
                        `).join('') : '<p class="text-gray-500">No feedback available</p>'}
                    </div>
                </div>
            </div>
        `;

        this.showModal('report-modal');
    }

    /**
     * Export data to CSV
     */
    exportData() {
        const exportData = dataManager.students.map(student => {
            let assignedStaff = 'Unassigned';
            if (student.assignedStaff) {
                if (window.authManager) {
                    const staff = window.authManager.getUsersByRole('staff').find(s => s.id === student.assignedStaff);
                    assignedStaff = staff?.name || 'Unknown';
                } else {
                    assignedStaff = dataManager.staff.find(s => s.id === student.assignedStaff)?.name || 'Unassigned';
                }
            }
            
            return {
                'Student Name': student.name,
                'Phone': student.phone,
                'EAMCET Rank': student.rank,
                'Category': student.category,
                'Status': student.status,
                'Assigned Staff': assignedStaff,
                'Upload Date': student.uploadDate,
                'Special Student': student.isSpecial ? 'Yes' : 'No'
            };
        });

        dataManager.exportToCSV(exportData, 'eamcet_students_export.csv');
        this.showMessage('Data exported successfully!', 'success');
    }

    /**
     * Export comprehensive live report
     */
    exportReport() {
        const report = dataManager.generateReport();
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Create comprehensive report data
        const reportData = [
            {
                'Report Type': 'EAMCET Student Management Report',
                'Generated Date': currentDate,
                'Generated By': window.authManager ? window.authManager.getCurrentUser()?.name || 'Admin' : 'Admin',
                'Total Students': report.statistics.totalStudents,
                'Assigned Students': report.statistics.assignedStudents,
                'Pending Students': report.statistics.pendingStudents,
                'Completed Students': report.statistics.completedStudents,
                'Active Staff': report.statistics.activeStaff,
                'Completion Rate': report.statistics.completionRate + '%',
                'Assignment Rate': report.statistics.assignmentRate + '%'
            }
        ];

        // Add staff performance data
        report.staffPerformance.forEach(staff => {
            reportData.push({
                'Report Type': 'Staff Performance',
                'Staff Name': staff.staffName,
                'Students Assigned': staff.assignedCount,
                'Completed': staff.completedCount,
                'Pending': staff.pendingCount,
                'Completion Rate': staff.completionRate + '%',
                'Feedback Entries': staff.feedbackCount
            });
        });

        // Add recent feedback data
        report.feedback.slice(-10).forEach(feedback => {
            const student = dataManager.students.find(s => s.id === feedback.studentId);
            const staff = window.authManager ? 
                window.authManager.getUsersByRole('staff').find(s => s.id === feedback.staffId) : 
                dataManager.staff.find(s => s.id === feedback.staffId);
            
            reportData.push({
                'Report Type': 'Recent Feedback',
                'Student Name': student?.name || 'Unknown',
                'Staff Name': staff?.name || 'Unknown',
                'Status': feedback.status,
                'Remarks': feedback.remarks,
                'Date': new Date(feedback.timestamp).toLocaleDateString(),
                'Time': new Date(feedback.timestamp).toLocaleTimeString()
            });
        });

        dataManager.exportToCSV(reportData, `eamcet_live_report_${currentDate}.csv`);
        this.showMessage('Live report exported successfully!', 'success');
    }

    /**
     * View feedback
     */
    viewFeedback() {
        const feedback = dataManager.feedback;
        const reportContent = document.getElementById('report-content');
        
        if (feedback.length === 0) {
            reportContent.innerHTML = '<p class="text-gray-500 text-center py-8">No feedback available yet.</p>';
        } else {
            reportContent.innerHTML = `
                <div class="space-y-4">
                    ${feedback.map(fb => {
                        const student = dataManager.students.find(s => s.id === fb.studentId);
                        const staff = dataManager.staff.find(s => s.id === fb.staffId);
                        return `
                            <div class="border rounded-lg p-4">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <span class="font-medium">${student?.name || 'Unknown Student'}</span>
                                        <span class="text-gray-500 ml-2">(${student?.rank})</span>
                                    </div>
                                    <span class="text-sm text-gray-500">${new Date(fb.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div class="text-sm text-gray-600 mb-2">
                                    <span class="font-medium">Staff:</span> ${staff?.name || 'Unknown'}
                                    <span class="ml-4"><span class="font-medium">Status:</span> ${fb.status}</span>
                                </div>
                                <div class="text-gray-700">${fb.remarks}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        document.getElementById('modal-title').textContent = 'Staff Feedback';
        this.showModal('report-modal');
    }

    /**
     * Render student table
     */
    renderStudentTable() {
        const tableBody = document.getElementById('admin-student-table');
        const students = dataManager.students;
        
        if (students.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-inbox text-4xl mb-4"></i>
                        <p class="text-lg font-medium">No students found</p>
                        <p class="text-sm">Upload a dataset to get started</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = students.map(student => {
            let assignedStaff = 'Unassigned';
            if (student.assignedStaff) {
                if (window.authManager) {
                    const staff = window.authManager.getUsersByRole('staff').find(s => s.id === student.assignedStaff);
                    assignedStaff = staff?.name || 'Unknown';
                } else {
                    assignedStaff = dataManager.staff.find(s => s.id === student.assignedStaff)?.name || 'Unknown';
                }
            }
            
            const statusClass = this.getStatusClass(student.status);
            
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
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assignedStaff}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                            ${this.capitalizeFirst(student.status)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="adminPanel.editStudent(${student.id})" class="text-indigo-600 hover:text-indigo-900 mr-2" title="Edit Student">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminPanel.markSpecial(${student.id})" class="text-yellow-600 hover:text-yellow-900 mr-2" title="${student.isSpecial ? 'Remove Special' : 'Mark as Special'}">
                            <i class="fas fa-star"></i>
                        </button>
                        <button onclick="adminPanel.deleteStudent(${student.id})" class="text-red-600 hover:text-red-900" title="Delete Student">
                            <i class="fas fa-trash"></i>
                        </button>
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
     * Edit student
     */
    editStudent(studentId) {
        const student = dataManager.students.find(s => s.id === studentId);
        if (!student) return;

        // Create edit modal content
        const editModal = document.createElement('div');
        editModal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
        editModal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Student Details</h3>
                    <form id="edit-student-form">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Student Name</label>
                                <input type="text" id="edit-name" value="${student.name}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" id="edit-phone" value="${student.phone}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">EAMCET Rank</label>
                                <input type="number" id="edit-rank" value="${student.rank}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Category</label>
                                <select id="edit-category" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="general" ${student.category === 'general' ? 'selected' : ''}>General</option>
                                    <option value="sc" ${student.category === 'sc' ? 'selected' : ''}>SC</option>
                                    <option value="st" ${student.category === 'st' ? 'selected' : ''}>ST</option>
                                    <option value="obc" ${student.category === 'obc' ? 'selected' : ''}>OBC</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <select id="edit-status" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="pending" ${student.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="contacted" ${student.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                                    <option value="interested" ${student.status === 'interested' ? 'selected' : ''}>Interested</option>
                                    <option value="not_interested" ${student.status === 'not_interested' ? 'selected' : ''}>Not Interested</option>
                                    <option value="enrolled" ${student.status === 'enrolled' ? 'selected' : ''}>Enrolled</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" id="cancel-edit" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(editModal);

        // Handle form submission
        document.getElementById('edit-student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updatedStudent = {
                ...student,
                name: document.getElementById('edit-name').value.trim(),
                phone: document.getElementById('edit-phone').value.trim(),
                rank: parseInt(document.getElementById('edit-rank').value),
                category: document.getElementById('edit-category').value,
                status: document.getElementById('edit-status').value
            };

            if (!updatedStudent.name || !updatedStudent.phone) {
                this.showMessage('Name and phone are required', 'error');
                return;
            }

            // Update student in data manager
            const index = dataManager.students.findIndex(s => s.id === studentId);
            if (index !== -1) {
                dataManager.students[index] = updatedStudent;
                dataManager.saveToStorage();
                this.renderStudentTable();
                this.updateDashboardStats();
                this.showMessage('Student updated successfully', 'success');
            }

            document.body.removeChild(editModal);
        });

        // Handle cancel
        document.getElementById('cancel-edit').addEventListener('click', () => {
            document.body.removeChild(editModal);
        });
    }

    /**
     * Mark/unmark student as special
     */
    markSpecial(studentId) {
        const student = dataManager.students.find(s => s.id === studentId);
        if (!student) return;

        student.isSpecial = !student.isSpecial;
        dataManager.saveToStorage();
        this.renderStudentTable();
        this.updateDashboardStats();
        
        const message = student.isSpecial ? 'Student marked as special' : 'Special status removed from student';
        this.showMessage(message, 'success');
    }

    /**
     * Delete student
     */
    deleteStudent(studentId) {
        if (confirm('Are you sure you want to delete this student?')) {
            if (dataManager.deleteStudent(studentId)) {
                this.updateDashboardStats();
                this.renderStudentTable();
                this.showMessage('Student deleted successfully!', 'success');
            }
        }
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
        const statusElement = document.getElementById('upload-status') || document.getElementById('assignment-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `text-sm font-medium text-center ${type === 'error' ? 'text-red-600' : 'text-green-600'}`;
            statusElement.classList.remove('hidden');
            
            setTimeout(() => {
                statusElement.classList.add('hidden');
            }, 5000);
        }
    }
}

// Create global instance
window.adminPanel = new AdminPanel();
