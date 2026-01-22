const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, permissions } = require('../middleware');
const Forum = require('../models/Forum');
const ForumMessage = require('../models/ForumMessage');
const Course = require('../models/Course');
const User = require('../models/User');
const SecurityAlert = require('../models/SecurityAlert');
const { validateForumMessage, validateForumReply } = require('../utils/validators');

/**
 * @route   GET /api/forum/course/:courseId
 * @desc    الحصول على منتديات مادة دراسية
 * @access  Private (حسب صلاحية المادة)
 */
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // التحقق من وجود المادة
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المادة غير موجودة'
      });
    }
    
    // التحقق من صلاحية الوصول
    if (req.user.role === 'professor' && course.professorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذه المادة'
      });
    }
    
    // الحصول على منتديات المادة
    const forums = await Forum.find({ course: courseId, isActive: true })
      .sort({ createdAt: -1 })
      .populate('lastMessage')
      .lean();
    
    // حساب عدد الرسائل لكل منتدى
    for (const forum of forums) {
      forum.messageCount = await ForumMessage.countDocuments({ forum: forum._id });
    }
    
    res.json({
      success: true,
      data: forums
    });
  } catch (error) {
    console.error('Error getting course forums:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب منتديات المادة'
    });
  }
});

/**
 * @route   POST /api/forum
 * @desc    إنشاء منتدى جديد
 * @access  Private/Professor,Admin,Root
 */
router.post('/', auth, permissions(['professor', 'admin', 'root']), async (req, res) => {
  try {
    const { courseId, name, description } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!courseId || !name || !description) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }
    
    // التحقق من وجود المادة
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المادة غير موجودة'
      });
    }
    
    // التحقق من صلاحية الوصول
    if (req.user.role === 'professor' && course.professorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لإنشاء منتدى لهذه المادة'
      });
    }
    
    // إنشاء المنتدى
    const forum = new Forum({
      name,
      description,
      course: courseId,
      createdBy: req.user.id,
      isActive: true
    });
    
    await forum.save();
    
    // تسجيل التنبيه الأمني
    await SecurityAlert.create({
      type: 'forum_creation',
      severity: 'low',
      title: 'إنشاء منتدى جديد',
      description: `تم إنشاء منتدى جديد "${name}" للمادة "${course.name}"`,
      user: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        forumId: forum._id,
        forumName: name,
        courseId: course._id,
        courseName: course.name
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء المنتدى بنجاح',
      data: forum
    });
  } catch (error) {
    console.error('Error creating forum:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المنتدى'
    });
  }
});

/**
 * @route   GET /api/forum/:forumId
 * @desc    الحصول على معلومات منتدى
 * @access  Private (حسب صلاحية المادة)
 */
router.get('/:forumId', auth, async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.forumId)
      .populate('course', 'name code department professorId')
      .populate('createdBy', 'name role');
    
    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'المنتدى غير موجود'
      });
    }
    
    // التحقق من صلاحية الوصول
    const course = await Course.findById(forum.course._id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المادة غير موجودة'
      });
    }
    
    if (req.user.role === 'professor' && course.professorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا المنتدى'
      });
    }
    
    // الحصول على إحصائيات المنتدى
    const messageCount = await ForumMessage.countDocuments({ forum: forum._id });
    const userCount = await ForumMessage.distinct('userId', { forum: forum._id });
    
    res.json({
      success: true,
      data: {
        ...forum.toObject(),
        stats: {
          messageCount,
          userCount: userCount.length,
          lastActivity: forum.lastMessage ? forum.lastMessage.createdAt : forum.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error getting forum:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب معلومات المنتدى'
    });
  }
});

/**
 * @route   PUT /api/forum/:forumId
 * @desc    تحديث معلومات منتدى
 * @access  Private/Professor,Admin,Root (مالك المادة أو أعلى)
 */
router.put('/:forumId', auth, permissions(['professor', 'admin', 'root']), async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const forum = await Forum.findById(req.params.forumId)
      .populate('course', 'professorId');
    
    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'المنتدى غير موجود'
      });
    }
    
    // التحقق من صلاحية التعديل
    if (req.user.role === 'professor' && forum.course.professorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل هذا المنتدى'
      });
    }
    
    // تحديث البيانات
    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;
    
    Object.assign(forum, updates);
    forum.updatedAt = Date.now();
    await forum.save();
    
    res.json({
      success: true,
      message: 'تم تحديث المنتدى بنجاح',
      data: forum
    });
  } catch (error) {
    console.error('Error updating forum:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المنتدى'
    });
  }
});

/**
 * @route   DELETE /api/forum/:forumId
 * @desc    حذف منتدى
 * @access  Private/Professor,Admin,Root (مالك المادة أو أعلى)
 */
router.delete('/:forumId', auth, permissions(['professor', 'admin', 'root']), async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.forumId)
      .populate('course', 'professorId');
    
    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'المنتدى غير موجود'
      });
    }
    
    // التحقق من صلاحية الحذف
    if (req.user.role === 'professor' && forum.course.professorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف هذا المنتدى'
      });
    }
    
    // حذف جميع رسائل المنتدى أولاً
    await ForumMessage.deleteMany({ forum: forum._id });
    
    // حذف المنتدى
    await forum.deleteOne();
    
    // تسجيل التنبيه الأمني
    await SecurityAlert.create({
      type: 'forum_deletion',
      severity: 'medium',
      title: 'حذف منتدى',
      description: `تم حذف المنتدى "${forum.name}"`,
      user: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        forumId: forum._id,
        forumName: forum.name,
        courseId: forum.course._id
      }
    });
    
    res.json({
      success: true,
      message: 'تم حذف المنتدى بنجاح'
    });
  } catch (error) {
    console.error('Error deleting forum:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المنتدى'
    });
  }
});

/**
 * @route   GET /api/forum/:forumId/messages
 * @desc    الحصول على رسائل منتدى
 * @access  Private (حسب صلاحية المادة)
 */
router.get('/:forumId/messages', auth, async (req, res) => {
  try {
    const { forumId } = req.params;
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // التحقق من وجود المنتدى
    const forum = await Forum.findById(forumId).populate('course', 'professorId');
    
    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'المنتدى غير موجود'
      });
    }
    
    // التحقق من صلاحية الوصول
    if (req.user.role === 'professor' && forum.course.professorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا المنتدى'
      });
    }
    
    // التحقق من أن المنتدى نشط
    if (!forum.isActive) {
      return res.status(403).json({
        success: false,
        message: 'المنتدى غير نشط حالياً'
      });
    }
    
    // بناء فلتر البحث
    const filter = { forum: forumId };
    
    // استبعاد الرسائل المحذوفة
    filter.isDeleted = { $ne: true };
    
    // تحديد الترتيب
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'userId', select: 'name role avatar department' },
        { 
          path: 'replies',
          populate: { path: 'userId', select: 'name role avatar' }
        }
      ]
    };
    
    const messages = await ForumMessage.paginate(filter, options);
    
    res.json({
      success: true,
      data: {
        forum: {
          id: forum._id,
          name: forum.name,
          description: forum.description
        },
        messages: messages.docs,
        pagination: {
          total: messages.totalDocs,
          page: messages.page,
          pages: messages.totalPages,
          limit: messages.limit
        }
      }
    });
  } catch (error) {
    console.error('Error getting forum messages:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب رسائل المنتدى'
    });
  }
});

/**
 * @route   POST /api/forum/:forumId/messages
 * @desc    إرسال رسالة جديدة في منتدى
 * @access  Private (جميع المستخدمين عدا الضيوف)
 */
router.post('/:forumId/messages', 
  auth,
  permissions(['student', 'professor', 'admin', 'root']),
  async (req, res) => {
    try {
      const { forumId } = req.params;
      const { content, replyTo } = req.body;
      
      // التحقق من صحة البيانات
      const { error } = validateForumMessage({ content });
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'بيانات غير صالحة',
          errors: error.details.map(detail => detail.message)
        });
      }
      
      // التحقق من وجود المنتدى
      const forum = await Forum.findById(forumId).populate('course', 'professorId');
      
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
      
      // التحقق من صلاحية الوصول
      if (req.user.role === 'professor' && forum.course.professorId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للنشر في هذا المنتدى'
        });
      }
      
      // التحقق من الرسالة الأصلية إذا كان رداً
      let parentMessage = null;
      if (replyTo) {
        parentMessage = await ForumMessage.findById(replyTo);
        
        if (!parentMessage) {
          return res.status(404).json({
            success: false,
            message: 'الرسالة الأصلية غير موجودة'
          });
        }
        
        if (parentMessage.forum.toString() !== forumId) {
          return res.status(400).json({
            success: false,
            message: 'لا يمكن الرد على رسالة من منتدى آخر'
          });
        }
      }
      
      // إنشاء الرسالة
      const message = new ForumMessage({
        content,
        forum: forumId,
        userId: req.user.id,
        replyTo: replyTo || null,
        isEdited: false,
        isPinned: false,
        likes: [],
        replies: []
      });
      
      await message.save();
      
      // إذا كان رداً، إضافته للرسالة الأصلية
      if (parentMessage) {
        parentMessage.replies.push(message._id);
        await parentMessage.save();
      }
      
      // تحديث آخر رسالة في المنتدى
      forum.lastMessage = message._id;
      forum.updatedAt = Date.now();
      await forum.save();
      
      // تسجيل التنبيه الأمني للمحتوى المشبوه
      const suspiciousWords = ['hack', 'crack', 'exploit', 'bypass', 'admin123'];
      const containsSuspicious = suspiciousWords.some(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
      
      if (containsSuspicious) {
        await SecurityAlert.create({
          type: 'suspicious_activity',
          severity: 'medium',
          title: 'محتوى مشبوه في المنتدى',
          description: `تم نشر محتوى مشبوه في المنتدى "${forum.name}"`,
          user: req.user.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            forumId: forum._id,
            forumName: forum.name,
            messageId: message._id,
            contentPreview: content.substring(0, 200)
          }
        });
      }
      
      // الحصول على الرسالة مع بيانات المستخدم
      const populatedMessage = await ForumMessage.findById(message._id)
        .populate('userId', 'name role avatar department')
        .populate({
          path: 'replies',
          populate: { path: 'userId', select: 'name role avatar' }
        });
      
      res.status(201).json({
        success: true,
        message: 'تم إرسال الرسالة بنجاح',
        data: populatedMessage
      });
    } catch (error) {
      console.error('Error posting forum message:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في إرسال الرسالة'
      });
    }
  }
);

/**
 * @route   PUT /api/forum/messages/:messageId
 * @desc    تحديث رسالة منتدى
 * @access  Private (كاتب الرسالة أو الإدارة)
 */
router.put('/messages/:messageId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await ForumMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'الرسالة غير موجودة'
      });
    }
    
    // التحقق من صلاحية التعديل
    const canEdit = message.userId.toString() === req.user.id || 
                   req.user.role === 'admin' || 
                   req.user.role === 'root';
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل هذه الرسالة'
      });
    }
    
    // التحقق من صحة البيانات
    const { error } = validateForumMessage({ content });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صالحة',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    // تحديث الرسالة
    message.content = content;
    message.isEdited = true;
    message.updatedAt = Date.now();
    
    await message.save();
    
    res.json({
      success: true,
      message: 'تم تحديث الرسالة بنجاح',
      data: message
    });
  } catch (error) {
    console.error('Error updating forum message:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الرسالة'
    });
  }
});

/**
 * @route   DELETE /api/forum/messages/:messageId
 * @desc    حذف رسالة منتدى
 * @access  Private (كاتب الرسالة أو الإدارة)
 */
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const message = await ForumMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'الرسالة غير موجودة'
      });
    }
    
    // التحقق من صلاحية الحذف
    const canDelete = message.userId.toString() === req.user.id || 
                     req.user.role === 'admin' || 
                     req.user.role === 'root';
    
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف هذه الرسالة'
      });
    }
    
    // إذا كانت الرسالة لها ردود، نعطلها فقط بدلاً من الحذف
    if (message.replies.length > 0) {
      message.isDeleted = true;
      message.content = 'تم حذف هذه الرسالة';
      await message.save();
    } else {
      // حذف الرسالة تماماً إذا لم يكن لها ردود
      await message.deleteOne();
    }
    
    // تسجيل التنبيه الأمني
    await SecurityAlert.create({
      type: 'forum_message_deletion',
      severity: 'low',
      title: 'حذف رسالة منتدى',
      description: 'تم حذف رسالة من المنتدى',
      user: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        messageId: message._id,
        forumId: message.forum,
        deletedBy: req.user.id
      }
    });
    
    res.json({
      success: true,
      message: 'تم حذف الرسالة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting forum message:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الرسالة'
    });
  }
});

/**
 * @route   POST /api/forum/messages/:messageId/like
 * @desc    الإعجاب برسالة منتدى
 * @access  Private (جميع المستخدمين عدا الضيوف)
 */
router.post('/messages/:messageId/like', 
  auth,
  permissions(['student', 'professor', 'admin', 'root']),
  async (req, res) => {
    try {
      const message = await ForumMessage.findById(req.params.messageId);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'الرسالة غير موجودة'
        });
      }
      
      // التحقق من أن المستخدم لم يعجب بالرسالة مسبقاً
      const alreadyLiked = message.likes.includes(req.user.id);
      
      if (alreadyLiked) {
        return res.status(400).json({
          success: false,
          message: 'لقد أبديت إعجابك بهذه الرسالة مسبقاً'
        });
      }
      
      // إضافة الإعجاب
      message.likes.push(req.user.id);
      await message.save();
      
      res.json({
        success: true,
        message: 'تم تسجيل إعجابك بالرسالة',
        data: {
          likes: message.likes,
          likeCount: message.likes.length
        }
      });
    } catch (error) {
      console.error('Error liking forum message:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في تسجيل الإعجاب'
      });
    }
  }
);

/**
 * @route   DELETE /api/forum/messages/:messageId/like
 * @desc    إلغاء الإعجاب برسالة منتدى
 * @access  Private (جميع المستخدمين عدا الضيوف)
 */
router.delete('/messages/:messageId/like', 
  auth,
  permissions(['student', 'professor', 'admin', 'root']),
  async (req, res) => {
    try {
      const message = await ForumMessage.findById(req.params.messageId);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'الرسالة غير موجودة'
        });
      }
      
      // التحقق من أن المستخدم معجب بالرسالة
      const likedIndex = message.likes.indexOf(req.user.id);
      
      if (likedIndex === -1) {
        return res.status(400).json({
          success: false,
          message: 'لم تكن معجباً بهذه الرسالة'
        });
      }
      
      // إزالة الإعجاب
      message.likes.splice(likedIndex, 1);
      await message.save();
      
      res.json({
        success: true,
        message: 'تم إلغاء إعجابك بالرسالة',
        data: {
          likes: message.likes,
          likeCount: message.likes.length
        }
      });
    } catch (error) {
      console.error('Error unliking forum message:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في إلغاء الإعجاب'
      });
    }
  }
);

/**
 * @route   POST /api/forum/messages/:messageId/replies
 * @desc    إضافة رد على رسالة منتدى
 * @access  Private (جميع المستخدمين عدا الضيوف)
 */
router.post('/messages/:messageId/replies', 
  auth,
  permissions(['student', 'professor', 'admin', 'root']),
  async (req, res) => {
    try {
      const { content } = req.body;
      const message = await ForumMessage.findById(req.params.messageId);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'الرسالة غير موجودة'
        });
      }
      
      // التحقق من صحة البيانات
      const { error } = validateForumReply({ content });
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'بيانات غير صالحة',
          errors: error.details.map(detail => detail.message)
        });
      }
      
      // إنشاء الرد
      const reply = new ForumMessage({
        content,
        forum: message.forum,
        userId: req.user.id,
        replyTo: message._id,
        isEdited: false,
        isPinned: false,
        likes: [],
        replies: []
      });
      
      await reply.save();
      
      // إضافة الرد للرسالة الأصلية
      message.replies.push(reply._id);
      await message.save();
      
      // تحديث آخر رسالة في المنتدى
      const forum = await Forum.findById(message.forum);
      if (forum) {
        forum.lastMessage = reply._id;
        forum.updatedAt = Date.now();
        await forum.save();
      }
      
      // الحصول على الرد مع بيانات المستخدم
      const populatedReply = await ForumMessage.findById(reply._id)
        .populate('userId', 'name role avatar department');
      
      res.status(201).json({
        success: true,
        message: 'تم إضافة الرد بنجاح',
        data: populatedReply
      });
    } catch (error) {
      console.error('Error adding forum reply:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في إضافة الرد'
      });
    }
  }
);

/**
 * @route   PUT /api/forum/messages/:messageId/pin
 * @desc    تثبيت أو إلغاء تثبيت رسالة (للإدارة فقط)
 * @access  Private/Admin,Root
 */
router.put('/messages/:messageId/pin', auth, permissions(['admin', 'root']), async (req, res) => {
  try {
    const { pinned } = req.body;
    const message = await ForumMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'الرسالة غير موجودة'
      });
    }
    
    message.isPinned = pinned === true;
    message.updatedAt = Date.now();
    await message.save();
    
    res.json({
      success: true,
      message: message.isPinned ? 'تم تثبيت الرسالة' : 'تم إلغاء تثبيت الرسالة',
      data: {
        isPinned: message.isPinned
      }
    });
  } catch (error) {
    console.error('Error pinning/unpinning message:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في عملية التثبيت'
    });
  }
});

/**
 * @route   GET /api/forum/search/:forumId
 * @desc    البحث في رسائل منتدى
 * @access  Private (حسب صلاحية المادة)
 */
router.get('/search/:forumId', auth, async (req, res) => {
  try {
    const { forumId } = req.params;
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال كلمة بحث مكونة من حرفين على الأقل'
      });
    }
    
    // التحقق من وجود المنتدى
    const forum = await Forum.findById(forumId).populate('course', 'professorId');
    
    if (!forum) {
      return res.status(404).json({
        success: false,
        message: 'المنتدى غير موجود'
      });
    }
    
    // التحقق من صلاحية الوصول
    if (req.user.role === 'professor' && forum.course.professorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا المنتدى'
      });
    }
    
    // بناء فلتر البحث
    const filter = {
      forum: forumId,
      content: { $regex: q, $options: 'i' },
      isDeleted: { $ne: true }
    };
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'userId', select: 'name role avatar' },
        { 
          path: 'replies',
          populate: { path: 'userId', select: 'name role avatar' }
        }
      ]
    };
    
    const messages = await ForumMessage.paginate(filter, options);
    
    res.json({
      success: true,
      data: {
        forum: {
          id: forum._id,
          name: forum.name
        },
        messages: messages.docs,
        pagination: {
          total: messages.totalDocs,
          page: messages.page,
          pages: messages.totalPages,
          limit: messages.limit
        }
      }
    });
  } catch (error) {
    console.error('Error searching forum messages:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث'
    });
  }
});

/**
 * @route   GET /api/forum/stats/overview
 * @desc    الحصول على إحصائيات المنتدى (للإدارة فقط)
 * @access  Private/Admin,Root
 */
router.get('/stats/overview', auth, permissions(['admin', 'root']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    
    // إحصائيات عامة
    const stats = await ForumMessage.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          totalReplies: { $sum: { $size: '$replies' } },
          totalLikes: { $sum: { $size: '$likes' } },
          activeUsers: { $addToSet: '$userId' }
        }
      }
    ]);
    
    // المنتديات الأكثر نشاطاً
    const activeForums = await ForumMessage.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$forum',
          messageCount: { $sum: 1 },
          replyCount: { $sum: { $size: '$replies' } },
          likeCount: { $sum: { $size: '$likes' } },
          lastActivity: { $max: '$createdAt' }
        }
      },
      { $sort: { messageCount: -1 } },
      { $limit: 10 }
    ]);
    
    // ملء معلومات المنتدى
    for (const forum of activeForums) {
      const forumInfo = await Forum.findById(forum._id).populate('course', 'name');
      if (forumInfo) {
        forum.name = forumInfo.name;
        forum.courseName = forumInfo.course?.name;
      }
    }
    
    // المستخدمين الأكثر نشاطاً
    const activeUsers = await ForumMessage.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          messageCount: { $sum: 1 },
          replyCount: { $sum: { $size: '$replies' } },
          likeCount: { $sum: { $size: '$likes' } },
          lastActivity: { $max: '$createdAt' }
        }
      },
      { $sort: { messageCount: -1 } },
      { $limit: 10 }
    ]);
    
    // ملء معلومات المستخدمين
    for (const user of activeUsers) {
      const userInfo = await User.findById(user._id).select('name role department');
      if (userInfo) {
        user.name = userInfo.name;
        user.role = userInfo.role;
        user.department = userInfo.department;
      }
    }
    
    const result = stats[0] || {
      totalMessages: 0,
      totalReplies: 0,
      totalLikes: 0,
      activeUsers: []
    };
    
    res.json({
      success: true,
      data: {
        totalMessages: result.totalMessages,
        totalReplies: result.totalReplies,
        totalLikes: result.totalLikes,
        activeUsersCount: result.activeUsers.length,
        activeForums,
        activeUsers
      }
    });
  } catch (error) {
    console.error('Error getting forum stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات المنتدى'
    });
  }
});

/**
 * @route   POST /api/forum/cleanup
 * @desc    تنظيف رسائل المنتدى القديمة (للإدارة فقط)
 * @access  Private/Admin,Root
 */
router.post('/cleanup', auth, permissions(['admin', 'root']), async (req, res) => {
  try {
    const { days = 365, dryRun = true } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    // البحث عن الرسائل القديمة
    const oldMessages = await ForumMessage.find({
      createdAt: { $lt: cutoffDate },
      isPinned: false,
      likes: { $size: 0 },
      replies: { $size: 0 }
    });
    
    let deletedCount = 0;
    
    if (!dryRun) {
      for (const message of oldMessages) {
        await message.deleteOne();
        deletedCount++;
      }
    }
    
    res.json({
      success: true,
      message: dryRun 
        ? `تم العثور على ${oldMessages.length} رسالة قديمة للتنظيف` 
        : `تم حذف ${deletedCount} رسالة قديمة`,
      data: {
        dryRun,
        cutoffDate,
        found: oldMessages.length,
        deleted: deletedCount
      }
    });
  } catch (error) {
    console.error('Error cleaning up forum messages:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تنظيف الرسائل'
    });
  }
});

module.exports = router;
