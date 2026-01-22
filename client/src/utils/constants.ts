/**
 * ثوابت التطبيق
 */

// أنواع المستخدمين
export const USER_ROLES = {
  ROOT: 'root',
  ADMIN: 'admin',
  PROFESSOR: 'professor',
  STUDENT: 'student',
  GUEST: 'guest',
} as const;

// أنواع التخصصات
export const DEPARTMENTS = {
  ELECTRICAL: {
    id: 'electrical',
    name: 'الهندسة الكهربائية',
    description: 'تخصص الكهرباء والإلكترونيات',
    color: '#2196F3',
    icon: '⚡',
  },
  CHEMICAL: {
    id: 'chemical',
    name: 'الهندسة الكيميائية',
    description: 'تخصص الكيمياء والعمليات الصناعية',
    color: '#4CAF50',
    icon: '🧪',
  },
  CIVIL: {
    id: 'civil',
    name: 'الهندسة المدنية',
    description: 'تخصص الإنشاءات والبنية التحتية',
    color: '#FF9800',
    icon: '🏗️',
  },
  MECHANICAL: {
    id: 'mechanical',
    name: 'الهندسة الميكانيكية',
    description: 'تخصص الميكانيكا والتصنيع',
    color: '#F44336',
    icon: '⚙️',
  },
  MEDICAL: {
    id: 'medical',
    name: 'الهندسة الطبية',
    description: 'تخصص الأجهزة الطبية والتقنيات الصحية',
    color: '#9C27B0',
    icon: '⚕️',
  },
} as const;

// السمسترات
export const SEMESTERS = Array.from({ length: 10 }, (_, i) => i + 1);

// أنواع الملفات
export const FILE_TYPES = {
  LECTURE: {
    id: 'lecture',
    name: 'محاضرة',
    icon: '📚',
    color: '#2196F3',
  },
  REFERENCE: {
    id: 'reference',
    name: 'مرجع',
    icon: '📖',
    color: '#4CAF50',
  },
  EXERCISES: {
    id: 'exercises',
    name: 'تمارين',
    icon: '📝',
    color: '#FF9800',
  },
  EXAM: {
    id: 'exam',
    name: 'امتحانات',
    icon: '📋',
    color: '#F44336',
  },
  OTHER: {
    id: 'other',
    name: 'أخرى',
    icon: '📎',
    color: '#9E9E9E',
  },
} as const;

// تصنيفات الملفات
export const FILE_CATEGORIES = [
  'نظري',
  'عملي',
  'مشاريع',
  'حلول',
  'ملخصات',
  'عروض تقديمية',
  'فيديوهات',
  'برامج',
  'نماذج',
  'أخرى',
];

// إعدادات الرفع
export const UPLOAD_SETTINGS = {
  MAX_FILE_SIZE: 150 * 1024 * 1024, // 150 ميجابايت
  MAX_IMAGE_SIZE: 3 * 1024 * 1024, // 3 ميجابايت
  ALLOWED_DOCUMENT_TYPES: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'],
  ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
  ALLOWED_ARCHIVE_TYPES: ['.zip', '.rar', '.7z'],
  ALLOWED_EXECUTABLE_TYPES: ['.exe'],
  ALLOWED_VIDEO_TYPES: ['.mp4', '.avi', '.mov', '.wmv'],
};

// إعدادات المنتدى
export const FORUM_SETTINGS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_IMAGES_PER_MESSAGE: 5,
  MAX_IMAGE_SIZE: 3 * 1024 * 1024, // 3 ميجابايت
  ALLOW_GUEST_VIEW: true,
  ALLOW_GUEST_POST: false,
  MODERATION_ENABLED: true,
};

// إعدادات الأمان
export const SECURITY_SETTINGS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 24 * 60 * 60 * 1000, // 24 ساعة
  SESSION_TIMEOUT: 60 * 60 * 1000, // ساعة واحدة
  GUEST_SESSION_TIMEOUT: 30 * 60 * 1000, // 30 دقيقة
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};

// روابط التنقل
export const NAVIGATION = {
  HOME: '/',
  LOGIN: '/login',
  DEPARTMENTS: '/departments',
  SEMESTERS: '/departments/:department',
  COURSES: '/departments/:department/semester/:semester',
  COURSE_DETAIL: '/courses/:id',
  FORUM: '/forum/:id',
  
  // لوحات التحكم
  STUDENT_DASHBOARD: '/student/dashboard',
  PROFESSOR_DASHBOARD: '/professor/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ROOT_DASHBOARD: '/admin/root',
  
  // الصفحات الأخرى
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP: '/help',
  ABOUT: '/about',
  CONTACT: '/contact',
};

// رسائل الأخطاء
export const ERROR_MESSAGES = {
  // أخطاء المصادقة
  AUTH_INVALID_CREDENTIALS: 'رقم الجامعي أو كلمة المرور غير صحيحة',
  AUTH_ACCOUNT_LOCKED: 'الحساب مؤقتاً. يرجى المحاولة لاحقاً أو الاتصال بالمشرف',
  AUTH_SESSION_EXPIRED: 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى',
  AUTH_UNAUTHORIZED: 'غير مصرح بالوصول',
  AUTH_FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذا المورد',
  
  // أخطاء الملفات
  FILE_TOO_LARGE: 'حجم الملف كبير جداً',
  FILE_TYPE_NOT_ALLOWED: 'نوع الملف غير مسموح',
  FILE_UPLOAD_FAILED: 'فشل رفع الملف',
  FILE_NOT_FOUND: 'الملف غير موجود',
  FILE_DOWNLOAD_FAILED: 'فشل تحميل الملف',
  
  // أخطاء المواد
  COURSE_NOT_FOUND: 'المادة غير موجودة',
  COURSE_ACCESS_DENIED: 'غير مصرح بالوصول إلى هذه المادة',
  COURSE_ALREADY_EXISTS: 'المادة موجودة بالفعل',
  
  // أخطاء عامة
  NETWORK_ERROR: 'خطأ في الاتصال بالخادم',
  SERVER_ERROR: 'حدث خطأ في الخادم',
  VALIDATION_ERROR: 'بيانات غير صالحة',
  NOT_FOUND: 'المورد غير موجود',
  UNKNOWN_ERROR: 'حدث خطأ غير معروف',
};

// رسائل النجاح
export const SUCCESS_MESSAGES = {
  // نجاحات المصادقة
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
  LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح',
  PASSWORD_CHANGED: 'تم تغيير كلمة المرور بنجاح',
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
  
  // نجاحات الملفات
  FILE_UPLOADED: 'تم رفع الملف بنجاح',
  FILE_DELETED: 'تم حذف الملف بنجاح',
  FILE_DOWNLOAD_STARTED: 'بدأ تحميل الملف',
  
  // نجاحات المواد
  COURSE_CREATED: 'تم إنشاء المادة بنجاح',
  COURSE_UPDATED: 'تم تحديث المادة بنجاح',
  COURSE_DELETED: 'تم حذف المادة بنجاح',
  
  // نجاحات المنتدى
  MESSAGE_SENT: 'تم إرسال الرسالة بنجاح',
  MESSAGE_DELETED: 'تم حذف الرسالة بنجاح',
  FORUM_CREATED: 'تم إنشاء المنتدى بنجاح',
  
  // نجاحات عامة
  OPERATION_SUCCESS: 'تمت العملية بنجاح',
  SETTINGS_SAVED: 'تم حفظ الإعدادات بنجاح',
  DATA_EXPORTED: 'تم تصدير البيانات بنجاح',
};

// إعدادات التطبيق
export const APP_CONFIG = {
  NAME: 'مكتبة كلية الهندسة - جامعة البحر الأحمر',
  VERSION: '1.0.0',
  DESCRIPTION: 'منصة رقمية لمكتبة كلية الهندسة تحتوي على المواد الدراسية والملفات التعليمية',
  COPYRIGHT: `© ${new Date().getFullYear()} كلية الهندسة - جامعة البحر الأحمر. جميع الحقوق محفوظة.`,
  SUPPORT_EMAIL: 'support@engineering-library.redseauniversity.edu',
  SUPPORT_PHONE: '+249123456789',
  
  // إعدادات API
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  API_TIMEOUT: 30000, // 30 ثانية
  
  // إعدادات التخزين
  TOKEN_STORAGE_KEY: 'token',
  USER_STORAGE_KEY: 'user',
  THEME_STORAGE_KEY: 'theme',
  LANGUAGE_STORAGE_KEY: 'language',
  
  // إعدادات التحديث
  AUTO_UPDATE_CHECK_INTERVAL: 5 * 60 * 1000, // 5 دقائق
  CACHE_DURATION: 60 * 60 * 1000, // ساعة واحدة
};

// الألوان الأساسية
export const COLORS = {
  PRIMARY: '#4A90E2', // أزرق سماوي
  PRIMARY_LIGHT: '#7BB4F0',
  PRIMARY_DARK: '#2C6BB7',
  
  SECONDARY: '#00BCD4', // فيروزي
  SECONDARY_LIGHT: '#5DDFF3',
  SECONDARY_DARK: '#008BA3',
  
  SUCCESS: '#4CAF50',
  SUCCESS_LIGHT: '#81C784',
  SUCCESS_DARK: '#388E3C',
  
  WARNING: '#FF9800',
  WARNING_LIGHT: '#FFB74D',
  WARNING_DARK: '#F57C00',
  
  ERROR: '#F44336',
  ERROR_LIGHT: '#E57373',
  ERROR_DARK: '#D32F2F',
  
  INFO: '#2196F3',
  INFO_LIGHT: '#64B5F6',
  INFO_DARK: '#1976D2',
  
  // ألوان التخصصات
  DEPARTMENT_ELECTRICAL: '#2196F3',
  DEPARTMENT_CHEMICAL: '#4CAF50',
  DEPARTMENT_CIVIL: '#FF9800',
  DEPARTMENT_MECHANICAL: '#F44336',
  DEPARTMENT_MEDICAL: '#9C27B0',
  
  // ألوان واجهة المستخدم
  BACKGROUND: '#F5F8FF',
  SURFACE: '#FFFFFF',
  BORDER: '#E0E0E0',
  TEXT_PRIMARY: '#1A237E',
  TEXT_SECONDARY: '#5C6BC0',
  TEXT_DISABLED: '#9E9E9E',
  
  // ألوان الوضع الداكن
  DARK_BACKGROUND: '#121212',
  DARK_SURFACE: '#1E1E1E',
  DARK_BORDER: '#333333',
  DARK_TEXT_PRIMARY: '#E0E0E0',
  DARK_TEXT_SECONDARY: '#B0B0B0',
};

// الأيقونات
export const ICONS = {
  // إجراءات عامة
  HOME: '🏠',
  BACK: '↩️',
  FORWARD: '↪️',
  REFRESH: '🔄',
  SEARCH: '🔍',
  SETTINGS: '⚙️',
  HELP: '❓',
  INFO: 'ℹ️',
  WARNING: '⚠️',
  ERROR: '❌',
  SUCCESS: '✅',
  CLOSE: '❎',
  MENU: '☰',
  
  // المستخدمين
  USER: '👤',
  USERS: '👥',
  STUDENT: '🎓',
  PROFESSOR: '👨‍🏫',
  ADMIN: '👑',
  GUEST: '👣',
  
  // الملفات
  FILE: '📄',
  FOLDER: '📁',
  UPLOAD: '📤',
  DOWNLOAD: '📥',
  PDF: '📕',
  WORD: '📘',
  EXCEL: '📈',
  POWERPOINT: '📊',
  IMAGE: '🖼️',
  VIDEO: '🎬',
  AUDIO: '🎵',
  ARCHIVE: '📦',
  
  // التواصل
  MESSAGE: '💬',
  CHAT: '💭',
  FORUM: '🗣️',
  COMMENT: '💬',
  LIKE: '👍',
  DISLIKE: '👎',
  SHARE: '↗️',
  
  // التعليم
  BOOK: '📚',
  GRADUATION: '🎓',
  SCHOOL: '🏫',
  UNIVERSITY: '🏛️',
  COURSE: '📖',
  EXAM: '📋',
  HOMEWORK: '📝',
  CALENDAR: '📅',
  CLOCK: '⏰',
  
  // الهندسة
  ENGINEERING: '⚙️',
  ELECTRICAL: '⚡',
  CHEMICAL: '🧪',
  CIVIL: '🏗️',
  MECHANICAL: '🔧',
  MEDICAL: '⚕️',
  
  // أخرى
  LOCK: '🔒',
  UNLOCK: '🔓',
  KEY: '🗝️',
  BELL: '🔔',
  STAR: '⭐',
  HEART: '❤️',
  FLAG: '🚩',
  TRASH: '🗑️',
  EDIT: '✏️',
  ADD: '➕',
  REMOVE: '➖',
  FILTER: '🔍',
  SORT: '⇅',
  EXPORT: '📤',
  IMPORT: '📥',
};

// نصاقات اللغة
export const LANGUAGES = {
  AR: {
    code: 'ar',
    name: 'العربية',
    dir: 'rtl',
    flag: '🇸🇦',
  },
  EN: {
    code: 'en',
    name: 'English',
    dir: 'ltr',
    flag: '🇺🇸',
  },
};

// وحدات القياس
export const UNITS = {
  BYTES: 'بايت',
  KB: 'كيلوبايت',
  MB: 'ميجابايت',
  GB: 'جيجابايت',
  TB: 'تيرابايت',
  
  SECONDS: 'ثانية',
  MINUTES: 'دقيقة',
  HOURS: 'ساعة',
  DAYS: 'يوم',
  WEEKS: 'أسبوع',
  MONTHS: 'شهر',
  YEARS: 'سنة',
};

// إعدادات العرض
export const VIEW_SETTINGS = {
  ITEMS_PER_PAGE: 20,
  MAX_PAGES_VISIBLE: 5,
  DEFAULT_SORT_FIELD: 'createdAt',
  DEFAULT_SORT_ORDER: 'desc',
  
  // إعدادات الشبكة
  GRID_COLUMNS: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
  
  // إعدادات البطاقات
  CARD_HEIGHT: 200,
  CARD_WIDTH: 300,
  
  // إعدادات الجداول
  TABLE_ROW_HEIGHT: 60,
  TABLE_HEADER_HEIGHT: 70,
};

// إعدادات التقرير
export const REPORT_SETTINGS = {
  MAX_ROWS_PER_REPORT: 1000,
  EXPORT_FORMATS: ['csv', 'excel', 'pdf', 'json'],
  DEFAULT_EXPORT_FORMAT: 'csv',
  REPORT_GENERATION_TIMEOUT: 5 * 60 * 1000, // 5 دقائق
};

// إعدادات النسخ الاحتياطي
export const BACKUP_SETTINGS = {
  SCHEDULE: '0 0 1 * *', // أول يوم من كل شهر في منتصف الليل
  RETENTION_DAYS: 90, // الاحتفاظ بالنسخ لمدة 90 يوماً
  MAX_BACKUPS: 10, // الحد الأقصى لعدد النسخ
  BACKUP_PATH: '/var/backups/engineering-library',
};

export default {
  USER_ROLES,
  DEPARTMENTS,
  SEMESTERS,
  FILE_TYPES,
  FILE_CATEGORIES,
  UPLOAD_SETTINGS,
  FORUM_SETTINGS,
  SECURITY_SETTINGS,
  NAVIGATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP_CONFIG,
  COLORS,
  ICONS,
  LANGUAGES,
  UNITS,
  VIEW_SETTINGS,
  REPORT_SETTINGS,
  BACKUP_SETTINGS,
};
