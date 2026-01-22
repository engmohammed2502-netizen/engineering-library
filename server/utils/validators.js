/**
 * أدوات التحقق من صحة البيانات
 * تحقق من صحة بيانات الإدخال في جميع أنحاء التطبيق
 */

const Joi = require('joi');
const mongoose = require('mongoose');

/**
 * التحقق من صحة رقم جامعي
 */
const universityIdSchema = Joi.string()
  .pattern(/^\d{8,10}$/)
  .required()
  .messages({
    'string.pattern.base': 'الرقم الجامعي يجب أن يكون 8-10 أرقام فقط',
    'any.required': 'الرقم الجامعي مطلوب'
  });

/**
 * التحقق من صحة كلمة المرور
 */
const passwordSchema = Joi.string()
  .min(8)
  .max(100)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'string.max': 'كلمة المرور طويلة جداً',
    'string.pattern.base': 'كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة',
    'any.required': 'كلمة المرور مطلوبة'
  });

/**
 * التحقق من صحة الاسم
 */
const nameSchema = Joi.string()
  .min(2)
  .max(100)
  .pattern(/^[\p{L}\s]+$/u)
  .required()
  .messages({
    'string.min': 'الاسم قصير جداً',
    'string.max': 'الاسم طويل جداً',
    'string.pattern.base': 'الاسم يجب أن يحتوي على أحرف فقط',
    'any.required': 'الاسم مطلوب'
  });

/**
 * التحقق من صحة البريد الإلكتروني
 */
const emailSchema = Joi.string()
  .email()
  .max(100)
  .messages({
    'string.email': 'البريد الإلكتروني غير صالح',
    'string.max': 'البريد الإلكتروني طويل جداً'
  });

/**
 * التحقق من صحة التخصص
 */
const departmentSchema = Joi.string()
  .valid('electrical', 'chemical', 'civil', 'mechanical', 'medical')
  .required()
  .messages({
    'any.only': 'التخصص غير صالح',
    'any.required': 'التخصص مطلوب'
  });

/**
 * التحقق من صحة السمستر
 */
const semesterSchema = Joi.number()
  .integer()
  .min(1)
  .max(10)
  .required()
  .messages({
    'number.base': 'السمستر يجب أن يكون رقماً',
    'number.min': 'السمستر يجب أن يكون بين 1 و 10',
    'number.max': 'السمستر يجب أن يكون بين 1 و 10',
    'any.required': 'السمستر مطلوب'
  });

/**
 * التحقق من صحة رمز المادة
 */
const courseCodeSchema = Joi.string()
  .min(2)
  .max(20)
  .pattern(/^[A-Za-z0-9-]+$/)
  .required()
  .messages({
    'string.min': 'رمز المادة قصير جداً',
    'string.max': 'رمز المادة طويل جداً',
    'string.pattern.base': 'رمز المادة يمكن أن يحتوي على أحرف وأرقام وشرطة فقط',
    'any.required': 'رمز المادة مطلوب'
  });

/**
 * التحقق من صحة اسم المادة
 */
const courseNameSchema = Joi.string()
  .min(3)
  .max(200)
  .required()
  .messages({
    'string.min': 'اسم المادة قصير جداً',
    'string.max': 'اسم المادة طويل جداً',
    'any.required': 'اسم المادة مطلوب'
  });

/**
 * التحقق من صحة وصف المادة
 */
const descriptionSchema = Joi.string()
  .max(2000)
  .allow('', null)
  .messages({
    'string.max': 'الوصف طويل جداً (الحد الأقصى 2000 حرف)'
  });

/**
 * التحقق من صحة نوع الملف
 */
const fileTypeSchema = Joi.string()
  .valid('lecture', 'reference', 'exercises', 'exam', 'other')
  .required()
  .messages({
    'any.only': 'نوع الملف غير صالح',
    'any.required': 'نوع الملف مطلوب'
  });

/**
 * التحقق من صحة تصنيف الملف
 */
const fileCategorySchema = Joi.string()
  .min(2)
  .max(50)
  .required()
  .messages({
    'string.min': 'تصنيف الملف قصير جداً',
    'string.max': 'تصنيف الملف طويل جداً',
    'any.required': 'تصنيف الملف مطلوب'
  });

/**
 * التحقق من صحة محتوى الرسالة
 */
const forumMessageSchema = Joi.string()
  .min(1)
  .max(2000)
  .required()
  .messages({
    'string.min': 'محتوى الرسالة مطلوب',
    'string.max': 'الرسالة طويلة جداً (الحد الأقصى 2000 حرف)',
    'any.required': 'محتوى الرسالة مطلوب'
  });

/**
 * التحقق من صحة محتوى الرد
 */
const forumReplySchema = Joi.string()
  .min(1)
  .max(1000)
  .required()
  .messages({
    'string.min': 'محتوى الرد مطلوب',
    'string.max': 'الرد طويل جداً (الحد الأقصى 1000 حرف)',
    'any.required': 'محتوى الرد مطلوب'
  });

/**
 * مخطط تسجيل الدخول
 */
const loginSchema = Joi.object({
  universityId: universityIdSchema,
  password: passwordSchema
});

/**
 * مخطط تسجيل الدخول كضيف
 */
const guestLoginSchema = Joi.object({
  name: nameSchema
});

/**
 * مخطط تسجيل الطالب
 */
const studentRegistrationSchema = Joi.object({
  universityId: universityIdSchema,
  password: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'كلمة المرور غير متطابقة',
      'any.required': 'تأكيد كلمة المرور مطلوب'
    }),
  name: nameSchema,
  email: emailSchema.optional(),
  department: departmentSchema,
  semester: semesterSchema
});

/**
 * مخطط تسجيل الأستاذ
 */
const professorRegistrationSchema = Joi.object({
  universityId: universityIdSchema,
  password: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'كلمة المرور غير متطابقة',
      'any.required': 'تأكيد كلمة المرور مطلوب'
    }),
  name: nameSchema,
  email: emailSchema.optional(),
  department: departmentSchema
});

/**
 * مخطط تحديث الملف الشخصي
 */
const updateProfileSchema = Joi.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'رابط الصورة غير صالح'
    }),
  currentPassword: Joi.string()
    .optional()
    .when('newPassword', {
      is: Joi.exist(),
      then: Joi.required().messages({
        'any.required': 'كلمة المرور الحالية مطلوبة عند تغيير كلمة المرور'
      })
    }),
  newPassword: passwordSchema.optional()
});

/**
 * مخطط تغيير كلمة المرور
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'كلمة المرور الحالية مطلوبة'
  }),
  newPassword: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'كلمة المرور غير متطابقة',
      'any.required': 'تأكيد كلمة المرور مطلوب'
    })
});

/**
 * مخطط إنشاء مادة
 */
const createCourseSchema = Joi.object({
  code: courseCodeSchema,
  name: courseNameSchema,
  description: descriptionSchema.optional(),
  department: departmentSchema,
  semester: semesterSchema,
  professorId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .required()
    .messages({
      'any.invalid': 'معرف الأستاذ غير صالح',
      'any.required': 'معرف الأستاذ مطلوب'
    })
});

/**
 * مخطط تحديث مادة
 */
const updateCourseSchema = Joi.object({
  name: courseNameSchema.optional(),
  description: descriptionSchema.optional(),
  professorId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional()
    .messages({
      'any.invalid': 'معرف الأستاذ غير صالح'
    }),
  isActive: Joi.boolean().optional(),
  forumEnabled: Joi.boolean().optional()
});

/**
 * مخطط رفع ملف
 */
const fileUploadSchema = Joi.object({
  type: fileTypeSchema,
  category: fileCategorySchema,
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'الوصف طويل جداً (الحد الأقصى 500 حرف)'
    })
});

/**
 * مخطط إنشاء منتدى
 */
const createForumSchema = Joi.object({
  courseId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .required()
    .messages({
      'any.invalid': 'معرف المادة غير صالح',
      'any.required': 'معرف المادة مطلوب'
    }),
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'اسم المنتدى قصير جداً',
      'string.max': 'اسم المنتدى طويل جداً',
      'any.required': 'اسم المنتدى مطلوب'
    }),
  description: Joi.string()
    .max(500)
    .required()
    .messages({
      'string.max': 'وصف المنتدى طويل جداً',
      'any.required': 'وصف المنتدى مطلوب'
    })
});

/**
 * مخطط رسالة المنتدى
 */
const forumMessageCreateSchema = Joi.object({
  content: forumMessageSchema,
  replyTo: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional()
    .messages({
      'any.invalid': 'معرف الرسالة غير صالح'
    })
});

/**
 * مخطط الرد على المنتدى
 */
const forumReplySchemaObject = Joi.object({
  content: forumReplySchema
});

/**
 * مخطط إعدادات النظام
 */
const systemSettingsSchema = Joi.object({
  // إعدادات الأمان
  maxLoginAttempts: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional(),
  accountLockoutDuration: Joi.number()
    .integer()
    .min(3600000) // ساعة واحدة
    .max(604800000) // أسبوع
    .optional(),
  sessionTimeout: Joi.number()
    .integer()
    .min(900000) // 15 دقيقة
    .max(604800000) // أسبوع
    .optional(),
  guestSessionTimeout: Joi.number()
    .integer()
    .min(300000) // 5 دقائق
    .max(3600000) // ساعة
    .optional(),
  
  // إعدادات الملفات
  maxFileSize: Joi.number()
    .integer()
    .min(1048576) // 1MB
    .max(524288000) // 500MB
    .optional(),
  maxImageSize: Joi.number()
    .integer()
    .min(102400) // 100KB
    .max(10485760) // 10MB
    .optional(),
  
  // إعدادات المنتدى
  forumMaxMessageLength: Joi.number()
    .integer()
    .min(100)
    .max(5000)
    .optional(),
  forumMaxImagesPerMessage: Joi.number()
    .integer()
    .min(0)
    .max(10)
    .optional(),
  forumAllowGuestView: Joi.boolean().optional(),
  forumAllowGuestPost: Joi.boolean().optional(),
  forumModerationEnabled: Joi.boolean().optional(),
  
  // إعدادات عامة
  paginationLimit: Joi.number()
    .integer()
    .min(5)
    .max(100)
    .optional(),
  defaultLanguage: Joi.string()
    .valid('ar', 'en')
    .optional()
});

/**
 * التحقق من صحة بيانات تسجيل الدخول
 * @param {Object} data - بيانات تسجيل الدخول
 * @returns {Object} نتيجة التحقق
 */
function validateLogin(data) {
  return loginSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة بيانات تسجيل الدخول كضيف
 * @param {Object} data - بيانات تسجيل الدخول
 * @returns {Object} نتيجة التحقق
 */
function validateGuestLogin(data) {
  return guestLoginSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة بيانات التسجيل
 * @param {Object} data - بيانات التسجيل
 * @param {string} role - دور المستخدم
 * @returns {Object} نتيجة التحقق
 */
function validateRegistration(data, role = 'student') {
  const schema = role === 'professor' 
    ? professorRegistrationSchema 
    : studentRegistrationSchema;
  
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة تحديث الملف الشخصي
 * @param {Object} data - بيانات التحديث
 * @returns {Object} نتيجة التحقق
 */
function validateUpdateProfile(data) {
  return updateProfileSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة تغيير كلمة المرور
 * @param {Object} data - بيانات تغيير كلمة المرور
 * @returns {Object} نتيجة التحقق
 */
function validateChangePassword(data) {
  return changePasswordSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة إنشاء مادة
 * @param {Object} data - بيانات المادة
 * @returns {Object} نتيجة التحقق
 */
function validateCreateCourse(data) {
  return createCourseSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة تحديث مادة
 * @param {Object} data - بيانات التحديث
 * @returns {Object} نتيجة التحقق
 */
function validateUpdateCourse(data) {
  return updateCourseSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة رفع ملف
 * @param {Object} data - بيانات الرفع
 * @returns {Object} نتيجة التحقق
 */
function validateFileUpload(data) {
  return fileUploadSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة إنشاء منتدى
 * @param {Object} data - بيانات المنتدى
 * @returns {Object} نتيجة التحقق
 */
function validateCreateForum(data) {
  return createForumSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة رسالة المنتدى
 * @param {Object} data - بيانات الرسالة
 * @returns {Object} نتيجة التحقق
 */
function validateForumMessage(data) {
  return forumMessageCreateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة رد المنتدى
 * @param {Object} data - بيانات الرد
 * @returns {Object} نتيجة التحقق
 */
function validateForumReply(data) {
  return forumReplySchemaObject.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة إعدادات النظام
 * @param {Object} data - بيانات الإعدادات
 * @returns {Object} نتيجة التحقق
 */
function validateSystemSettings(data) {
  return systemSettingsSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * التحقق من صحة معرف MongoDB
 * @param {string} id - المعرف
 * @returns {boolean} صحة المعرف
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * التحقق من صحة عنوان URL
 * @param {string} url - العنوان
 * @returns {boolean} صحة العنوان
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * التحقق من صحة رقم الهاتف السوداني
 * @param {string} phone - رقم الهاتف
 * @returns {boolean} صحة الرقم
 */
function isValidSudanesePhone(phone) {
  const sudanPhoneRegex = /^(?:\+249|0)(9|1)[0-9]{8}$/;
  return sudanPhoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * التحقق من صحة التاريخ
 * @param {string} dateString - تاريخ كسلسلة نصية
 * @param {string} format - التنسيق المطلوب (YYYY-MM-DD)
 * @returns {boolean} صحة التاريخ
 */
function isValidDate(dateString, format = 'YYYY-MM-DD') {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return false;
  }
  
  if (format === 'YYYY-MM-DD') {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  }
  
  return true;
}

/**
 * تنظيف النص من الأحرف الضارة
 * @param {string} text - النص المدخل
 * @returns {string} النص المنظف
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return text;
  
  return text
    .replace(/[<>]/g, '') // إزالة علامات HTML
    .replace(/javascript:/gi, '') // إزالة JavaScript
    .replace(/on\w+=/gi, '') // إزالة معالجات الأحداث
    .trim();
}

/**
 * تنظيف مدخلات البحث
 * @param {string} searchQuery - استعلام البحث
 * @returns {string} استعمال بحث نظيف
 */
function sanitizeSearchQuery(searchQuery) {
  if (typeof searchQuery !== 'string') return '';
  
  return searchQuery
    .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
}

/**
 * التحقق من صحة ملف الرفع
 * @param {Object} file - ملف الرفع
 * @param {boolean} isImage - هل الملف صورة؟
 * @returns {Object} نتيجة التحقق
 */
function validateUploadedFile(file, isImage = false) {
  if (!file) {
    return { valid: false, error: 'الملف مطلوب' };
  }
  
  // التحقق من الحجم
  const maxSize = isImage 
    ? parseInt(process.env.MAX_IMAGE_SIZE) || 3145728 // 3MB
    : parseInt(process.env.MAX_FILE_SIZE) || 157286400; // 150MB
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { 
      valid: false, 
      error: `حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB} ميجابايت` 
    };
  }
  
  // التحقق من النوع
  const allowedTypes = isImage
    ? ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']
    : ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'zip', 'rar', '7z', 'exe', 'mp4', 'avi', 'mov', 'wmv'];
  
  const extension = file.originalname.split('.').pop().toLowerCase();
  
  if (!allowedTypes.includes(extension)) {
    return { 
      valid: false, 
      error: `نوع الملف غير مسموح: ${extension}. الأنواع المسموحة: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { valid: true, extension, size: file.size };
}

/**
 * تنسيق أخطاء التحقق لعرضها للمستخدم
 * @param {Object} validationResult - نتيجة التحقق من Joi
 * @returns {Array} قائمة الأخطاء المنسقة
 */
function formatValidationErrors(validationResult) {
  if (!validationResult.error) {
    return [];
  }
  
  return validationResult.error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message
  }));
}

/**
 * التحقق من صحة بيانات النموذج
 * @param {Object} data - بيانات النموذج
 * @param {Object} schema - مخطط التحقق
 * @returns {Object} نتيجة التحقق
 */
function validateFormData(data, schema) {
  const result = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  return {
    valid: !result.error,
    value: result.value,
    errors: result.error ? formatValidationErrors(result) : []
  };
}

module.exports = {
  // المخططات
  loginSchema,
  guestLoginSchema,
  studentRegistrationSchema,
  professorRegistrationSchema,
  updateProfileSchema,
  changePasswordSchema,
  createCourseSchema,
  updateCourseSchema,
  fileUploadSchema,
  createForumSchema,
  forumMessageCreateSchema,
  forumReplySchemaObject,
  systemSettingsSchema,
  
  // دوال التحقق
  validateLogin,
  validateGuestLogin,
  validateRegistration,
  validateUpdateProfile,
  validateChangePassword,
  validateCreateCourse,
  validateUpdateCourse,
  validateFileUpload,
  validateCreateForum,
  validateForumMessage,
  validateForumReply,
  validateSystemSettings,
  
  // دوال مساعدة
  isValidObjectId,
  isValidUrl,
  isValidSudanesePhone,
  isValidDate,
  sanitizeText,
  sanitizeSearchQuery,
  validateUploadedFile,
  formatValidationErrors,
  validateFormData
};
