import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Globe, ScanFace, UserPlus, Shield } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 relative overflow-hidden">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white"
          data-testid="language-toggle"
        >
          <Globe className="h-4 w-4 mr-2" />
          {language === 'ky' ? 'Русский' : 'Кыргызча'}
        </Button>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 max-w-4xl animate-fade-in">
          {/* School Logo/Name */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl mb-6">
              <ScanFace className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
              {t('schoolName')}
            </h1>
          </div>

          {/* Welcome Text */}
          <div className="space-y-3">
            <p className="text-2xl md:text-3xl font-semibold text-slate-800 font-heading">
              {t('welcomeTitle')}
            </p>
            <p className="text-lg text-slate-600 font-body max-w-2xl mx-auto">
              {t('welcomeSubtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <Button
              size="lg"
              onClick={() => navigate('/scan')}
              className="h-auto py-8 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex flex-col items-center gap-4"
              data-testid="scan-attendance-btn"
            >
              <ScanFace className="h-10 w-10" />
              <span className="text-lg font-semibold">{t('scanAttendance')}</span>
            </Button>

            <Button
              size="lg"
              onClick={() => navigate('/register')}
              variant="outline"
              className="h-auto py-8 px-6 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex flex-col items-center gap-4"
              data-testid="register-student-btn"
            >
              <UserPlus className="h-10 w-10 text-blue-600" />
              <span className="text-lg font-semibold text-slate-900">{t('registerStudent')}</span>
            </Button>

            <Button
              size="lg"
              onClick={() => navigate('/director/login')}
              variant="outline"
              className="h-auto py-8 px-6 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex flex-col items-center gap-4"
              data-testid="director-panel-btn"
            >
              <Shield className="h-10 w-10 text-blue-600" />
              <span className="text-lg font-semibold text-slate-900">{t('directorPanel')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
