const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// استيراد المسارات
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const fileRoutes = require('./routes/files');
const forumRoutes = require('./routes/forum');
const adminRoutes = require('./routes/admin');

const app = express();

// middleware الأساسية
app.use(helmet());
app.use(cors({
  origin: ['http://192.168.83.219', 'http://192.168.111.129:9000', 'http://localhost:9000'],
  credentials: true
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));
app.use(morgan('combined'));

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 1000, // 1000 طلب لكل IP
  message: 'لقد تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.'
});
app.use('/api', limiter);

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);

// health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    service: 'Engineering Library API'
  });
});

// static files للـ React build
app.use(express.static(path.join(__dirname, '../../client/build')));

// جميع الطلبات الأخرى تذهب لـ React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

// التعامل مع الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// الاتصال بقاعدة البيانات وتشغيل السيرفر
const PORT = process.env.PORT || 9000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/engineering_library';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 السيرفر يعمل على: http://192.168.111.129:${PORT}`);
    console.log(`🌐 يمكن الوصول من: http://192.168.83.219:${PORT}`);
    console.log(`🔧 البيئة: ${process.env.NODE_ENV}`);
  });
})
.catch(err => {
  console.error('❌ فشل الاتصال بقاعدة البيانات:', err);
  process.exit(1);
});

module.exports = app;
