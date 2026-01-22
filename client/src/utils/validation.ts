/**
 * دوال التحقق من صحة البيانات
 */

/**
 * التحقق من صحة رقم جامعي
 * @param universityId - الرقم الجامعي
 * @returns نتيجة التحقق
 */
export const validateUniversityId = (universityId: string): { valid: boolean; message?: string } => {
  if (!universityId || universityId.trim() === '') {
    return { valid: false, message: 'الرقم الجامعي مطلوب' };
  }
  
  // يجب أن يكون رقم جامعي مكون من 8-10 أرقام
  const idRegex = /^\d{8,10}$/;
  if (!idRegex.test(universityId)) {
    return { valid: false, message: 'الرقم الجامعي يجب أن يكون 8-10 أرقام فقط' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة كلمة المرور
 * @param password - كلمة المرور
 * @param confirmPassword - تأكيد كلمة المرور (اختياري)
 * @returns نتيجة التحقق
 */
export const validatePassword = (
  password: string, 
  confirmPassword?: string
): { valid: boolean; message?: string; strength?: number } => {
  if (!password || password.trim() === '') {
    return { valid: false, message: 'كلمة المرور مطلوبة' };
  }
  
  // التحقق من الطول الأدنى
  if (password.length < 8) {
    return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
  }
  
  // التحقق من القوة
  let strength = 0;
  
  // تحتوي على أحرف كبيرة
  if (/[A-Z]/.test(password)) strength += 1;
  
  // تحتوي على أحرف صغيرة
  if (/[a-z]/.test(password)) strength += 1;
  
  // تحتوي على أرقام
  if (/\d/.test(password)) strength += 1;
  
  // تحتوي على رموز خاصة
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;
  
  // يجب أن تحتوي على 3 أنواع على الأقل
  if (strength < 3) {
    return { 
      valid: false, 
      message: 'كلمة المرور ضعيفة. يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة',
      strength 
    };
  }
  
  // التحقق من تأكيد كلمة المرور إذا تم تقديمه
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { valid: false, message: 'كلمة المرور غير متطابقة' };
  }
  
  return { valid: true, strength };
};

/**
 * التحقق من صحة الاسم
 * @param name - الاسم
 * @returns نتيجة التحقق
 */
export const validateName = (name: string): { valid: boolean; message?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'الاسم مطلوب' };
  }
  
  if (name.length < 2) {
    return { valid: false, message: 'الاسم قصير جداً' };
  }
  
  if (name.length > 100) {
    return { valid: false, message: 'الاسم طويل جداً' };
  }
  
  // يجب أن يحتوي على أحرف فقط (مع السماح بالمسافات)
  const nameRegex = /^[\p{L}\s]+$/u;
  if (!nameRegex.test(name)) {
    return { valid: false, message: 'الاسم يجب أن يحتوي على أحرف فقط' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة البريد الإلكتروني
 * @param email - البريد الإلكتروني
 * @param required - هل البريد مطلوب؟
 * @returns نتيجة التحقق
 */
export const validateEmail = (email: string, required: boolean = true): { valid: boolean; message?: string } => {
  if (!email || email.trim() === '') {
    if (required) {
      return { valid: false, message: 'البريد الإلكتروني مطلوب' };
    }
    return { valid: true }; // غير مطلوب وليس موجود
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'البريد الإلكتروني غير صالح' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة التخصص
 * @param department - التخصص
 * @returns نتيجة التحقق
 */
export const validateDepartment = (department: string): { valid: boolean; message?: string } => {
  if (!department || department.trim() === '') {
    return { valid: false, message: 'التخصص مطلوب' };
  }
  
  const validDepartments = ['electrical', 'chemical', 'civil', 'mechanical', 'medical'];
  if (!validDepartments.includes(department)) {
    return { valid: false, message: 'التخصص غير صالح' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة السمستر
 * @param semester - السمستر
 * @returns نتيجة التحقق
 */
export const validateSemester = (semester: number | string): { valid: boolean; message?: string } => {
  const semesterNum = typeof semester === 'string' ? parseInt(semester) : semester;
  
  if (isNaN(semesterNum)) {
    return { valid: false, message: 'السمستر يجب أن يكون رقماً' };
  }
  
  if (semesterNum < 1 || semesterNum > 10) {
    return { valid: false, message: 'السمستر يجب أن يكون بين 1 و 10' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة عنوان المادة
 * @param courseCode - رمز المادة
 * @returns نتيجة التحقق
 */
export const validateCourseCode = (courseCode: string): { valid: boolean; message?: string } => {
  if (!courseCode || courseCode.trim() === '') {
    return { valid: false, message: 'رمز المادة مطلوب' };
  }
  
  if (courseCode.length < 2 || courseCode.length > 20) {
    return { valid: false, message: 'رمز المادة يجب أن يكون بين 2 و 20 حرفاً' };
  }
  
  // يجب أن يحتوي على أحرف وأرقام فقط
  const codeRegex = /^[A-Za-z0-9-]+$/;
  if (!codeRegex.test(courseCode)) {
    return { valid: false, message: 'رمز المادة يمكن أن يحتوي على أحرف وأرقام وشرطة فقط' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة اسم المادة
 * @param courseName - اسم المادة
 * @returns نتيجة التحقق
 */
export const validateCourseName = (courseName: string): { valid: boolean; message?: string } => {
  if (!courseName || courseName.trim() === '') {
    return { valid: false, message: 'اسم المادة مطلوب' };
  }
  
  if (courseName.length < 3 || courseName.length > 200) {
    return { valid: false, message: 'اسم المادة يجب أن يكون بين 3 و 200 حرف' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة وصف المادة
 * @param description - الوصف
 * @param required - هل الوصف مطلوب؟
 * @returns نتيجة التحقق
 */
export const validateDescription = (description: string, required: boolean = false): { valid: boolean; message?: string } => {
  if (!description || description.trim() === '') {
    if (required) {
      return { valid: false, message: 'الوصف مطلوب' };
    }
    return { valid: true };
  }
  
  if (description.length > 2000) {
    return { valid: false, message: 'الوصف طويل جداً (الحد الأقصى 2000 حرف)' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة نوع الملف
 * @param fileType - نوع الملف
 * @returns نتيجة التحقق
 */
export const validateFileType = (fileType: string): { valid: boolean; message?: string } => {
  if (!fileType || fileType.trim() === '') {
    return { valid: false, message: 'نوع الملف مطلوب' };
  }
  
  const validTypes = ['lecture', 'reference', 'exercises', 'exam', 'other'];
  if (!validTypes.includes(fileType)) {
    return { valid: false, message: 'نوع الملف غير صالح' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة تصنيف الملف
 * @param category - التصنيف
 * @returns نتيجة التحقق
 */
export const validateFileCategory = (category: string): { valid: boolean; message?: string } => {
  if (!category || category.trim() === '') {
    return { valid: false, message: 'تصنيف الملف مطلوب' };
  }
  
  if (category.length < 2 || category.length > 50) {
    return { valid: false, message: 'التصنيف يجب أن يكون بين 2 و 50 حرفاً' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة الملف
 * @param file - ملف
 * @param isImage - هل الملف صورة؟
 * @returns نتيجة التحقق
 */
export const validateFile = (
  file: File, 
  isImage: boolean = false
): { valid: boolean; message?: string; size?: number; type?: string } => {
  if (!file) {
    return { valid: false, message: 'الملف مطلوب' };
  }
  
  // التحقق من الحجم
  const maxSize = isImage ? 3 * 1024 * 1024 : 150 * 1024 * 1024;
  if (file.size > maxSize) {
    const maxSizeMB = isImage ? 3 : 150;
    return { 
      valid: false, 
      message: `حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB} ميجابايت`,
      size: file.size,
      type: file.type
    };
  }
  
  // التحقق من النوع
  const allowedTypes = {
    documents: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'],
    images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
    archives: ['.zip', '.rar', '.7z'],
    executables: ['.exe'],
    videos: ['.mp4', '.avi', '.mov', '.wmv'],
  };
  
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const allowedList = isImage ? allowedTypes.images : [
    ...allowedTypes.documents,
    ...allowedTypes.archives,
    ...allowedTypes.executables,
    ...allowedTypes.videos,
  ];
  
  if (!extension || !allowedList.includes(extension)) {
    const allowedExtensions = allowedList.join(', ');
    return { 
      valid: false, 
      message: `نوع الملف غير مسموح. الأنواع المسموحة: ${allowedExtensions}`,
      size: file.size,
      type: file.type
    };
  }
  
  return { valid: true, size: file.size, type: file.type };
};

/**
 * التحقق من صحة رسالة المنتدى
 * @param content - محتوى الرسالة
 * @returns نتيجة التحقق
 */
export const validateForumMessage = (content: string): { valid: boolean; message?: string } => {
  if (!content || content.trim() === '') {
    return { valid: false, message: 'محتوى الرسالة مطلوب' };
  }
  
  if (content.length > 2000) {
    return { valid: false, message: 'الرسالة طويلة جداً (الحد الأقصى 2000 حرف)' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة محتوى الرد
 * @param reply - محتوى الرد
 * @returns نتيجة التحقق
 */
export const validateForumReply = (reply: string): { valid: boolean; message?: string } => {
  if (!reply || reply.trim() === '') {
    return { valid: false, message: 'محتوى الرد مطلوب' };
  }
  
  if (reply.length > 1000) {
    return { valid: false, message: 'الرد طويل جداً (الحد الأقصى 1000 حرف)' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة الصورة للمنتدى
 * @param file - ملف الصورة
 * @returns نتيجة التحقق
 */
export const validateForumImage = (file: File): { valid: boolean; message?: string } => {
  const result = validateFile(file, true);
  
  if (!result.valid) {
    return result;
  }
  
  // تحقق إضافي للصور
  if (!file.type.startsWith('image/')) {
    return { valid: false, message: 'الملف يجب أن يكون صورة' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة بيانات تسجيل الدخول
 * @param data - بيانات تسجيل الدخول
 * @returns نتيجة التحقق
 */
export const validateLoginData = (data: { universityId: string; password: string }): {
  valid: boolean;
  errors?: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  const universityIdValidation = validateUniversityId(data.universityId);
  if (!universityIdValidation.valid) {
    errors.universityId = universityIdValidation.message || '';
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message || '';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
};

/**
 * التحقق من صحة بيانات التسجيل
 * @param data - بيانات التسجيل
 * @param role - دور المستخدم
 * @returns نتيجة التحقق
 */
export const validateRegistrationData = (
  data: {
    universityId: string;
    password: string;
    confirmPassword: string;
    name: string;
    email?: string;
    department?: string;
    semester?: number | string;
  },
  role: string
): { valid: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const universityIdValidation = validateUniversityId(data.universityId);
  if (!universityIdValidation.valid) {
    errors.universityId = universityIdValidation.message || '';
  }
  
  const passwordValidation = validatePassword(data.password, data.confirmPassword);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message || '';
  }
  
  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.message || '';
  }
  
  if (data.email) {
    const emailValidation = validateEmail(data.email, false);
    if (!emailValidation.valid) {
      errors.email = emailValidation.message || '';
    }
  }
  
  if (role === 'student') {
    if (!data.department) {
      errors.department = 'التخصص مطلوب للطلاب';
    } else {
      const departmentValidation = validateDepartment(data.department);
      if (!departmentValidation.valid) {
        errors.department = departmentValidation.message || '';
      }
    }
    
    if (!data.semester) {
      errors.semester = 'السمستر مطلوب للطلاب';
    } else {
      const semesterValidation = validateSemester(data.semester);
      if (!semesterValidation.valid) {
        errors.semester = semesterValidation.message || '';
      }
    }
  }
  
  if (role === 'professor' || role === 'admin') {
    if (!data.department) {
      errors.department = 'التخصص مطلوب';
    } else {
      const departmentValidation = validateDepartment(data.department);
      if (!departmentValidation.valid) {
        errors.department = departmentValidation.message || '';
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
};

/**
 * التحقق من صحة بيانات المادة
 * @param data - بيانات المادة
 * @returns نتيجة التحقق
 */
export const validateCourseData = (data: {
  code: string;
  name: string;
  description?: string;
  department: string;
  semester: number;
}): { valid: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const codeValidation = validateCourseCode(data.code);
  if (!codeValidation.valid) {
    errors.code = codeValidation.message || '';
  }
  
  const nameValidation = validateCourseName(data.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.message || '';
  }
  
  const descriptionValidation = validateDescription(data.description || '', false);
  if (!descriptionValidation.valid) {
    errors.description = descriptionValidation.message || '';
  }
  
  const departmentValidation = validateDepartment(data.department);
  if (!departmentValidation.valid) {
    errors.department = departmentValidation.message || '';
  }
  
  const semesterValidation = validateSemester(data.semester);
  if (!semesterValidation.valid) {
    errors.semester = semesterValidation.message || '';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
};

/**
 * التحقق من صحة بيانات رفع الملف
 * @param data - بيانات رفع الملف
 * @returns نتيجة التحقق
 */
export const validateFileUploadData = (data: {
  type: string;
  category: string;
  description?: string;
  file?: File;
}): { valid: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const typeValidation = validateFileType(data.type);
  if (!typeValidation.valid) {
    errors.type = typeValidation.message || '';
  }
  
  const categoryValidation = validateFileCategory(data.category);
  if (!categoryValidation.valid) {
    errors.category = categoryValidation.message || '';
  }
  
  const descriptionValidation = validateDescription(data.description || '', false);
  if (!descriptionValidation.valid) {
    errors.description = descriptionValidation.message || '';
  }
  
  if (!data.file) {
    errors.file = 'الملف مطلوب';
  } else {
    const fileValidation = validateFile(data.file, false);
    if (!fileValidation.valid) {
      errors.file = fileValidation.message || '';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
};

/**
 * التحقق من صحة رقم الهاتف
 * @param phone - رقم الهاتف
 * @returns نتيجة التحقق
 */
export const validatePhone = (phone: string): { valid: boolean; message?: string } => {
  if (!phone || phone.trim() === '') {
    return { valid: false, message: 'رقم الهاتف مطلوب' };
  }
  
  // تحقق من صيغة الرقم السوداني
  const sudanPhoneRegex = /^(?:\+249|0)(9|1)[0-9]{8}$/;
  if (!sudanPhoneRegex.test(phone.replace(/\s/g, ''))) {
    return { valid: false, message: 'رقم الهاتف غير صالح' };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة التاريخ
 * @param date - التاريخ
 * @param minDate - الحد الأدنى للتاريخ (اختياري)
 * @param maxDate - الحد الأقصى للتاريخ (اختياري)
 * @returns نتيجة التحقق
 */
export const validateDate = (
  date: string, 
  minDate?: Date, 
  maxDate?: Date
): { valid: boolean; message?: string } => {
  if (!date || date.trim() === '') {
    return { valid: false, message: 'التاريخ مطلوب' };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: 'التاريخ غير صالح' };
  }
  
  if (minDate && dateObj < minDate) {
    return { valid: false, message: `التاريخ يجب أن يكون بعد ${minDate.toLocaleDateString('ar-SA')}` };
  }
  
  if (maxDate && dateObj > maxDate) {
    return { valid: false, message: `التاريخ يجب أن يكون قبل ${maxDate.toLocaleDateString('ar-SA')}` };
  }
  
  return { valid: true };
};

/**
 * التحقق من صحة الرقم
 * @param number - الرقم
 * @param min - القيمة الدنيا (اختياري)
 * @param max - القيمة العليا (اختياري)
 * @returns نتيجة التحقق
 */
export const validateNumber = (
  number: string | number,
  min?: number,
  max?: number
): { valid: boolean; message?: string; value?: number } => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(num)) {
    return { valid: false, message: 'القيمة يجب أن تكون رقماً' };
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, message: `القيمة يجب أن تكون أكبر من أو تساوي ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, message: `القيمة يجب أن تكون أقل من أو تساوي ${max}` };
  }
  
  return { valid: true, value: num };
};

/**
 * دالة عامة للتحقق من صحة الحقول
 * @param value - القيمة
 * @param rules - قواعد التحقق
 * @returns نتيجة التحقق
 */
export const validateField = (
  value: any,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (val: any) => { valid: boolean; message?: string };
    type?: 'email' | 'phone' | 'number' | 'date';
    min?: number;
    max?: number;
  }
): { valid: boolean; message?: string } => {
  // التحقق من الحقل المطلوب
  if (rules.required && (value === undefined || value === null || value === '')) {
    return { valid: false, message: 'هذا الحقل مطلوب' };
  }
  
  // إذا كانت القيمة غير مطلوبة وغير موجودة، نجاح
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return { valid: true };
  }
  
  // التحقق من الطول الأدنى
  if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
    return { valid: false, message: `الحد الأدنى ${rules.minLength} حرفاً` };
  }
  
  // التحقق من الطول الأقصى
  if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
    return { valid: false, message: `الحد الأقصى ${rules.maxLength} حرفاً` };
  }
  
  // التحقق من النمط
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return { valid: false, message: 'الصيغة غير صحيحة' };
  }
  
  // التحقق من النوع
  if (rules.type) {
    switch (rules.type) {
      case 'email':
        const emailResult = validateEmail(value, false);
        if (!emailResult.valid) return emailResult;
        break;
      case 'phone':
        const phoneResult = validatePhone(value);
        if (!phoneResult.valid) return phoneResult;
        break;
      case 'number':
        const numberResult = validateNumber(value, rules.min, rules.max);
        if (!numberResult.valid) return numberResult;
        break;
      case 'date':
        const dateResult = validateDate(value);
        if (!dateResult.valid) return dateResult;
        break;
    }
  }
  
  // التحقق المخصص
  if (rules.custom) {
    return rules.custom(value);
  }
  
  return { valid: true };
};

export default {
  validateUniversityId,
  validatePassword,
  validateName,
  validateEmail,
  validateDepartment,
  validateSemester,
  validateCourseCode,
  validateCourseName,
  validateDescription,
  validateFileType,
  validateFileCategory,
  validateFile,
  validateForumMessage,
  validateForumReply,
  validateForumImage,
  validateLoginData,
  validateRegistrationData,
  validateCourseData,
  validateFileUploadData,
  validatePhone,
  validateDate,
  validateNumber,
  validateField,
};
