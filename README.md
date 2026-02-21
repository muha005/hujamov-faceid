# Rejap Khujamov School Attendance System

A comprehensive full-stack web application for automated school attendance management with face recognition technology.

## 🎯 Features

### Student Features
- **Face Recognition Registration**: Students can register with their face and details
- **Automated Attendance Scanning**: Real-time face recognition for attendance tracking
- **Visual & Audio Feedback**: Success/error indicators with sound effects
- **Daily Scan Limit**: One scan per student per day
- **Automatic Lateness Calculation**: Precise tracking of late arrivals

### Director Features
- **Comprehensive Dashboard**: Real-time analytics and statistics
- **Weekly Reports**: Class-wise attendance tracking
- **Class of the Week**: Automatic winner selection based on attendance
- **Excel Export**: Download weekly attendance reports
- **Class Details View**: Detailed student-by-student breakdown

### System Features
- **Dual Shift System**: 
  - Morning Shift (08:00): Classes 5, 8, 9, 10, 11
  - Afternoon Shift (13:00): Classes 6, 7
- **Auto-Absence Marking**: Automatic absent marking after 1-hour grace period
- **Strict Data Isolation**: Separate tracking for each class subsection (А, Б, В, Г, Д, Е, Ё)
- **Multilingual Support**: Kyrgyz and Russian languages
- **Modern UI/UX**: Clean, professional design with Manrope and Inter fonts

## 🚀 Getting Started

### Director Login Credentials
```
Username: director
Password: school2024
```

### Access Points
- **Homepage**: https://rejap-scanner.preview.emergentagent.com/
- **Student Registration**: /register
- **Attendance Scanning**: /scan
- **Director Login**: /director/login
- **Director Dashboard**: /director/dashboard

## 📋 Usage Guide

### For Students

#### 1. Registration
1. Navigate to the Registration page
2. Fill in your full name, class, and subsection
3. Click "Камераны күйгүзүү" (Enable Camera)
4. Position your face in the frame
5. Click "Сүрөт тартуу" (Capture Photo)
6. Click "Окуучуну катто" (Register Student)

#### 2. Daily Attendance
1. Navigate to the Scan Station
2. Look at the camera
3. The system will automatically recognize your face
4. You'll receive visual and audio feedback
5. Your attendance status will be recorded

### For Directors

#### 1. Login
1. Navigate to /director/login
2. Enter credentials (director / school2024)
3. Click "Кирүү" (Login)

#### 2. Dashboard
- View weekly overview chart
- See "Class of the Week" winner
- Monitor all class statistics
- Click on any class card to view details

#### 3. Export Reports
- Click "Отчет алуу" (Export Report) button
- Weekly attendance report will download as Excel file

## 🔧 System Logic

### Shift Assignment
Classes are automatically assigned to shifts:
- **Morning (08:00)**: Grades 5, 8, 9, 10, 11
- **Afternoon (13:00)**: Grades 6, 7

### Lateness Calculation
- Student scans before shift start: Status = "Present"
- Student scans after shift start: Status = "Late" + minutes calculated
- Student doesn't scan within 1 hour: Status = "Absent" (automatic)

### Auto-Absence Task
Runs at 09:05 and 14:05 daily:
- Checks all students in respective shift
- Marks unscanned students as absent
- Records in attendance database

### Face Recognition Threshold
- Euclidean distance threshold: 0.6
- Ensures strict face matching to prevent mix-ups
- Face descriptors are 128-dimensional vectors

---

Built with ❤️ for Rejap Khujamov Secondary School
