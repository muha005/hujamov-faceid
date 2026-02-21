import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LogOut, Download, Trophy, TrendingUp, Users, Clock, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DirectorDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const [weeklyData, setWeeklyData] = useState([]);
  const [classOfWeek, setClassOfWeek] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, classOfWeekRes] = await Promise.all([
        axios.get(`${API}/analytics/weekly`),
        axios.get(`${API}/analytics/class-of-week`),
      ]);

      setWeeklyData(analyticsRes.data);
      setClassOfWeek(classOfWeekRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(t('error'));
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API}/export/weekly`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'weekly_attendance_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(language === 'ky' ? 'Отчет жүктөлдү' : 'Отчет загружен');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('error'));
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const chartData = weeklyData.map((cls) => ({
    name: cls.class_name,
    [келген]: cls.total_present,
    [кечикти]: cls.total_late,
    [келген жок]: cls.total_absent,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-heading text-slate-900">{t('directorDashboard')}</h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="border-slate-200"
                data-testid="language-toggle"
              >
                {language === 'ky' ? 'Русский' : 'Кыргызча'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-200"
                data-testid="logout-btn"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">{language === 'ky' ? 'Жүктөлүүдө...' : 'Загрузка...'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Export Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="export-report-btn"
              >
                <Download className="h-5 w-5 mr-2" />
                {t('exportReport')}
              </Button>
            </div>

            {/* Class of the Week */}
            {classOfWeek && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-heading text-slate-900">{t('classOfWeek')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold font-heading text-slate-900 mb-2">
                        {classOfWeek.class_name}
                      </p>
                      <p className="text-lg text-slate-700">
                        {t('attendanceRate')}: <span className="font-bold">{classOfWeek.attendance_rate}%</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">{t('avgLateness')}</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {Math.round(classOfWeek.total_lateness_minutes / (classOfWeek.total_late || 1))} {t('minutes')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-heading">{t('weeklyOverview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '14px', fontWeight: '500' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '14px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="келген" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="кечикти" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="келген жок" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weeklyData.map((classData) => (
                <Card
                  key={classData.class_name}
                  className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-slate-200"
                  onClick={() => navigate(`/director/class/${classData.grade}/${classData.subsection}`)}
                  data-testid={`class-card-${classData.class_name}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-heading text-slate-900">
                      {classData.class_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="h-5 w-5" />
                          <span className="text-sm font-medium">{t('totalStudents')}</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900 tabular-nums">
                          {classData.total_students}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-green-700 font-medium mb-1">{t('present')}</p>
                          <p className="text-xl font-bold text-green-900 tabular-nums">{classData.total_present}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-yellow-700 font-medium mb-1">{t('late')}</p>
                          <p className="text-xl font-bold text-yellow-900 tabular-nums">{classData.total_late}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-red-700 font-medium mb-1">{t('absent')}</p>
                          <p className="text-xl font-bold text-red-900 tabular-nums">{classData.total_absent}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">{t('attendanceRate')}</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600 tabular-nums">
                          {classData.attendance_rate}%
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                        data-testid={`view-details-${classData.class_name}`}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {weeklyData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-slate-600">{t('noData')}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DirectorDashboard;
