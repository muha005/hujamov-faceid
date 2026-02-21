import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Sound effects using Web Audio API
const playSound = (frequency, type = 'success') => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === 'success') {
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } else {
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }
};

const ScanStation = () => {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadModels();
    fetchStudents();
    startVideo();

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

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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
    }
  };

  const handleScan = async () => {
    if (!modelsLoaded || !videoRef.current || scanning) return;

    setScanning(true);
    setScanResult(null);

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error(t('notStudent'));
        playSound(200, 'error');
        setScanResult({ success: false, message: t('notStudent') });
        setScanning(false);
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      // Find matching student
      const faceDescriptor = Array.from(detection.descriptor);
      let matchedStudent = null;
      let minDistance = Infinity;

      students.forEach((student) => {
        const distance = faceapi.euclideanDistance(faceDescriptor, student.face_descriptor);
        if (distance < minDistance) {
          minDistance = distance;
          matchedStudent = student;
        }
      });

      const threshold = 0.6;
      if (minDistance > threshold || !matchedStudent) {
        toast.error(t('notStudent'));
        playSound(200, 'error');
        setScanResult({ success: false, message: t('notStudent') });
        setScanning(false);
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      // Record attendance
      try {
        const response = await axios.post(`${API}/attendance/scan`, {
          student_id: matchedStudent.id,
          face_descriptor: faceDescriptor,
        });

        playSound(800, 'success');
        setScanResult({
          success: true,
          message: `${response.data.student_name}, ${response.data.class}`,
          status: response.data.status,
          minutesLate: response.data.minutes_late,
        });
        toast.success(t('success'));
      } catch (error) {
        if (error.response?.status === 400) {
          toast.warning(t('alreadyScanned'));
          playSound(200, 'error');
          setScanResult({ success: false, message: t('alreadyScanned') });
        } else {
          toast.error(t('error'));
          playSound(200, 'error');
          setScanResult({ success: false, message: t('error') });
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(t('error'));
      playSound(200, 'error');
      setScanResult({ success: false, message: t('error') });
    }

    setScanning(false);
    setTimeout(() => setScanResult(null), 5000);
  };

  useEffect(() => {
    if (modelsLoaded && videoRef.current) {
      const interval = setInterval(() => {
        if (!scanning && !scanResult) {
          handleScan();
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [modelsLoaded, scanning, scanResult, students]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
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
      <div className="absolute top-6 left-6 z-20">
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900">
            {t('attendanceScanning')}
          </h1>
          <p className="text-lg text-slate-600">{t('scanYourFace')}</p>
        </div>

        {/* Video Container */}
        <div className="relative">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              width="640"
              height="480"
              className="video-mirror bg-black"
              data-testid="scan-video"
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0" />

            {/* Loading Overlay */}
            {!modelsLoaded && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white space-y-3">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto" />
                  <p className="text-lg font-medium">{t('loadingCamera')}</p>
                </div>
              </div>
            )}

            {/* Scanning Indicator */}
            {scanning && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-semibold">{t('scanning')}</span>
              </div>
            )}

            {/* Result Overlay */}
            {scanResult && (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-scale-in ${
                  scanResult.success ? '' : 'animate-shake'
                }`}
              >
                <div className="text-center space-y-6">
                  {scanResult.success ? (
                    <>
                      <CheckCircle className="h-32 w-32 text-green-400 mx-auto drop-shadow-2xl" data-testid="success-icon" />
                      <div className="space-y-2">
                        <p className="text-3xl font-bold text-white font-heading">{scanResult.message}</p>
                        {scanResult.minutesLate > 0 && (
                          <p className="text-xl text-yellow-300">
                            {t('late')}: {scanResult.minutesLate} {t('minutes')}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-32 w-32 text-red-400 mx-auto drop-shadow-2xl" data-testid="error-icon" />
                      <p className="text-3xl font-bold text-white font-heading">{scanResult.message}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanStation;
