import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScanStation from './pages/ScanStation';
import StudentRegistration from './pages/StudentRegistration';
import DirectorLogin from './pages/DirectorLogin';
import DirectorDashboard from './pages/DirectorDashboard';
import ClassDetails from './pages/ClassDetails';
import StudentManagement from './pages/StudentManagement';
import { Toaster } from './components/ui/sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

function App() {
  const [isDirectorAuthenticated, setIsDirectorAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('director_authenticated');
    if (authStatus === 'true') {
      setIsDirectorAuthenticated(true);
    }
  }, []);

  const handleDirectorLogin = () => {
    setIsDirectorAuthenticated(true);
    localStorage.setItem('director_authenticated', 'true');
  };

  const handleDirectorLogout = () => {
    setIsDirectorAuthenticated(false);
    localStorage.removeItem('director_authenticated');
  };

  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan" element={<ScanStation />} />
            <Route path="/register" element={<StudentRegistration />} />
            <Route path="/director/login" element={<DirectorLogin onLogin={handleDirectorLogin} />} />
            <Route
              path="/director/dashboard"
              element={
                isDirectorAuthenticated ? (
                  <DirectorDashboard onLogout={handleDirectorLogout} />
                ) : (
                  <Navigate to="/director/login" />
                )
              }
            />
            <Route
              path="/director/class/:grade/:subsection"
              element={
                isDirectorAuthenticated ? (
                  <ClassDetails onLogout={handleDirectorLogout} />
                ) : (
                  <Navigate to="/director/login" />
                )
              }
            />
            <Route
              path="/director/students"
              element={
                isDirectorAuthenticated ? (
                  <StudentManagement onLogout={handleDirectorLogout} />
                ) : (
                  <Navigate to="/director/login" />
                )
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </div>
    </LanguageProvider>
  );
}

export default App;
