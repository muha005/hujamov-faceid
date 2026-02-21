import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DirectorLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      toast.error(language === 'ky' ? 'Бардык талааларды толтуруңуз' : 'Заполните все поля');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/auth/director/login`, credentials);
      toast.success(language === 'ky' ? 'Кирүү ийгиликтүү!' : 'Вход успешен!');
      onLogin();
      navigate('/director/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        toast.error(language === 'ky' ? 'Ката маалымат' : 'Неверные данные');
      } else {
        toast.error(t('error'));
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 relative overflow-hidden flex items-center justify-center px-4">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white"
          data-testid="language-toggle"
        >
          {language === 'ky' ? 'Русский' : 'Кыргызча'}
        </Button>
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white"
          data-testid="back-home-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'ky' ? 'Башкы бет' : 'Главная'}
        </Button>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl border-slate-200 relative z-10">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mx-auto">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold font-heading text-slate-900">
            {t('directorLogin')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                {t('username')}
              </Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="bg-slate-50 border-slate-200 h-12"
                data-testid="username-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                {t('password')}
              </Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="bg-slate-50 border-slate-200 h-12"
                data-testid="password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-semibold mt-6"
              data-testid="login-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {t('loggingIn')}
                </>
              ) : (
                t('login')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectorLogin;
