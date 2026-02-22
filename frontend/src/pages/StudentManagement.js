import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { ArrowLeft, Users, Trash2, LogOut } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentManagement = ({ onLogout }) => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const [registrationStats, setRegistrationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchRegistrationStats();
  }, []);

  const fetchRegistrationStats = async () => {
    try {
      const response = await axios.get(`${API}/students/registration-stats`);
      setRegistrationStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching registration stats:', error);
      toast.error(t('error'));
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    setDeleting(studentId);
    try {
      await axios.delete(`${API}/students/${studentId}`);
      toast.success(
        language === 'ky'
          ? `${studentName} өчүрүлдү`
          : `${studentName} удален`
      );
      // Refresh the data
      await fetchRegistrationStats();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error(t('error'));
    }
    setDeleting(null);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const getShiftBadge = (shift) => {
    if (shift === 'morning') {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
          {t('morning')}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
          {t('afternoon')}
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/director/dashboard')}
                className="border-slate-200"
                data-testid="back-dashboard-btn"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToDashboard')}
              </Button>
              <h1 className="text-3xl font-bold font-heading text-slate-900">{t('studentManagement')}</h1>
            </div>
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
            {/* Summary Card */}
            <Card className="shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">{t('totalRegistered')}</p>
                      <p className="text-4xl font-bold text-slate-900 tabular-nums">
                        {registrationStats?.total_registered || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-600">
                      {language === 'ky' ? 'Класстар' : 'Классов'}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 tabular-nums">
                      {registrationStats?.classes?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class-wise Registration Tables */}
            {registrationStats?.classes && registrationStats.classes.length > 0 ? (
              registrationStats.classes.map((classData) => (
                <Card key={classData.class_name} className="shadow-lg">
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl font-heading text-slate-900">
                          {classData.class_name}
                        </CardTitle>
                        {getShiftBadge(classData.shift)}
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-lg px-4 py-2">
                        {classData.registered_count} {t('registeredStudents')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-semibold text-slate-700">{t('studentName')}</TableHead>
                            <TableHead className="font-semibold text-slate-700">{t('shift')}</TableHead>
                            <TableHead className="font-semibold text-slate-700">{t('registeredAt')}</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">{t('actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classData.students.map((student) => (
                            <TableRow key={student.id} data-testid={`student-row-${student.id}`}>
                              <TableCell className="font-medium text-slate-900">{student.full_name}</TableCell>
                              <TableCell>{getShiftBadge(classData.shift)}</TableCell>
                              <TableCell className="text-slate-600 tabular-nums">
                                {student.registered_at
                                  ? new Date(student.registered_at).toLocaleString(
                                      language === 'ky' ? 'ky-KG' : 'ru-RU',
                                      {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      }
                                    )
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      disabled={deleting === student.id}
                                      data-testid={`delete-btn-${student.id}`}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t('deleteStudent')}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {language === 'ky'
                                          ? `${student.full_name} окуучусунун бүткүл маалыматы өчүрүлөт. Бул аракетти кайтаруу мүмкүн эмес.`
                                          : `Все данные ученика ${student.full_name} будут удалены. Это действие необратимо.`}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteStudent(student.id, student.full_name)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {t('deleteConfirm')}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-lg">
                <CardContent className="py-12 text-center">
                  <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg text-slate-600">{t('noData')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentManagement;
