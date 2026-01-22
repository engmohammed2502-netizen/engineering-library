const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const { auth, permissions, uploadMiddleware } = require('../middleware');
const File = require('../models/File');
const Course = require('../models/Course');
const SecurityAlert = require('../models/SecurityAlert');
const { validateFileUpload } = require('../utils/validators');

// إنشاء مجلد التحميلات إذا لم يكن موجوداً
const createUploadsDirectory = () => {
  const uploadsPath = process.env.UPLOAD_PATH || './uploads';
  const coursesPath = path.join(uploadsPath, 'courses');
  const forumPath = path.join(uploadsPath, 'forum');
  
  fs.ensureDirSync(uploadsPath);
  fs.ensureDirSync(coursesPath);
  fs.ensureDirSync(forumPath);
  
  // إنشاء مجلدات التخصصات
  const departments = ['electrical', 'chemical', 'civil', 'mechanical', 'medical'];
  departments.forEach(dept => {
    const deptPath = path.join(coursesPath, dept);
    fs.ensureDirSync(deptPath);
  });
  
  return uploadsPath;
};

// تهيئة تخزين multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = createUploadsDirectory();
    let uploadPath = uploadsPath;
    
    // تحديد مسار التحميل بناءً على نوع الملف
    if (req.baseUrl.includes('courses')) {
      uploadPath = path.join(uploadsPath, 'courses');
      
      // إذا كان هناك تخصص محدد
      if (req.body.department) {
        const deptPath = path.join(uploadPath, req.body.department);
        fs.ensureDirSync(deptPath);
        uploadPath = deptPath;
      }
    } else if (req.baseUrl.includes('forum')) {
      uploadPath = path.join(uploadsPath, 'forum');
    }
    
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // إنشاء اسم فريد للملف
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = path.basename(file.originalname, extension);
    
    // استبدال المسافات والأحرف الخاصة
    const safeFilename = filename
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]/g, '')
      .substring(0, 100);
    
    cb(null, `${safeFilename}-${uniqueSuffix}${extension}`);
  }
});

// فلترة الملفات
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'zip', 'rar', '7z', 'exe', 'mp4', 'avi', 'mov', 'wmv'];
  
  const extension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error(`نوع الملف غير مسموح: ${extension}. الأنواع المسموحة: ${allowedTypes.join(', ')}`), false);
  }
};

// إعداد multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 157286400 // 150MB
  }
});

const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const extension = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (allowedTypes.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error(`نوع الصورة غير مسموح: ${extension}. الأنواع المسموحة: ${allowedTypes.join(', ')}`), false);
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 3145728 // 3MB
  }
});

/**
 * @route   POST /api/files/upload/course/:courseId
 * @desc    رفع ملف لمادة دراسية
 * @access  Private/Professor,Admin,Root
 */
router.post('/upload/course/:courseId', 
  auth, 
  permissions(['professor', 'admin', 'root']),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'لم يتم تحميل أي ملف'
        });
      }
      
      const { courseId } = req.params;
      const { type, category, description } = req.body;
      
      // التحقق من صحة البيانات
      const { error } = validateFileUpload({
        type,
        category,
        description,
        file: req.file
      });
      
      if (error) {
        // حذف الملف المرفوع
        await fs.remove(req.file.path);
        
        return res.status(400).json({
          success: false,
          message: 'بيانات غير صالحة',
          errors: error.details.map(detail => detail.message)
        });
      }
      
      // التحقق من وجود المادة
      const course = await Course.findById(courseId);
      
      if (!course) {
        await fs.remove(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'المادة غير موجودة'
        });
      }
      
      // التحقق من صلاحية الوصول
      if (req.user.role === 'professor' && course.professorId.toString() !== req.user.id) {
        await fs.remove(req.file.path);
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية رفع ملفات لهذه المادة'
        });
      }
      
      // إنشاء سجل الملف
      const file = new File({
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        type,
        category,
        description,
        course: courseId,
        department: course.department,
        uploadedBy: req.user.id,
        downloadCount: 0
      });
      
      await file.save();
      
      // تحديث المادة لإضافة الملف
      course.files.push(file._id);
      course.updatedAt = Date.now();
      course.lastUpdatedBy = req.user.id;
      await course.save();
      
      // تسجيل التنبيه الأمني
      await SecurityAlert.create({
        type: 'file_upload',
        severity: 'low',
        title: 'رفع ملف لمادة دراسية',
        description: `تم رفع ملف "${req.file.originalname}" للمادة "${course.name}"`,
        user: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          courseId: course._id,
          courseName: course.name,
          fileId: file._id,
          fileName: req.file.originalname,
          fileType: type,
          fileCategory: category,
          fileSize: req.file.size
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'تم رفع الملف بنجاح',
        data: {
          id: file._id,
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          type: file.type,
          category: file.category,
          description: file.description,
          uploadedBy: file.uploadedBy,
          downloadCount: file.downloadCount,
          createdAt: file.createdAt
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // حذف الملف في حالة الخطأ
      if (req.file && req.file.path) {
        try {
          await fs.remove(req.file.path);
        } catch (fsError) {
          console.error('Error removing file:', fsError);
        }
      }
      
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `حجم الملف كبير جداً. الحد الأقصى ${parseInt(process.env.MAX_FILE_SIZE) / (1024 * 1024)} ميجابايت`
          });
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'خطأ في رفع الملف'
      });
    }
  }
);

/**
 * @route   POST /api/files/upload/forum
 * @desc    رفع صورة للمنتدى
 * @access  Private (جميع المستخدمين عدا الضيوف)
 */
router.post('/upload/forum', 
  auth,
  permissions(['student', 'professor', 'admin', 'root']),
  uploadImage.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'لم يتم تحميل أي صورة'
        });
      }
      
      // التحقق من عدد الصور المرفوعة (الحد الأقصى 5)
      const userUploads = await File.countDocuments({
        uploadedBy: req.user.id,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // آخر 24 ساعة
      });
      
      if (userUploads >= 20) {
        await fs.remove(req.file.path);
        return res.status(429).json({
          success: false,
          message: 'لقد تجاوزت الحد الأقصى لعدد الصور المرفوعة اليوم'
        });
      }
      
      // إنشاء سجل الملف
      const file = new File({
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        type: 'forum_image',
        category: 'forum',
        uploadedBy: req.user.id,
        isPublic: true
      });
      
      await file.save();
      
      res.status(201).json({
        success: true,
        message: 'تم رفع الصورة بنجاح',
        data: {
          id: file._id,
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          url: `/api/files/${file._id}`
        }
      });
    } catch (error) {
      console.error('Error uploading forum image:', error);
      
      // حذف الملف في حالة الخطأ
      if (req.file && req.file.path) {
        try {
          await fs.remove(req.file.path);
        } catch (fsError) {
          console.error('Error removing file:', fsError);
        }
      }
      
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `حجم الصورة كبير جداً. الحد الأقصى ${parseInt(process.env.MAX_IMAGE_SIZE) / (1024 * 1024)} ميجابايت`
          });
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'خطأ في رفع الصورة'
      });
    }
  }
);

/**
 * @route   GET /api/files/:id
 * @desc    الحصول على معلومات ملف
 * @access  Private (حسب صلاحية الملف)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('uploadedBy', 'name role')
      .populate('course', 'name code department');
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود'
      });
    }
    
    // التحقق من صلاحية الوصول
    if (file.type === 'forum_image' && file.isPublic) {
      // صور المنتدى العامة يمكن للجميع رؤيتها
    } else if (file.course) {
      // ملفات المواد تحتاج صلاحية للوصول
      const course = await Course.findById(file.course._id);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'المادة غير موجودة'
        });
      }
      
      // التحقق من صلاحية الوصول للمادة
      if (req.user.role === 'professor' && course.professorId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لهذا الملف'
        });
      }
    } else {
      // ملفات أخرى (للتحميل المباشر)
      if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'root') {
        return res.status(403).json({
