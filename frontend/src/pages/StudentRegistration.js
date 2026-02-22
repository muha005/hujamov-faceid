import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Camera, CheckCircle, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    classGrade: '',
    classSubsection: '',
    shift: '',
  });
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

  const grades = [5, 6, 7, 8, 9, 10, 11];
  const subsections = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё'];

  useEffect(() => {
    loadModels();
    return () => {
      stopVideo();
    };
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Error loading face recognition models');
    }
  };

  const startVideo = () => {
    if (videoStarted) return;
    
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setVideoStarted(true);
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        toast.error('Cannot access camera');
      });
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      setVideoStarted(false);
    }
  };

  const handleCapture = async () => {
    if (!modelsLoaded || !videoRef.current || capturing) return;

    setCapturing(true);

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error(language === 'ky' ? 'Жүз табылган жок' : 'Лицо не обнаружено');
        setCapturing(false);
        return;
      }

      setFaceDescriptor(Array.from(detection.descriptor));
      toast.success(t('faceCaptured'));
      stopVideo();
    } catch (error) {
      console.error('Capture error:', error);
      toast.error(t('error'));
    }

    setCapturing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.classGrade || !formData.classSubsection || !formData.shift) {
      toast.error(language === 'ky' ? 'Бардык талааларды толтуруңуз' : 'Заполните все поля');
      return;
    }

    if (!faceDescriptor) {
      toast.error(language === 'ky' ? 'Жүздү тартыңыз' : 'Захватите лицо');
      return;
    }

    setRegistering(true);

    try {
      await axios.post(`${API}/students`, {
        full_name: formData.fullName,
        class_grade: parseInt(formData.classGrade),
        class_subsection: formData.classSubsection,
        shift: formData.shift,
        face_descriptor: faceDescriptor,
      });

      toast.success(t('registrationSuccess'));
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t('error'));
      setRegistering(false);
    }
  };

  const handleRecapture = () => {
    setFaceDescriptor(null);
    startVideo();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4">
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

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-3">
            {t('studentRegistration')}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form */}
          <Card className="bg-white shadow-xl rounded-xl border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">
                {language === 'ky' ? 'Маалымат' : 'Информация'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                    {t('fullName')}
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-slate-50 border-slate-200"
                    data-testid="full-name-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classGrade" className="text-sm font-semibold text-slate-700">
                    {t('classGrade')}
                  </Label>
                  <Select value={formData.classGrade} onValueChange={(value) => setFormData({ ...formData, classGrade: value })}>
                    <SelectTrigger className="bg-slate-50 border-slate-200" data-testid="class-grade-select">
                      <SelectValue placeholder={language === 'ky' ? 'Талдоо' : 'Выбрать'} />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classSubsection" className="text-sm font-semibold text-slate-700">
                    {t('classSubsection')}
                  </Label>
                  <Select
                    value={formData.classSubsection}
                    onValueChange={(value) => setFormData({ ...formData, classSubsection: value })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200" data-testid="class-subsection-select">
                      <SelectValue placeholder={language === 'ky' ? 'Талдоо' : 'Выбрать'} />
                    </SelectTrigger>
                    <SelectContent>
                      {subsections.map((subsection) => (
                        <SelectItem key={subsection} value={subsection}>
                          {subsection}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift" className="text-sm font-semibold text-slate-700">
                    {t('selectShift')}
                  </Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value) => setFormData({ ...formData, shift: value })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200" data-testid="shift-select">
                      <SelectValue placeholder={language === 'ky' ? 'Сменаны тандаңыз' : 'Выберите смену'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">{t('morningShift')}</SelectItem>
                      <SelectItem value="afternoon">{t('afternoonShift')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold text-slate-700">{t('captureFace')}</Label>
                    {faceDescriptor ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{t('faceCaptured')}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">{t('faceNotCaptured')}</span>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={registering || !faceDescriptor}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-semibold"
                  data-testid="register-submit-btn"
                >
                  {registering ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t('registering')}
                    </>
                  ) : (
                    t('registerStudent')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Camera */}
          <Card className="bg-white shadow-xl rounded-xl border-slate-200">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">{t('captureFace')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!faceDescriptor ? (
                  <>
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover video-mirror"
                        data-testid="registration-video"
                      />
                      {!modelsLoaded && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center text-white space-y-3">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
                            <p className="text-sm font-medium">{t('loadingCamera')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {!videoStarted && modelsLoaded && (
                      <Button
                        onClick={startVideo}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-semibold"
                        data-testid="start-camera-btn"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        {language === 'ky' ? 'Камераны күйгүзүү' : 'Включить камеру'}
                      </Button>
                    )}
                    {videoStarted && (
                      <Button
                        onClick={handleCapture}
                        disabled={capturing || !modelsLoaded}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-semibold"
                        data-testid="capture-photo-btn"
                      >
                        {capturing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            {language === 'ky' ? 'Тартуу...' : 'Захват...'}
                          </>
                        ) : (
                          <>
                            <Camera className="h-5 w-5 mr-2" />
                            {t('capturePhoto')}
                          </>
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-green-900">{t('faceCaptured')}</p>
                    </div>
                    <Button
                      onClick={handleRecapture}
                      variant="outline"
                      className="w-full h-12 rounded-lg font-semibold border-2"
                      data-testid="recapture-btn"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      {t('recapture')}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
