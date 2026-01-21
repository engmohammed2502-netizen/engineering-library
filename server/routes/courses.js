const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Course = require('../models/Course');
const File = require('../models/File');
const router = express.Router();

// الحصول على المواد حسب التخصص والسمستر
router.get('/', auth, async (req, res) => {
  try {
    const { department, semester } = req.query;
    const filter = {};
    
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    
    const courses = await Course.find(filter)
      .populate('professor', 'username displayName')
      .sort({ semester: 1, name: 1 });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المواد' });
  }
});

// إضافة مادة جديدة (للأساتذة والروت فقط)
router.post('/', auth, authorize('professor', 'root'), async (req, res) => {
  try {
    const { name, code, semester, department, description } = req.body;
    
    const course = new Course({
      name,
      code,
      semester,
      department,
      description,
      professor: req.user._id
    });
    
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: 'خطأ في إضافة المادة' });
  }
});

// رفع ملف لمادة
router.post('/:courseId/upload', auth, authorize('professor', 'root'), 
  upload.single('file'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'المادة غير موجودة' });
    }
    
    // إنشاء سجل الملف
    const file = new File({
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type,
      course: courseId,
      uploadedBy: req.user._id
    });
    
    await file.save();
    
    // إضافة الملف للمادة
    course.files.push({
      name: file.originalname,
      originalName: file.originalname,
      type: file.type,
      path: file.path,
      size: file.size,
      uploadedBy: req.user._id,
      uploadDate: new Date()
    });
    
    course.lastUpdated = new Date();
    await course.save();
    
    res.json({
      message: 'تم رفع الملف بنجاح',
      file
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في رفع الملف' });
  }
});

// تنزيل ملف
router.get('/files/:fileId/download', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'الملف غير موجود' });
    }
    
    // زيادة عداد التنزيلات
    file.downloads += 1;
    await file.save();
    
    res.download(file.path, file.originalname);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تنزيل الملف' });
  }
});

module.exports = router;
