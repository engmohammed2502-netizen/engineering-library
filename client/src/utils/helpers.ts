/**
 * دوال مساعدة عامة للتطبيق
 */

/**
 * تنسيق التاريخ لعرضه للمستخدم
 * @param date - التاريخ المطلوب تنسيقه
 * @param format - التنسيق المطلوب (relative | short | medium | long)
 * @returns تاريخ منسق
 */
export const formatDate = (date: Date | string | number, format: 'relative' | 'short' | 'medium' | 'long' = 'medium'): string => {
  const d = new Date(date);
  
  if (format === 'relative') {
    return getRelativeTime(d);
  }
  
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'short':
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
      break;
    case 'medium':
      options.day = '2-digit';
      options.month = 'short';
      options.year = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'long':
      options.weekday = 'long';
      options.day = '2-digit';
      options.month = 'long';
      options.year = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
      break;
  }
  
  return d.toLocaleDateString('ar-SA', options);
};

/**
 * الحصول على الوقت النسبي (مثل "منذ دقيقتين")
 * @param date - التاريخ المطلوب
 * @returns وقت نسبي
 */
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    سنة: 31536000,
    شهر: 2592000,
    أسبوع: 604800,
    يوم: 86400,
    ساعة: 3600,
    دقيقة: 60,
    ثانية: 1,
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    
    if (interval >= 1) {
      if (interval === 1) {
        return `منذ ${interval} ${unit}`;
      } else {
        return `منذ ${interval} ${unit}${unit === 'دقيقة' || unit === 'ثانية' ? '' : 'ات'}`;
      }
    }
  }
  
  return 'الآن';
};

/**
 * تنسيق الأرقام مع فواصل الآلاف
 * @param num - الرقم المطلوب تنسيقه
 * @returns رقم منسق
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-SA').format(num);
};

/**
 * تقليم النص إذا كان طويلاً
 * @param text - النص المطلوب تقليمه
 * @param maxLength - الحد الأقصى للطول
 * @returns نص مقتطع
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * إزالة الأحرف الخاصة والمسافات الزائدة من النص
 * @param text - النص المطلوب تنظيفه
 * @returns نص نظيف
 */
export const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/gu, '')
    .trim();
};

/**
 * توليد معرف فريد
 * @returns معرف فريد
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * نسخ النص للحافظة
 * @param text - النص المطلوب نسخه
 * @returns وعد بنجاح العملية
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    
    // طريقة احتياطية
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  }
};

/**
 * تنزيل ملف
 * @param content - محتوى الملف
 * @param filename - اسم الملف
 * @param type - نوع الملف
 */
export const downloadFile = (content: string, filename: string, type: string = 'text/plain'): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * تحويل كائن لـ query string
 * @param params - الكائن المطلوب تحويله
 * @returns query string
 */
export const toQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};

/**
 * تحويل query string لكائن
 * @param queryString - query string
 * @returns كائن
 */
export const fromQueryString = (queryString: string): Record<string, string | string[]> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string | string[]> = {};
  
  params.forEach((value, key) => {
    if (key in result) {
      const existing = result[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[key] = [existing, value];
      }
    } else {
      result[key] = value;
    }
  });
  
  return result;
};

/**
 * إضافة تأخير (sleep)
 * @param ms - المدة بالميلي ثانية
 * @returns وعد
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * التحقق من صحة البريد الإلكتروني
 * @param email - البريد الإلكتروني
 * @returns صحة البريد
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * التحقق من صحة الرقم الجامعي
 * @param universityId - الرقم الجامعي
 * @returns صحة الرقم
 */
export const isValidUniversityId = (universityId: string): boolean => {
  // يمكن تعديل هذا بناءً على نظام الجامعة
  const idRegex = /^\d{8,10}$/;
  return idRegex.test(universityId);
};

/**
 * التبديل بين اللغة العربية والإنجليزية
 * @param text - النص المطلوب تبديله
 * @returns نص مبدل
 */
export const toggleLanguage = (text: string): string => {
  const arabicToEnglish: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'dh',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'h', 'ء': 'a', 'ؤ': 'u', 'ئ': 'i',
  };
  
  const englishToArabic: Record<string, string> = Object.fromEntries(
    Object.entries(arabicToEnglish).map(([key, value]) => [value, key])
  );
  
  // التحقق إذا كان النص يحتوي على أحرف عربية
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const mapping = hasArabic ? arabicToEnglish : englishToArabic;
  
  return text.split('').map(char => mapping[char] || char).join('');
};

/**
 * تنسيق الوقت المتبقي
 * @param seconds - الثواني المتبقية
 * @returns وقت منسق
 */
export const formatRemainingTime = (seconds: number): string => {
  if (seconds < 0) return 'انتهى';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days} يوم`);
  if (hours > 0) parts.push(`${hours} ساعة`);
  if (minutes > 0) parts.push(`${minutes} دقيقة`);
  if (secs > 0) parts.push(`${secs} ثانية`);
  
  return parts.join(' و ') || '0 ثانية';
};

/**
 * إنشاء تدرج ألوان
 * @param color - اللون الأساسي
 * @param steps - عدد الدرجات
 * @returns مصفوفة ألوان
 */
export const generateColorShades = (color: string, steps: number = 5): string[] => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const shades: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    const shadeR = Math.round(r * (1 - factor) + 255 * factor);
    const shadeG = Math.round(g * (1 - factor) + 255 * factor);
    const shadeB = Math.round(b * (1 - factor) + 255 * factor);
    
    shades.push(
      `#${shadeR.toString(16).padStart(2, '0')}${shadeG.toString(16).padStart(2, '0')}${shadeB.toString(16).padStart(2, '0')}`
    );
  }
  
  return shades;
};

/**
 * تسجيل حدث في سجلات التطبيق
 * @param level - مستوى السجل (info, warn, error)
 * @param message - الرسالة
 * @param data - بيانات إضافية
 */
export const logEvent = (level: 'info' | 'warn' | 'error', message: string, data?: any): void => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  console[level](`[${timestamp}] ${message}`, data || '');
  
  // إرسال السجلات للخادم في بيئة الإنتاج
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    }).catch(err => console.error('Failed to send log:', err));
  }
};

/**
 * التعامل مع الأخطاء بشكل مركزي
 * @param error - الخطأ
 * @param context - السياق
 */
export const handleError = (error: any, context: string = ''): void => {
  const errorMessage = error.message || 'حدث خطأ غير معروف';
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
  
  logEvent('error', fullMessage, error);
  
  // يمكن إضافة منطق إضافي هنا مثل إرسال الإخطارات
};

/**
 * حذف القيم الفارغة من الكائن
 * @param obj - الكائن
 * @returns كائن نظيف
 */
export const cleanObject = (obj: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

/**
 * دمج كائنين مع الحفاظ على القيم غير الفارغة
 * @param obj1 - الكائن الأول
 * @param obj2 - الكائن الثاني
 * @returns كائن مدمج
 */
export const mergeObjects = (obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> => {
  const result = { ...obj1 };
  
  Object.entries(obj2).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  });
  
  return result;
};

/**
 * تحويل مصفوفة إلى مجموعات
 * @param array - المصفوفة
 * @param size - حجم كل مجموعة
 * @returns مصفوفة مجموعات
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
};

/**
 * حساب النسبة المئوية
 * @param value - القيمة
 * @param total - المجموع
 * @returns النسبة المئوية
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * إنشاء اختصار للأسماء
 * @param name - الاسم الكامل
 * @returns اختصار الاسم
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export default {
  formatDate,
  formatNumber,
  truncateText,
  cleanText,
  generateId,
  copyToClipboard,
  downloadFile,
  toQueryString,
  fromQueryString,
  sleep,
  isValidEmail,
  isValidUniversityId,
  toggleLanguage,
  formatRemainingTime,
  generateColorShades,
  logEvent,
  handleError,
  cleanObject,
  mergeObjects,
  chunkArray,
  calculatePercentage,
  getInitials,
};
