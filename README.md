# EAMCET Student Management Portal

A clean, structured web platform for managing EAMCET student follow-up processes with separate admin and staff panels.

## Features

### Admin Panel
- **Dataset Management**: Upload CSV or XLSX files with student data
- **Staff Assignment**: Auto-allocate students equally among staff or manual assignment
- **Special Students**: Assign high-performing students to top staff members
- **Reports**: Generate comprehensive reports and analytics
- **Data Export**: Export student data to CSV format
- **Feedback Management**: View and manage staff feedback

### Staff Panel
- **Student Viewing**: View assigned students with all relevant details
- **Feedback Submission**: Submit call status and detailed remarks
- **Quick Actions**: Quick status updates with one-click buttons
- **Reports**: Generate and send performance reports to admin
- **Data Export**: Export personal student data

### General Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Data Persistence**: Uses localStorage for data storage
- **Clean UI**: Modern, intuitive interface with Tailwind CSS
- **No Backend Required**: Fully client-side application
- **Keyboard Shortcuts**: Quick navigation with Ctrl/Cmd + 1/2/H

## File Structure

```
eamcet-portal/
├── index.html              # Main application file
├── styles.css              # Custom CSS styles
├── js/
│   ├── app.js              # Main application logic and navigation
│   ├── dataManager.js      # Data management and localStorage operations
│   ├── adminPanel.js       # Admin panel functionality
│   └── staffPanel.js       # Staff panel functionality
└── README.md               # Project documentation
```

## Getting Started

1. **Clone or Download** the project files
2. **Open** `index.html` in a web browser
3. **Start Using** the portal immediately

No installation or setup required!

## Usage

### Admin Panel
1. Click "Admin Panel" or use Ctrl/Cmd + 1
2. Upload student datasets using CSV or Excel files
3. Assign students to staff (auto or manual)
4. Generate reports and view analytics
5. Export data as needed

### Staff Panel
1. Click "Staff Panel" or use Ctrl/Cmd + 2
2. Select your staff profile from dropdown
3. View assigned students
4. Update student status and add feedback
5. Generate performance reports

### Data Format
Upload files with columns:
- Name/Student Name
- Phone/Contact Number
- Rank/EAMCET Rank
- Category/Caste

## Keyboard Shortcuts

- `Ctrl/Cmd + 1`: Switch to Admin Panel
- `Ctrl/Cmd + 2`: Switch to Staff Panel
- `Ctrl/Cmd + H`: Return to Welcome/Home

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Data Storage

All data is stored locally in the browser's localStorage. Data persists between sessions but is specific to each browser/device.

### Data Backup
- Use the export functionality to backup data
- Data can be imported from exported JSON files
- Reset option available for testing

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: No frameworks, pure JS
- **SheetJS**: For Excel file processing
- **Font Awesome**: Icons

### Key Components
- **DataManager**: Handles all data operations and persistence
- **AdminPanel**: Manages admin-specific functionality
- **StaffPanel**: Handles staff operations and feedback
- **App**: Main application controller and navigation

## Sample Data

The application includes sample data for demonstration:
- 5 sample students with different categories and ranks
- 5 staff members for assignment
- Various status examples

## Customization

### Adding New Staff
Edit the `createDefaultStaff()` method in `dataManager.js`

### Modifying Status Options
Update the status options in both admin and staff panels

### Styling Changes
Modify `styles.css` or add Tailwind classes directly

## Troubleshooting

### File Upload Issues
- Ensure file format is CSV, XLSX, or XLS
- Check column headers match expected format
- Verify file is not corrupted

### Data Not Persisting
- Check browser localStorage is enabled
- Clear browser cache and try again
- Ensure sufficient storage space

### Performance Issues
- Large datasets (1000+ students) may slow down the interface
- Consider pagination for very large datasets

## Future Enhancements

Potential improvements for future versions:
- Server-side backend integration
- Real-time notifications
- Advanced analytics and charts
- Multi-language support
- Mobile app version
- Advanced filtering and search
- Email integration for reports

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all files are present and accessible
3. Test with different browsers
4. Clear browser data and restart

## License

This project is open source and available under the MIT License.

---

**Note**: This is a client-side application designed for demonstration and small-scale use. For production environments with multiple users, consider implementing a proper backend solution with database storage and user authentication.
