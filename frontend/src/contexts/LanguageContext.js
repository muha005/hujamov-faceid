import React, { createContext, useContext, useState } from 'react';

const translations = {
  ky: {
    // Home Page
    schoolName: 'Режап Кужамов атындагы орто мектеп',
    welcomeTitle: 'Катышууну башкаруу системасына кош келиңиз',
    welcomeSubtitle: 'Жүз таануу менен автоматташтырылган катышууну эсепке алуу',
    scanAttendance: 'Катышууну скандоо',
    registerStudent: 'Окуучуну катто',
    directorPanel: 'Директор панели',
    
    // Scan Station
    attendanceScanning: 'Катышуу скандалууда',
    scanYourFace: 'Өзүңүздүн жүзүңүздү сканданыз',
    scanning: 'Скандалууда...',
    loadingCamera: 'Камера жүктөлүүдө...',
    success: 'Ийгиликтүү!',
    alreadyScanned: 'Сиз бүгүн эле скандадыңыз',
    notStudent: 'Сиз окуучу эмессиз',
    error: 'Ката',
    tooEarly: 'Сабагыңыз али башталган жок',
    shiftStartsAt: 'Сабактар башталат',
    
    // Registration
    studentRegistration: 'Окуучуну катто',
    teacherRegistration: 'Мугалимди катто',
    selectRole: 'Ролду тандаңыз',
    student: 'Окуучу',
    teacher: 'Мугалим',
    subject: 'Сабак',
    fullName: 'Толук аты',
    classGrade: 'Класс',
    classSubsection: 'Бөлүм',
    selectShift: 'Сменаны тандаңыз',
    morningShift: 'Эртеңки смена (08:00)',
    afternoonShift: 'Түштөн кийинки смена (13:00)',
    captureFace: 'Жүздү тартуу',
    faceNotCaptured: 'Жүз тартылган жок',
    faceCaptured: 'Жүз тартылды',
    capturePhoto: 'Сүрөт тартуу',
    recapture: 'Кайра тартуу',
    registerStudent: 'Окуучуну катто',
    registering: 'Каттоо...',
    registrationSuccess: 'Окуучу ийгиликтүү катталды!',
    
    // Director Dashboard
    directorDashboard: 'Директор панели',
    logout: 'Чыгуу',
    weeklyOverview: 'Жума жыйынтыгы',
    classOfWeek: 'Жуманын мыктысы',
    todayAttendance: 'Бүгүнкү катышуу',
    classAttendance: 'Класс катышуусу',
    exportReport: 'Отчет алуу',
    totalStudents: 'Жалпы окуучулар',
    present: 'Келген',
    late: 'Кечикти',
    absent: 'Келген жок',
    attendanceRate: 'Катышуу деңгээли',
    avgLateness: 'Орточо кечигүү',
    minutes: 'мүнөт',
    viewDetails: 'Толук көрүү',
    noData: 'Маалымат жок',
    studentManagement: 'Окуучуларды башкаруу',
    teacherManagement: 'Мугалимдерди башкаруу',
    registrationStats: 'Каттоо статистикасы',
    totalTeachers: 'Бардыгы мугалимдер',
    welcomeTeacher: 'Кош келиңиз',
    youAreTeacher: 'Сиз',
    
    // Director Login
    directorLogin: 'Директор кирүүсү',
    username: 'Колдонуучу аты',
    password: 'Сырсөз',
    login: 'Кирүү',
    loggingIn: 'Кирүү...',
    
    // Class Details
    classDetails: 'Класс маалыматы',
    backToDashboard: 'Панелге кайтуу',
    studentName: 'Окуучунун аты',
    status: 'Абалы',
    scanTime: 'Скандоо убактысы',
    minutesLate: 'Кечигүү (мүн)',
    
    // Student Management
    registeredStudents: 'Катталган окуучулар',
    totalRegistered: 'Бардыгы катталды',
    registeredAt: 'Катталган убакыт',
    actions: 'Аракеттер',
    deleteStudent: 'Окуучуну өчүрүү',
    confirmDelete: 'Чындап өчүргүңүз келеби?',
    deleteConfirm: 'Ооба, өчүрүү',
    cancel: 'Жокко чыгаруу',
    shift: 'Смена',
    morning: 'Эртең',
    afternoon: 'Түштөн кийин',
  },
  ru: {
    // Home Page
    schoolName: 'Средняя школа имени Режапа Кужамова',
    welcomeTitle: 'Добро пожаловать в систему учета посещаемости',
    welcomeSubtitle: 'Автоматизированный учет посещаемости с распознаванием лиц',
    scanAttendance: 'Сканировать посещаемость',
    registerStudent: 'Регистрация ученика',
    directorPanel: 'Панель директора',
    
    // Scan Station
    attendanceScanning: 'Сканирование посещаемости',
    scanYourFace: 'Отсканируйте ваше лицо',
    scanning: 'Сканирование...',
    loadingCamera: 'Загрузка камеры...',
    success: 'Успешно!',
    alreadyScanned: 'Вы уже отсканировали сегодня',
    notStudent: 'Вы не являетесь учеником',
    error: 'Ошибка',
    tooEarly: 'Ваши занятия еще не начались',
    shiftStartsAt: 'Занятия начинаются в',
    
    // Registration
    studentRegistration: 'Регистрация ученика',
    fullName: 'Полное имя',
    classGrade: 'Класс',
    classSubsection: 'Подгруппа',
    selectShift: 'Выберите смену',
    morningShift: 'Утренняя смена (08:00)',
    afternoonShift: 'Дневная смена (13:00)',
    captureFace: 'Захват лица',
    faceNotCaptured: 'Лицо не захвачено',
    faceCaptured: 'Лицо захвачено',
    capturePhoto: 'Сделать фото',
    recapture: 'Переснять',
    registerStudent: 'Зарегистрировать',
    registering: 'Регистрация...',
    registrationSuccess: 'Ученик успешно зарегистрирован!',
    
    // Director Dashboard
    directorDashboard: 'Панель директора',
    logout: 'Выйти',
    weeklyOverview: 'Еженедельный обзор',
    classOfWeek: 'Класс недели',
    todayAttendance: 'Сегодняшняя посещаемость',
    classAttendance: 'Посещаемость классов',
    exportReport: 'Экспорт отчета',
    totalStudents: 'Всего учеников',
    present: 'Присутствует',
    late: 'Опоздал',
    absent: 'Отсутствует',
    attendanceRate: 'Уровень посещаемости',
    avgLateness: 'Средн. опоздание',
    minutes: 'мин',
    viewDetails: 'Подробнее',
    noData: 'Нет данных',
    studentManagement: 'Управление учениками',
    registrationStats: 'Статистика регистрации',
    
    // Director Login
    directorLogin: 'Вход директора',
    username: 'Имя пользователя',
    password: 'Пароль',
    login: 'Войти',
    loggingIn: 'Вход...',
    
    // Class Details
    classDetails: 'Детали класса',
    backToDashboard: 'Назад к панели',
    studentName: 'Имя ученика',
    status: 'Статус',
    scanTime: 'Время сканирования',
    minutesLate: 'Опоздание (мин)',
    
    // Student Management
    registeredStudents: 'Зарегистрированные ученики',
    totalRegistered: 'Всего зарегистрировано',
    registeredAt: 'Зарегистрирован',
    actions: 'Действия',
    deleteStudent: 'Удалить ученика',
    confirmDelete: 'Вы уверены, что хотите удалить?',
    deleteConfirm: 'Да, удалить',
    cancel: 'Отмена',
    shift: 'Смена',
    morning: 'Утро',
    afternoon: 'День',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ky');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ky' ? 'ru' : 'ky');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
