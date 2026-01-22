/**
 * أدوات النسخ الاحتياطي
 * توفير وظائف النسخ الاحتياطي والاستعادة للنظام
 */

const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const util = require('util');
const tar = require('tar');
const moment = require('moment');
const AuditLog = require('../models/AuditLog');

const execPromise = util.promisify(exec);

// إعدادات النسخ الاحتياطي
const BACKUP_CONFIG = {
  path: process.env.BACKUP_PATH || '/var/backups/engineering-library',
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 90,
  maxBackups: parseInt(process.env.BACKUP_MAX_COUNT) || 10,
  schedule: process.env.BACKUP_SCHEDULE || '0 0 1 * *', // أول يوم من كل شهر
  includeDatabase: true,
  includeUploads: true,
  includeLogs: true,
  includeConfig: true
};

/**
 * إنشاء نسخة احتياطية كاملة للنظام
 * @param {Object} options - خيارات النسخ الاحتياطي
 * @returns {Promise<Object>} معلومات النسخة الاحتياطية
 */
async function createBackup(options = {}) {
  const backupId = `backup-${moment().format('YYYY-MM-DD-HHmmss')}`;
  const backupPath = path.join(BACKUP_CONFIG.path, backupId);
  const tempPath = path.join('/tmp', backupId);
  
  try {
    // تسجيل بدء النسخ الاحتياطي
    await AuditLog.create({
      level: 'info',
      action: 'backup_start',
      message: `بدأ إنشاء النسخة الاحتياطية: ${backupId}`,
      metadata: { backupId, options }
    });
    
    // إنشاء المجلدات المؤقتة
    await fs.ensureDir(tempPath);
    await fs.ensureDir(backupPath);
    
    const backupInfo = {
      id: backupId,
      timestamp: new Date(),
      status: 'in_progress',
      steps: []
    };
    
    // 1. نسخ قاعدة البيانات
    if (options.includeDatabase !== false && BACKUP_CONFIG.includeDatabase) {
      backupInfo.steps.push(await backupDatabase(tempPath));
    }
    
    // 2. نسخ ملفات التحميل
    if (options.includeUploads !== false && BACKUP_CONFIG.includeUploads) {
      backupInfo.steps.push(await backupUploads(tempPath));
    }
    
    // 3. نسخ السجلات
    if (options.includeLogs !== false && BACKUP_CONFIG.includeLogs) {
      backupInfo.steps.push(await backupLogs(tempPath));
    }
    
    // 4. نسخ ملفات الإعداد
    if (options.includeConfig !== false && BACKUP_CONFIG.includeConfig) {
      backupInfo.steps.push(await backupConfig(tempPath));
    }
    
    // 5. إنشاء ملف المعلومات
    backupInfo.steps.push(await createBackupInfoFile(tempPath, backupInfo));
    
    // 6. ضغط النسخة الاحتياطية
    const archivePath = await compressBackup(tempPath, backupPath);
    
    // 7. تنظيف المجلد المؤقت
    await fs.remove(tempPath);
    
    // تحديث معلومات النسخة الاحتياطية
    backupInfo.status = 'completed';
    backupInfo.archivePath = archivePath;
    backupInfo.size = await getFileSize(archivePath);
    backupInfo.duration = Date.now() - backupInfo.timestamp.getTime();
    
    // حفظ معلومات النسخة الاحتياطية
    await saveBackupInfo(backupPath, backupInfo);
    
    // تسجيل نجاح النسخ الاحتياطي
    await AuditLog.create({
      level: 'info',
      action: 'backup_complete',
      message: `تم إنشاء النسخة الاحتياطية بنجاح: ${backupId}`,
      metadata: {
        backupId,
        size: backupInfo.size,
        duration: backupInfo.duration,
        steps: backupInfo.steps.length
      }
    });
    
    // تنظيف النسخ القديمة
    await cleanupOldBackups();
    
    return backupInfo;
  } catch (error) {
    console.error('Error creating backup:', error);
    
    // تسجيل فشل النسخ الاحتياطي
    await AuditLog.create({
      level: 'error',
      action: 'backup_failed',
      message: `فشل إنشاء النسخة الاحتياطية: ${backupId}`,
      metadata: {
        backupId,
        error: error.message,
        stack: error.stack
      }
    });
    
    // تنظيف الملفات المؤقتة في حالة الخطأ
    try {
      await fs.remove(tempPath);
      await fs.remove(backupPath);
    } catch (cleanupError) {
      console.error('Error cleaning up after failed backup:', cleanupError);
    }
    
    throw error;
  }
}

/**
 * نسخ قاعدة البيانات
 * @param {string} tempPath - المسار المؤقت
 * @returns {Promise<Object>} معلومات الخطوة
 */
async function backupDatabase(tempPath) {
  const startTime = Date.now();
  const dbPath = path.join(tempPath, 'database');
  
  try {
    await fs.ensureDir(dbPath);
    
    // تصدير كل المجموعات (collections)
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const documents = await mongoose.connection.db.collection(collectionName).find({}).toArray();
      
      if (documents.length > 0) {
        const collectionFile = path.join(dbPath, `${collectionName}.json`);
        await fs.writeJSON(collectionFile, documents, { spaces: 2 });
      }
    }
    
    // تصدير باستخدام mongodump إذا كان متاحاً
    try {
      const mongodumpPath = path.join(dbPath, 'mongodump');
      await execPromise(`mongodump --uri="${process.env.MONGODB_URI}" --out="${mongodumpPath}"`);
    } catch (mongodumpError) {
      console.warn('mongodump not available, using JSON export only:', mongodumpError.message);
    }
    
    const duration = Date.now() - startTime;
    return {
      step: 'database',
      status: 'completed',
      duration,
      collections: collections.length,
      message: `تم نسخ ${collections.length} مجموعة من قاعدة البيانات`
    };
  } catch (error) {
    console.error('Error backing up database:', error);
    return {
      step: 'database',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      message: 'فشل نسخ قاعدة البيانات'
    };
  }
}

/**
 * نسخ ملفات التحميل
 * @param {string} tempPath - المسار المؤقت
 * @returns {Promise<Object>} معلومات الخطوة
 */
async function backupUploads(tempPath) {
  const startTime = Date.now();
  const uploadsPath = process.env.UPLOAD_PATH || './uploads';
  const backupUploadsPath = path.join(tempPath, 'uploads');
  
  try {
    // التحقق من وجود مجلد التحميلات
    if (!await fs.pathExists(uploadsPath)) {
      return {
        step: 'uploads',
        status: 'skipped',
        duration: Date.now() - startTime,
        message: 'مجلد التحميلات غير موجود'
      };
    }
    
    await fs.ensureDir(backupUploadsPath);
    
    // نسخ مجلد التحميلات
    await fs.copy(uploadsPath, backupUploadsPath);
    
    // حساب حجم التحميلات
    const uploadsSize = await calculateDirectorySize(uploadsPath);
    
    const duration = Date.now() - startTime;
    return {
      step: 'uploads',
      status: 'completed',
      duration,
      size: uploadsSize,
      message: `تم نسخ ملفات التحميل (${formatSize(uploadsSize)})`
    };
  } catch (error) {
    console.error('Error backing up uploads:', error);
    return {
      step: 'uploads',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      message: 'فشل نسخ ملفات التحميل'
    };
  }
}

/**
 * نسخ السجلات
 * @param {string} tempPath - المسار المؤقت
 * @returns {Promise<Object>} معلومات الخطوة
 */
async function backupLogs(tempPath) {
  const startTime = Date.now();
  const logsPath = process.env.LOG_PATH || './logs';
  const backupLogsPath = path.join(tempPath, 'logs');
  
  try {
    // التحقق من وجود مجلد السجلات
    if (!await fs.pathExists(logsPath)) {
      return {
        step: 'logs',
        status: 'skipped',
        duration: Date.now() - startTime,
        message: 'مجلد السجلات غير موجود'
      };
    }
    
    await fs.ensureDir(backupLogsPath);
    
    // نسخ ملفات السجلات
    const logFiles = await fs.readdir(logsPath);
    let copiedFiles = 0;
    
    for (const file of logFiles) {
      if (file.endsWith('.log')) {
        const sourceFile = path.join(logsPath, file);
        const destFile = path.join(backupLogsPath, file);
        await fs.copy(sourceFile, destFile);
        copiedFiles++;
      }
    }
    
    // نسخ سجلات قاعدة البيانات
    const auditLogs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(10000);
    if (auditLogs.length > 0) {
      const auditLogsFile = path.join(backupLogsPath, 'audit-logs.json');
      await fs.writeJSON(auditLogsFile, auditLogs, { spaces: 2 });
    }
    
    const duration = Date.now() - startTime;
    return {
      step: 'logs',
      status: 'completed',
      duration,
      files: copiedFiles + 1, // +1 لسجلات التدقيق
      message: `تم نسخ ${copiedFiles} ملف سجل وسجلات التدقيق`
    };
  } catch (error) {
    console.error('Error backing up logs:', error);
    return {
      step: 'logs',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      message: 'فشل نسخ السجلات'
    };
  }
}

/**
 * نسخ ملفات الإعداد
 * @param {string} tempPath - المسار المؤقت
 * @returns {Promise<Object>} معلومات الخطوة
 */
async function backupConfig(tempPath) {
  const startTime = Date.now();
  const configPath = path.join(tempPath, 'config');
  
  try {
    await fs.ensureDir(configPath);
    
    // قائمة الملفات المراد نسخها
    const configFiles = [
      '.env',
      'package.json',
      'package-lock.json',
      'nginx.conf',
      'ecosystem.config.js'
    ];
    
    let copiedFiles = 0;
    
    for (const file of configFiles) {
      const sourcePath = path.join(process.cwd(), file);
      if (await fs.pathExists(sourcePath)) {
        const destPath = path.join(configPath, file);
        await fs.copy(sourcePath, destPath);
        copiedFiles++;
      }
    }
    
    // نسخ مجلد السكربتات
    const scriptsPath = path.join(process.cwd(), 'scripts');
    if (await fs.pathExists(scriptsPath)) {
      const backupScriptsPath = path.join(configPath, 'scripts');
      await fs.copy(scriptsPath, backupScriptsPath);
      copiedFiles++; // نحسب المجلد كملف واحد
    }
    
    const duration = Date.now() - startTime;
    return {
      step: 'config',
      status: 'completed',
      duration,
      files: copiedFiles,
      message: `تم نسخ ${copiedFiles} ملف إعداد`
    };
  } catch (error) {
    console.error('Error backing up config:', error);
    return {
      step: 'config',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      message: 'فشل نسخ ملفات الإعداد'
    };
  }
}

/**
 * إنشاء ملف معلومات النسخة الاحتياطية
 * @param {string} tempPath - المسار المؤقت
 * @param {Object} backupInfo - معلومات النسخة الاحتياطية
 * @returns {Promise<Object>} معلومات الخطوة
 */
async function createBackupInfoFile(tempPath, backupInfo) {
  const startTime = Date.now();
  
  try {
    const infoFile = path.join(tempPath, 'backup-info.json');
    
    const info = {
      ...backupInfo,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd()
      },
      application: {
        name: process.env.APP_NAME,
        version: process.env.APP_VERSION,
        environment: process.env.NODE_ENV
      },
      database: {
        uri: process.env.MONGODB_URI ? new URL(process.env.MONGODB_URI).hostname : 'unknown',
        collections: await mongoose.connection.db.listCollections().toArray().then(cols => cols.length)
      }
    };
    
    await fs.writeJSON(infoFile, info, { spaces: 2 });
    
    const duration = Date.now() - startTime;
    return {
      step: 'info_file',
      status: 'completed',
      duration,
      message: 'تم إنشاء ملف معلومات النسخة الاحتياطية'
    };
  } catch (error) {
    console.error('Error creating backup info file:', error);
    return {
      step: 'info_file',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      message: 'فشل إنشاء ملف المعلومات'
    };
  }
}

/**
 * ضغط النسخة الاحتياطية
 * @param {string} sourcePath - المسار المصدر
 * @param {string} destPath - المسار الهدف
 * @returns {Promise<string>} مسار الأرشيف
 */
async function compressBackup(sourcePath, destPath) {
  const archiveName = `backup-${moment().format('YYYY-MM-DD-HHmmss')}.tar.gz`;
  const archivePath = path.join(destPath, archiveName);
  
  await tar.c(
    {
      gzip: true,
      file: archivePath,
      cwd: path.dirname(sourcePath)
    },
    [path.basename(sourcePath)]
  );
  
  return archivePath;
}

/**
 * حفظ معلومات النسخة الاحتياطية
 * @param {string} backupPath - مسار النسخة الاحتياطية
 * @param {Object} backupInfo - معلومات النسخة الاحتياطية
 */
async function saveBackupInfo(backupPath, backupInfo) {
  const infoFile = path.join(backupPath, 'backup-info.json');
  await fs.writeJSON(infoFile, backupInfo, { spaces: 2 });
}

/**
 * الحصول على قائمة النسخ الاحتياطية
 * @returns {Promise<Array>} قائمة النسخ الاحتياطية
 */
async function listBackups() {
  try {
    // التحقق من وجود مجلد النسخ الاحتياطية
    if (!await fs.pathExists(BACKUP_CONFIG.path)) {
      await fs.ensureDir(BACKUP_CONFIG.path);
      return [];
    }
    
    const backups = [];
    const items = await fs.readdir(BACKUP_CONFIG.path, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        const backupPath = path.join(BACKUP_CONFIG.path, item.name);
        const infoFile = path.join(backupPath, 'backup-info.json');
        
        if (await fs.pathExists(infoFile)) {
          try {
            const info = await fs.readJSON(infoFile);
            backups.push(info);
          } catch (error) {
            console.warn(`Error reading backup info for ${item.name}:`, error);
          }
        }
      }
    }
    
    // ترتيب النسخ حسب التاريخ (الأحدث أولاً)
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return backups;
  } catch (error) {
    console.error('Error listing backups:', error);
    throw error;
  }
}

/**
 * استعادة نسخة احتياطية
 * @param {string} backupId - معرف النسخة الاحتياطية
 * @param {Object} options - خيارات الاستعادة
 * @returns {Promise<Object>} نتيجة الاستعادة
 */
async function restoreBackup(backupId, options = {}) {
  const backupPath = path.join(BACKUP_CONFIG.path, backupId);
  const archivePath = path.join(backupPath, `backup-${backupId.split('-').slice(1).join('-')}.tar.gz`);
  const extractPath = path.join('/tmp', `restore-${backupId}`);
  
  try {
    // تسجيل بدء الاستعادة
    await AuditLog.create({
      level: 'info',
      action: 'restore_start',
      message: `بدأ استعادة النسخة الاحتياطية: ${backupId}`,
      metadata: { backupId, options }
    });
    
    // التحقق من وجود النسخة الاحتياطية
    if (!await fs.pathExists(archivePath)) {
      throw new Error(`النسخة الاحتياطية ${backupId} غير موجودة`);
    }
    
    // إنشاء مجلد الاستخراج
    await fs.ensureDir(extractPath);
    
    // فك ضغط الأرشيف
    await tar.x({
      file: archivePath,
      cwd: extractPath
    });
    
    // قراءة معلومات النسخة الاحتياطية
    const extractedDir = await fs.readdir(extractPath);
    const backupDir = path.join(extractPath, extractedDir[0]);
    const infoFile = path.join(backupDir, 'backup-info.json');
    
    if (!await fs.pathExists(infoFile)) {
      throw new Error('ملف معلومات النسخة الاحتياطية غير موجود');
    }
    
    const backupInfo = await fs.readJSON(infoFile);
    const restoreInfo = {
      backupId,
      timestamp: new Date(),
      status: 'in_progress',
      steps: []
    };
    
    // 1. استعادة قاعدة البيانات
    if (options.restoreDatabase !== false) {
      restoreInfo.steps.push(await restoreDatabase(backupDir));
    }
    
    // 2. استعادة ملفات التحميل
    if (options.restoreUploads !== false) {
      restoreInfo.steps.push(await restoreUploads(backupDir));
    }
    
    // 3. استعادة السجلات
    if (options.restoreLogs !== false) {
      restoreInfo.steps.push(await restoreLogs(backupDir));
    }
    
    // 4. استعادة ملفات الإعداد
    if (options.restoreConfig !== false) {
      restoreInfo.steps.push(await restoreConfig(backupDir));
    }
    
    // تنظيف المجلد المؤقت
    await fs.remove(extractPath);
    
    // تحديث معلومات الاستعادة
    restoreInfo.status = 'completed';
    restoreInfo.duration = Date.now() - restoreInfo.timestamp.getTime();
    
    // تسجيل نجاح الاستعادة
    await AuditLog.create({
      level: 'info',
      action: 'restore_complete',
      message: `تم استعادة النسخة الاحتياطية بنجاح: ${backupId}`,
      metadata: {
        backupId,
        duration: restoreInfo.duration,
        steps: restoreInfo.steps.length
      }
    });
    
    return restoreInfo;
  } catch (error) {
    console.error('Error restoring backup:', error);
    
    // تسجيل فشل الاستعادة
    await AuditLog.create({
      level: 'error',
      action: 'restore_failed',
      message: `فشل استعادة النسخة الاحتياطية: ${backupId}`,
      metadata: {
        backupId,
        error: error.message,
        stack: error.stack
      }
    });
    
    // تنظيف الملفات المؤقتة
    try {
      await fs.remove(extractPath);
    } catch (cleanupError) {
      console.error('Error cleaning up after failed restore:', cleanupError);
    }
    
    throw error;
  }
}

/**
 * استعادة قاعدة البيانات
 * @param {string} backupDir - مجلد النسخة الاحتياطية
 * @returns {Promise<Object>} معلومات الخطوة
 */
async function restoreDatabase(backupDir) {
  const startTime = Date.now();
  const dbPath = path.join(backupDir, 'database');
  
  try {
    if (!await fs.pathExists(dbPath)) {
      return {
        step: 'restore_database',
        status: 'skipped',
        duration: Date.now() - startTime,
        message: 'مجموعة قاعدة البيانات غير موجودة في النسخة الاحتياطية'
      };
    }
    
    // قراءة ملفات JSON واستيرادها
    const files = await fs.readdir(dbPath);
    let restoredCollections = 0;
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'backup-info.json') {
        const collectionName = path.basename(file, '.json');
        const data = await fs.readJSON(path.join(dbPath, file));
        
        if (data.length > 0) {
          // حذف المجموعة الحالية
          await mongoose.connection.db.collection(collectionName).deleteMany({});
          
          // إدراج البيانات المستعادة
          await mongoose.connection.db.collection(collectionName).insertMany(data);
          restoredCollections++;
        }
      }
    }
    
    // محاولة استعادة باستخدام mongorestore إذا كان متاحاً
    const mongodumpPath = path.join(dbPath, 'mongodump');
    if (await fs.pathExists(mongodumpPath)) {
      try {
        await execPromise(`mongorestore --uri="${process.env.MONGODB_URI}" "${mongodumpPath}" --drop`);
      } catch (mongorestoreError) {
        console.warn('mongorestore failed, using JSON import only:', mongorestoreError.message);
      }
    }
    
    const duration = Date.now() - startTime;
    return {
      step: 'restore_database',
      status: 'completed',
      duration,
      collections: restoredCollections,
      message: `تم استعادة ${restoredCollections} مجموعة من قاعدة البيانات`
    };
  } catch (error) {
    console.error('Error restoring database:', error);
    return {
      step: 'restore_database',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      message: 'فشل استعادة قاعدة البيانات'
    };
  }
}

/**
 * استعادة ملفات التحميل
 * @param {string} backupDir - مجلد النسخة الاحتياطية
 * @returns {Promise<Object>} معلومات الخطوة
 */
async function restoreUploads(backupDir) {
  const startTime = Date.now();
  const uploadsBackupPath = path.join(backupDir, 'uploads');
  const uploadsPath = process.env.UPLOAD_PATH || './uploads';
  
  try {
    if (!await fs.pathExists(uploadsBackupPath)) {
      return {
        step: 'restore_uploads',
        status: 'skipped',
        duration: Date.now() - startTime,
        message: 'ملفات التحميل غير موجودة في النسخة الاحتياطية'
      };
    }
    
    // حذف مجلد التحميلات الحالي
    if (await fs.pathExists(uploadsPath)) {
      await fs.remove(uploadsPath);
    }
    
    // نسخ ملفات التحميل المستعادة
    await fs.copy(uploadsBackupPath, uploadsPath);
    
    const duration = Date.now() - startTime;
    return {
      step: 'restore_uploads',
      status: 'completed',
      duration,
      message: 'تم استعادة ملفات التحميل'
    };
  } catch (error) {
    console.error('Error restoring uploads:', error);
    return {
      step: 'restore_uploads',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      message: 'فشل استعادة ملفات التحميل'
    };
  }
}

/**
 * استعادة السجلات
 * @param {string} backupDir - مجلد النسخة الاحتياطية
 * @returns {Promise<Object>} معلومات الخطوة
 */
async function restoreLogs(backupDir) {
  const startTime = Date.now();
  const logsBackupPath = path.join(backupDir, 'logs');
  
  try {
    if (!await fs.pathExists(logsBackupPath)) {
      return {
        step: 'restore_logs',
        status: 'skipped',
        duration: Date.now() - startTime,
        message: 'السجلات غير موجودة في النسخة الاحتياطية'
      };
    }
    
    // لا نستعيد سجلات النظام عادةً، فقط نسجل أن العملية تمت
    const duration = Date.now() - startTime;
    return {
      step: 'restore_logs',
      status: 'completed',
      duration,
      message: 'تم تسجيل استعادة السجلات'
    };
  } catch (error) {
    console.error('Error restoring logs:', error);
    return {
      step: 'restore_logs',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      message: 'فشل استعادة السجلات'
    };
  }
}

/**
 * استعادة ملفات الإعداد
 * @param {string} backupDir - مجلد النسخة الاحتياطية
 * @returns {Promise<Object>} معلومات الخطوة
 */
async function restoreConfig(backupDir) {
  const startTime = Date.now();
  const configBackupPath = path.join(backupDir, 'config');
  
  try {
    if (!await fs.pathExists(configBackupPath)) {
      return {
        step: 'restore_config',
        status: 'skipped',
        duration: Date.now() - startTime,
        message: 'ملفات الإعداد غير موجودة في النسخة الاحتياطية'
      };
    }
    
    // نسخ ملفات الإعداد المهمة
    const configFiles = [
      '.env',
      'nginx.conf',
      'ecosystem.config.js'
    ];
    
    let restoredFiles = 0;
    
    for (const file of configFiles) {
      const sourceFile = path.join(configBackupPath, file);
      const destFile = path.join(process.cwd(), file);
      
      if (await fs.pathExists(sourceFile)) {
        // إنشاء نسخة احتياطية من الملف الحالي إذا كان موجوداً
        if (await fs.pathExists(destFile)) {
          const backupFile = `${destFile}.backup-${Date.now()}`;
          await fs.copy(destFile, backupFile);
        }
        
        await fs.copy(sourceFile, destFile);
        restoredFiles++;
      }
    }
    
    const duration = Date.now() - startTime;
    return {
      step: 'restore_config',
      status: 'completed',
      duration,
      files: restoredFiles,
      message: `تم استعادة ${restoredFiles} ملف إعداد`
    };
  } catch (error) {
    console.error('Error restoring config:', error);
    return {
      step: 'restore_config',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message,
      message: 'فشل استعادة ملفات الإعداد'
    };
  }
}

/**
 * تنظيف النسخ الاحتياطية القديمة
 * @returns {Promise<Object>} نتيجة التنظيف
 */
async function cleanupOldBackups() {
  try {
    const backups = await listBackups();
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - BACKUP_CONFIG.retentionDays * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    let freedSpace = 0;
    
    // حذف النسخ الأقدم من تاريخ القطع
    for (const backup of backups) {
      const backupDate = new Date(backup.timestamp);
      
      if (backupDate < cutoffDate) {
        const backupPath = path.join(BACKUP_CONFIG.path, backup.id);
        
        if (await fs.pathExists(backupPath)) {
          const size = await calculateDirectorySize(backupPath);
          await fs.remove(backupPath);
          
          deletedCount++;
          freedSpace += size;
        }
      }
    }
    
    // حذف النسخ الزائدة عن الحد الأقصى (الأقدم أولاً)
    if (backups.length - deletedCount > BACKUP_CONFIG.maxBackups) {
      const sortedBackups = backups
        .filter(b => new Date(b.timestamp) >= cutoffDate)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // الأقدم أولاً
      
      const toDelete = sortedBackups.slice(0, sortedBackups.length - BACKUP_CONFIG.maxBackups);
      
      for (const backup of toDelete) {
        const backupPath = path.join(BACKUP_CONFIG.path, backup.id);
        
        if (await fs.pathExists(backupPath)) {
          const size = await calculateDirectorySize(backupPath);
          await fs.remove(backupPath);
          
          deletedCount++;
          freedSpace += size;
        }
      }
    }
    
    return {
      deleted: deletedCount,
      freedSpace: formatSize(freedSpace),
      currentBackups: backups.length - deletedCount,
      maxBackups: BACKUP_CONFIG.maxBackups
    };
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
    throw error;
  }
}

/**
 * حساب حجم المجلد
 * @param {string} dirPath - مسار المجلد
 * @returns {Promise<number>} الحجم بالبايت
 */
async function calculateDirectorySize(dirPath) {
  try {
    if (!await fs.pathExists(dirPath)) {
      return 0;
    }
    
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    let totalSize = 0;
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        totalSize += await calculateDirectorySize(itemPath);
      } else if (item.isFile()) {
        const stats = await fs.stat(itemPath);
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating directory size:', error);
    return 0;
  }
}

/**
 * الحصول على حجم الملف
 * @param {string} filePath - مسار الملف
 * @returns {Promise<number>} الحجم بالبايت
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
}

/**
 * تنسيق حجم الملف
 * @param {number} bytes - الحجم بالبايت
 * @returns {string} الحجم منسق
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 بايت';
  
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * حذف نسخة احتياطية محددة
 * @param {string} backupId - معرف النسخة الاحتياطية
 * @returns {Promise<Object>} نتيجة الحذف
 */
async function deleteBackup(backupId) {
  try {
    const backupPath = path.join(BACKUP_CONFIG.path, backupId);
    
    if (!await fs.pathExists(backupPath)) {
      throw new Error(`النسخة الاحتياطية ${backupId} غير موجودة`);
    }
    
    const size = await calculateDirectorySize(backupPath);
    await fs.remove(backupPath);
    
    // تسجيل الحذف
    await AuditLog.create({
      level: 'info',
      action: 'backup_delete',
      message: `تم حذف النسخة الاحتياطية: ${backupId}`,
      metadata: {
        backupId,
        size: formatSize(size)
      }
    });
    
    return {
      success: true,
      message: `تم حذف النسخة الاحتياطية ${backupId}`,
      size: formatSize(size)
    };
  } catch (error) {
    console.error('Error deleting backup:', error);
    throw error;
  }
}

/**
 * التحقق من صحة النسخة الاحتياطية
 * @param {string} backupId - معرف النسخة الاحتياطية
 * @returns {Promise<Object>} نتيجة التحقق
 */
async function validateBackup(backupId) {
  try {
    const backupPath = path.join(BACKUP_CONFIG.path, backupId);
    const infoFile = path.join(backupPath, 'backup-info.json');
    
    if (!await fs.pathExists(infoFile)) {
      return {
        valid: false,
        message: 'ملف معلومات النسخة الاحتياطية غير موجود'
      };
    }
    
    const backupInfo = await fs.readJSON(infoFile);
    
    // التحقق من الملفات الأساسية
    const requiredFiles = [
      'backup-info.json',
      'database/',
      'config/'
    ];
    
    const missingFiles = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(backupPath, file);
      if (!await fs.pathExists(filePath)) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      return {
        valid: false,
        message: `الملفات التالية مفقودة: ${missingFiles.join(', ')}`
      };
    }
    
    // التحقق من صحة ملفات JSON
    const databasePath = path.join(backupPath, 'database');
    const jsonFiles = await fs.readdir(databasePath);
    
    for (const file of jsonFiles) {
      if (file.endsWith('.json')) {
        try {
          const data = await fs.readJSON(path.join(databasePath, file));
          if (!Array.isArray(data)) {
            return {
              valid: false,
              message: `ملف ${file} ليس مصفوفة صالحة`
            };
          }
        } catch (error) {
          return {
            valid: false,
            message: `ملف ${file} غير صالح: ${error.message}`
          };
        }
      }
    }
    
    return {
      valid: true,
      message: 'النسخة الاحتياطية صالحة',
      info: {
        id: backupInfo.id,
        timestamp: backupInfo.timestamp,
        steps: backupInfo.steps,
        size: backupInfo.size
      }
    };
  } catch (error) {
    console.error('Error validating backup:', error);
    return {
      valid: false,
      message: `خطأ في التحقق من صحة النسخة: ${error.message}`
    };
  }
}

module.exports = {
  createBackup,
  listBackups,
  restoreBackup,
  cleanupOldBackups,
  deleteBackup,
  validateBackup,
  BACKUP_CONFIG,
  
  // دوال مساعدة للاستخدام الداخلي
  formatSize,
  calculateDirectorySize
};
