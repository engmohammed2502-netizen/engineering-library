/**
 * وسيط التحقق من الصلاحيات
 * يتحقق من صلاحيات المستخدم قبل السماح بالوصول إلى الموارد
 */

const User = require('../models/User');

/**
 * التحقق من صلاحيات المستخدم
 * @param {Array} allowedRoles - الأدوار المسموح لها بالوصول
 * @returns {Function} وسيط Express
 */
const permissions = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // التحقق من وجود المستخدم في الطلب
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'غير مصرح. يرجى تسجيل الدخول'
        });
      }

      // الحصول على بيانات المستخدم الكاملة من قاعدة البيانات
      const user = await User.findById(req.user.id).select('role isActive lockedUntil');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      // التحقق من أن الحساب نشط
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'الحساب غير نشط. يرجى الاتصال بالمشرف'
        });
      }

      // التحقق من أن الحساب غير مجمد
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingTime = Math.ceil((user.lockedUntil - new Date()) / (1000 * 60)); // بالدقائق
        return res.status(403).json({
          success: false,
          message: `الحساب مجمد حتى ${user.lockedUntil.toLocaleString('ar-SA')}. المتبقي: ${remainingTime} دقيقة`
        });
      }

      // إذا كانت الصلاحيات فارغة، السماح للجميع
      if (allowedRoles.length === 0) {
        req.user.role = user.role;
        return next();
      }

      // التحقق من أن دور المستخدم مسموح
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
        });
      }

      // تحديث دور المستخدم في الطلب
      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('Error in permissions middleware:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من الصلاحيات'
      });
    }
  };
};

/**
 * التحقق من صلاحيات وصول إلى مادة دراسية
 * @returns {Function} وسيط Express
 */
const courseAccess = () => {
  return async (req, res, next) => {
    try {
      const { courseId } = req.params;
      
      if (!courseId) {
        return next(); // إذا لم يكن هناك معرف مادة، ننتقل للوسيط التالي
      }

      // الحصول على بيانات المادة
      const Course = require('../models/Course');
      const course = await Course.findById(courseId).select('department professorId isActive');
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'المادة غير موجودة'
        });
      }

      // التحقق من أن المادة نشطة
      if (!course.isActive) {
        return res.status(403).json({
          success: false,
          message: 'المادة غير نشطة حالياً'
        });
      }

      // الروت والإدارة يمكنهم الوصول لكل المواد
      if (req.user.role === 'root' || req.user.role === 'admin') {
        return next();
      }

      // الأساتذة يمكنهم الوصول لموادهم فقط
      if (req.user.role === 'professor') {
        if (course.professorId.toString() === req.user.id) {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لهذه المادة'
        });
      }

      // الطلاب يمكنهم الوصول لمواد تخصصهم فقط
      if (req.user.role === 'student') {
        if (req.user.department === course.department) {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لهذه المادة'
        });
      }

      // الضيوف يمكنهم الوصول لكل المواد (للقراءة فقط)
      if (req.user.role === 'guest') {
        // الضيوف يمكنهم فقط عرض المواد، لا يمكنهم التعديل
        if (req.method === 'GET') {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: 'الضيوف لا يمكنهم إجراء عمليات التعديل'
        });
      }

      // إذا وصلنا هنا، فالمستخدم ليس له صلاحية
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذه المادة'
      });
    } catch (error) {
      console.error('Error in course access middleware:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من صلاحية الوصول للمادة'
      });
    }
  };
};

/**
 * التحقق من صلاحيات وصول إلى تخصص
 * @returns {Function} وسيط Express
 */
const departmentAccess = () => {
  return async (req, res, next) => {
    try {
      const { department } = req.params;
      
      if (!department) {
        return next(); // إذا لم يكن هناك تخصص، ننتقل للوسيط التالي
      }

      // التحقق من أن التخصص صالح
      const validDepartments = ['electrical', 'chemical', 'civil', 'mechanical', 'medical'];
      if (!validDepartments.includes(department)) {
        return res.status(400).json({
          success: false,
          message: 'التخصص غير صالح'
        });
      }

      // الروت والإدارة والضيوف يمكنهم الوصول لكل التخصصات
      if (req.user.role === 'root' || req.user.role === 'admin' || req.user.role === 'guest') {
        return next();
      }

      // الأساتذة والطلاب يمكنهم الوصول لتخصصاتهم فقط
      if (req.user.department === department) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا التخصص'
      });
    } catch (error) {
      console.error('Error in department access middleware:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من صلاحية الوصول للتخصص'
      });
    }
  };
};

/**
 * التحقق من صلاحيات الوصول للمنتدى
 * @returns {Function} وسيط Express
 */
const forumAccess = () => {
  return async (req, res, next) => {
    try {
      const { forumId } = req.params;
      
      if (!forumId) {
        return next();
      }

      // الحصول على بيانات المنتدى والمادة
      const Forum = require('../models/Forum');
      const forum = await Forum.findById(forumId).populate('course', 'department professorId');
      
      if (!forum) {
        return res.status(404).json({
          success: false,
          message: 'المنتدى غير موجود'
        });
      }

      // التحقق من أن المنتدى نشط
      if (!forum.isActive) {
        return res.status(403).json({
          success: false,
          message: 'المنتدى غير نشط حالياً'
        });
      }

      // التحقق من صلاحية الوصول للمادة
      const course = forum.course;
      
      // الروت والإدارة يمكنهم الوصول لكل المنتديات
      if (req.user.role === 'root' || req.user.role === 'admin') {
        return next();
      }

      // الأساتذة يمكنهم الوصول لمنتديات موادهم فقط
      if (req.user.role === 'professor') {
        if (course.professorId.toString() === req.user.id) {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لهذا المنتدى'
        });
      }

      // الطلاب يمكنهم الوصول لمنتديات تخصصهم فقط
      if (req.user.role === 'student') {
        if (req.user.department === course.department) {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لهذا المنتدى'
        });
      }

      // الضيوف يمكنهم قراءة المنتدى فقط إذا كان مسموحاً
      if (req.user.role === 'guest') {
        if (process.env.FORUM_ALLOW_GUEST_VIEW === 'true' && req.method === 'GET') {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: 'الضيوف لا يمكنهم الوصول للمنتدى'
        });
      }

      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا المنتدى'
      });
    } catch (error) {
      console.error('Error in forum access middleware:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من صلاحية الوصول للمنتدى'
      });
    }
  };
};

/**
 * التحقق من صلاحيات تحميل الملفات
 * @returns {Function} وسيط Express
 */
const uploadPermissions = () => {
  return async (req, res, next) => {
    try {
      // الروت والإدارة يمكنهم رفع أي ملف
      if (req.user.role === 'root' || req.user.role === 'admin') {
        return next();
      }

      // الأساتذة يمكنهم رفع ملفات لموادهم فقط
      if (req.user.role === 'professor') {
        const { courseId } = req.params;
        
        if (!courseId) {
          return res.status(400).json({
            success: false,
            message: 'معرف المادة مطلوب'
          });
        }

        const Course = require('../models/Course');
        const course = await Course.findById(courseId).select('professorId');
        
        if (!course) {
          return res.status(404).json({
            success: false,
            message: 'المادة غير موجودة'
          });
        }

        if (course.professorId.toString() === req.user.id) {
          return next();
        }

        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية لرفع ملفات لهذه المادة'
        });
      }

      // الطلاب والضيوف لا يمكنهم رفع ملفات
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لرفع الملفات'
      });
    } catch (error) {
      console.error('Error in upload permissions middleware:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من صلاحيات الرفع'
      });
    }
  };
};

/**
 * التحقق من صلاحيات تعديل المحتوى
 * @param {String} modelName - اسم النموذج (User, Course, File, etc.)
 * @param {String} idParam - اسم المعامل الذي يحتوي على المعرف
 * @returns {Function} وسيط Express
 */
const contentOwnership = (modelName, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const model = require(`../models/${modelName}`);
      const documentId = req.params[idParam];
      
      if (!documentId) {
        return res.status(400).json({
          success: false,
          message: 'معرف المورد مطلوب'
        });
      }

      // الحصول على المستند
      const document = await model.findById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'المورد غير موجود'
        });
      }

      // الروت يمكنه تعديل كل شيء
      if (req.user.role === 'root') {
        req.document = document;
        return next();
      }

      // الإدارة يمكنها تعديل معظم الأشياء
      if (req.user.role === 'admin') {
        // لا يمكن للإدارة تعديل الروت
        if (modelName === 'User' && document.role === 'root') {
          return res.status(403).json({
            success: false,
            message: 'لا يمكن تعديل حساب الروت'
          });
        }
        
        // لا يمكن للإدارة تعديل الإدارة الأخرى
        if (modelName === 'User' && document.role === 'admin' && document._id.toString() !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'لا يمكن تعديل حسابات الإدارة الأخرى'
          });
        }
        
        req.document = document;
        return next();
      }

      // التحقق من الملكية بناءً على النموذج
      let isOwner = false;

      switch (modelName) {
        case 'User':
          isOwner = document._id.toString() === req.user.id;
          break;
        
        case 'Course':
          isOwner = document.professorId.toString() === req.user.id;
          break;
        
        case 'File':
          isOwner = document.uploadedBy.toString() === req.user.id;
          break;
        
        case 'ForumMessage':
          isOwner = document.userId.toString() === req.user.id;
          break;
        
        default:
          // للنماذج الأخرى، نفترض وجود حقل createdBy
          if (document.createdBy) {
            isOwner = document.createdBy.toString() === req.user.id;
          }
      }

      if (isOwner) {
        req.document = document;
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل هذا المورد'
      });
    } catch (error) {
      console.error(`Error in content ownership middleware for ${modelName}:`, error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من ملكية المحتوى'
      });
    }
  };
};

/**
 * التحقق من صلاحيات الحذف
 * @returns {Function} وسيط Express
 */
const deletePermissions = () => {
  return async (req, res, next) => {
    try {
      // الروت يمكنه حذف أي شيء
      if (req.user.role === 'root') {
        return next();
      }

      // الإدارة يمكنها حذف معظم الأشياء
      if (req.user.role === 'admin') {
        // لا يمكن للإدارة حذف الروت أو الإدارة الأخرى
        if (req.params.id && req.baseUrl.includes('/users/')) {
          const User = require('../models/User');
          const user = await User.findById(req.params.id).select('role');
          
          if (user && (user.role === 'root' || user.role === 'admin')) {
            return res.status(403).json({
              success: false,
              message: 'لا يمكن حذف حسابات الإدارة والروت'
            });
          }
        }
        return next();
      }

      // الأساتذة يمكنهم حذف محتواهم فقط
      if (req.user.role === 'professor') {
        return next(); // سيتم التحقق من الملكية في الوسيط التالي
      }

      // الطلاب والضيوف لا يمكنهم حذف أي شيء
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للحذف'
      });
    } catch (error) {
      console.error('Error in delete permissions middleware:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من صلاحيات الحذف'
      });
    }
  };
};

/**
 * التحقق من صلاحيات الوصول للتقارير
 * @returns {Function} وسيط Express
 */
const reportAccess = () => {
  return async (req, res, next) => {
    try {
      // فقط الروت والإدارة يمكنهم الوصول للتقارير
      if (req.user.role === 'root' || req.user.role === 'admin') {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول للتقارير'
      });
    } catch (error) {
      console.error('Error in report access middleware:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من صلاحيات التقارير'
      });
    }
  };
};

/**
 * وسيط للتحقق من أن المستخدم ليس ضيفاً
 * @returns {Function} وسيط Express
 */
const notGuest = () => {
  return (req, res, next) => {
    if (req.user.role === 'guest') {
      return res.status(403).json({
        success: false,
        message: 'هذه الميزة غير متاحة للضيوف'
      });
    }
    next();
  };
};

/**
 * وسيط للتحقق من أن المستخدم طالب
 * @returns {Function} وسيط Express
 */
const isStudent = () => {
  return (req, res, next) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'هذه الميزة متاحة للطلاب فقط'
      });
    }
    next();
  };
};

/**
 * وسيط للتحقق من أن المستخدم أستاذ
 * @returns {Function} وسيط Express
 */
const isProfessor = () => {
  return (req, res, next) => {
    if (req.user.role !== 'professor') {
      return res.status(403).json({
        success: false,
        message: 'هذه الميزة متاحة للأساتذة فقط'
      });
    }
    next();
  };
};

/**
 * وسيط للتحقق من أن المستخدم إداري
 * @returns {Function} وسيط Express
 */
const isAdmin = () => {
  return (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'هذه الميزة متاحة للإدارة فقط'
      });
    }
    next();
  };
};

/**
 * وسيط للتحقق من أن المستخدم رووت
 * @returns {Function} وسيط Express
 */
const isRoot = () => {
  return (req, res, next) => {
    if (req.user.role !== 'root') {
      return res.status(403).json({
        success: false,
        message: 'هذه الميزة متاحة للروت فقط'
      });
    }
    next();
  };
};

module.exports = {
  permissions,
  courseAccess,
  departmentAccess,
  forumAccess,
  uploadPermissions,
  contentOwnership,
  deletePermissions,
  reportAccess,
  notGuest,
  isStudent,
  isProfessor,
  isAdmin,
  isRoot
};
