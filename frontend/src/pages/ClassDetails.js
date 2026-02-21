import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ClassDetails = ({ onLogout }) => {
  const { grade, subsection } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassData();
  }, [grade, subsection]);

  const fetchClassData = async () => {
    try {
      const response = await axios.get(`${API}/attendance/class/${grade}/${subsection}`);
      setClassData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast.error(t('error'));
      setLoading(false);
    }
  };

  const getStatusBadge = (status, minutesLate) => {
    if (status === 'present') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200" data-testid="status-present">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('present')}
        </Badge>
      );
    } else if (status === 'late') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200" data-testid="status-late">
          <Clock className="h-3 w-3 mr-1" />
          {t('late')} ({minutesLate} {t('minutes')})
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200" data-testid="status-absent">
          <XCircle className="h-3 w-3 mr-1" />
          {t('absent')}
        </Badge>
      );
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString(language === 'ky' ? 'ky-KG' : 'ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Create a map of student attendance
  const attendanceMap = {};
  if (classData) {
    classData.attendance_records.forEach((record) => {
      attendanceMap[record.student_id] = record;
    });
  }

  // Get present, late, and absent counts
  const presentCount = classData?.attendance_records.filter((r) => r.status === 'present').length || 0;
  const lateCount = classData?.attendance_records.filter((r) => r.status === 'late').length || 0;
  const absentCount = classData?.attendance_records.filter((r) => r.status === 'absent').length || 0;

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
              <h1 className="text-3xl font-bold font-heading text-slate-900">
                {t('classDetails')}: {grade}-{subsection}
              </h1>
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="shadow-lg border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{t('totalStudents')}</p>
                      <p className="text-3xl font-bold text-slate-900 tabular-nums mt-1">
                        {classData?.total_students || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">{t('present')}</p>
                      <p className="text-3xl font-bold text-green-900 tabular-nums mt-1">{presentCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700">{t('late')}</p>
                      <p className="text-3xl font-bold text-yellow-900 tabular-nums mt-1">{lateCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">{t('absent')}</p>
                      <p className="text-3xl font-bold text-red-900 tabular-nums mt-1">{absentCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Students Table */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-heading">{t('todayAttendance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold text-slate-700">{t('studentName')}</TableHead>
                        <TableHead className="font-semibold text-slate-700">{t('status')}</TableHead>
                        <TableHead className="font-semibold text-slate-700">{t('scanTime')}</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">{t('minutesLate')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classData?.students && classData.students.length > 0 ? (
                        classData.students.map((student) => {
                          const attendance = attendanceMap[student.id];
                          return (
                            <TableRow key={student.id} data-testid={`student-row-${student.id}`}>
                              <TableCell className="font-medium text-slate-900">{student.full_name}</TableCell>
                              <TableCell>
                                {attendance
                                  ? getStatusBadge(attendance.status, attendance.minutes_late)
                                  : getStatusBadge('absent', 0)}
                              </TableCell>
                              <TableCell className="text-slate-600 tabular-nums">
                                {attendance ? formatTime(attendance.scan_time) : '-'}
                              </TableCell>
                              <TableCell className="text-right font-medium text-slate-900 tabular-nums">
                                {attendance && attendance.minutes_late > 0
                                  ? `${attendance.minutes_late} ${t('minutes')}`
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-600">
                            {t('noData')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassDetails;
