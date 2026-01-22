import { useState, useCallback } from 'react';
import { filesService, UploadResponse } from '../services/files.service';
import { useNotification } from '../context/NotificationContext';

/**
 * هوك لإدارة رفع الملفات
 */
export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const { success, error: notifyError } = useNotification();

  // رفع ملف لمادة دراسية
  const uploadCourseFile = useCallback(async (
    courseId: string,
    file: File,
    type: string,
    category: string,
    description?: string
  ): Promise<UploadResponse> => {
    setUploading(true);
    setProgress(0);
    setUploadError(null);
    
    // التحقق من نوع الملف
    if (!filesService.validateFileType(file, [...filesService.ALLOWED_FILE_TYPES.documents])) {
      const errorMsg = 'نوع الملف غير مسموح. يُسمح بالمستندات فقط (PDF, DOC, PPT, etc.)';
      setUploadError(errorMsg);
      notifyError(errorMsg);
      setUploading(false);
      return { success: false, message: errorMsg };
    }
    
    // التحقق من حجم الملف
    if (!filesService.validateFileSize(file, filesService.MAX_FILE_SIZE)) {
      const errorMsg = `حجم الملف كبير جداً. الحد الأقصى ${filesService.formatFileSize(filesService.MAX_FILE_SIZE)}`;
      setUploadError(errorMsg);
      notifyError(errorMsg);
      setUploading(false);
      return { success: false, message: errorMsg };
    }
    
    try {
      const response = await filesService.uploadCourseFile(
        courseId,
        file,
        type,
        category,
        description,
        (uploadProgress) => {
          setProgress(uploadProgress);
        }
      );
      
      if (response.success) {
        success('تم رفع الملف بنجاح');
        setUploadedFiles(prev => [...prev, response.file]);
      } else {
        setUploadError(response.message);
        notifyError(response.message);
      }
      
      return response;
    } catch (err: any) {
      const errorMsg = err.message || 'فشل رفع الملف';
      setUploadError(errorMsg);
      notifyError(errorMsg);
      return { success: false, message: errorMsg, error: err.message };
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [success, notifyError]);

  // رفع صورة للمنتدى
  const uploadForumImage = useCallback(async (
    forumId: string,
    file: File
  ): Promise<UploadResponse> => {
    setUploading(true);
    setProgress(0);
    setUploadError(null);
    
    // التحقق من نوع الملف
    if (!filesService.validateFileType(file, filesService.ALLOWED_FILE_TYPES.images)) {
      const errorMsg = 'نوع الملف غير مسموح. يُسمح بالصور فقط (JPG, PNG, GIF, etc.)';
      setUploadError(errorMsg);
      notifyError(errorMsg);
      setUploading(false);
      return { success: false, message: errorMsg };
    }
    
    // التحقق من حجم الملف
    if (!filesService.validateFileSize(file, filesService.MAX_IMAGE_SIZE)) {
      const errorMsg = `حجم الصورة كبير جداً. الحد الأقصى ${filesService.formatFileSize(filesService.MAX_IMAGE_SIZE)}`;
      setUploadError(errorMsg);
      notifyError(errorMsg);
      setUploading(false);
      return { success: false, message: errorMsg };
    }
    
    try {
      const response = await filesService.uploadForumImage(
        forumId,
        file,
        (uploadProgress) => {
          setProgress(uploadProgress);
        }
      );
      
      if (response.success) {
        success('تم رفع الصورة بنجاح');
        setUploadedFiles(prev => [...prev, response.file]);
      } else {
        setUploadError(response.message);
        notifyError(response.message);
      }
      
      return response;
    } catch (err: any) {
      const errorMsg = err.message || 'فشل رفع الصورة';
      setUploadError(errorMsg);
      notifyError(errorMsg);
      return { success: false, message: errorMsg, error: err.message };
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [success, notifyError]);

  // رفع ملفات متعددة
  const uploadMultipleFiles = useCallback(async (
    endpoint: string,
    files: File[],
    additionalData?: Record<string, string>
  ): Promise<UploadResponse[]> => {
    setUploading(true);
    setUploadError(null);
    
    const results: UploadResponse[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(Math.round((i / files.length) * 100));
      
      try {
        const response = await filesService.uploadFile(
          file,
          endpoint,
          additionalData
        );
        
        results.push(response);
        
        if (response.success) {
          setUploadedFiles(prev => [...prev, response.file]);
        }
      } catch (err: any) {
        results.push({
          success: false,
          message: err.message || 'فشل رفع الملف',
          error: err.message,
        });
      }
    }
    
    setUploading(false);
    setProgress(0);
    
    const successfulUploads = results.filter(r => r.success).length;
    if (successfulUploads > 0) {
      success(`تم رفع ${successfulUploads} ملف بنجاح من أصل ${files.length}`);
    }
    
    return results;
  }, [success]);

  // تحميل ملف
  const downloadFile = useCallback(async (
    fileId: string,
    filename?: string
  ): Promise<void> => {
    setUploading(true);
    setUploadError(null);
    
    try {
      await filesService.downloadFile(fileId, filename);
      success('بدأ تحميل الملف');
    } catch (err: any) {
      const errorMsg = err.message || 'فشل تحميل الملف';
      setUploadError(errorMsg);
      notifyError(errorMsg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [success, notifyError]);

  // حذف ملف
  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    setUploading(true);
    setUploadError(null);
    
    try {
      const response = await filesService.deleteFile(fileId);
      
      if (response.success) {
        success('تم حذف الملف بنجاح');
        setUploadedFiles(prev => prev.filter(file => file._id !== fileId));
        return true;
      } else {
        setUploadError(response.message);
        notifyError(response.message);
        return false;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'فشل حذف الملف';
      setUploadError(errorMsg);
      notifyError(errorMsg);
      return false;
    } finally {
      setUploading(false);
    }
  }, [success, notifyError]);

  // معاينة ملف
  const previewFile = useCallback(async (fileId: string): Promise<string> => {
    setUploading(true);
    setUploadError(null);
    
    try {
      const previewUrl = await filesService.previewFile(fileId);
      return previewUrl;
    } catch (err: any) {
      const errorMsg = err.message || 'فشل معاينة الملف';
      setUploadError(errorMsg);
      notifyError(errorMsg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [notifyError]);

  // البحث في الملفات
  const searchFiles = useCallback(async (
    query: string,
    filters?: Record<string, any>
  ): Promise<any[]> => {
    setUploading(true);
    setUploadError(null);
    
    try {
      const results = await filesService.searchFiles(query, filters);
      return results;
    } catch (err: any) {
      const errorMsg = err.message || 'فشل البحث في الملفات';
      setUploadError(errorMsg);
      return [];
    } finally {
      setUploading(false);
    }
  }, []);

  // الحصول على إحصائيات الملفات
  const getFilesStats = useCallback(async () => {
    setUploading(true);
    setUploadError(null);
    
    try {
      const stats = await filesService.getFilesStats();
      return stats;
    } catch (err: any) {
      const errorMsg = err.message || 'فشل تحميل إحصائيات الملفات';
      setUploadError(errorMsg);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  // تحميل عدة ملفات كأرشيف
  const downloadMultipleFiles = useCallback(async (
    fileIds: string[],
    filename = 'files.zip'
  ): Promise<void> => {
    setUploading(true);
    setUploadError(null);
    
    try {
      await filesService.downloadMultipleFiles(fileIds, filename);
      success('بدأ تحميل الأرشيف');
    } catch (err: any) {
      const errorMsg = err.message || 'فشل تحميل الأرشيف';
      setUploadError(errorMsg);
      notifyError(errorMsg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [success, notifyError]);

  // تصدير قائمة الملفات
  const exportFiles = useCallback(async (format: 'csv' | 'excel' = 'csv'): Promise<void> => {
    setUploading(true);
    setUploadError(null);
    
    try {
      await filesService.exportFiles(format);
      success(`تم تصدير البيانات بصيغة ${format}`);
    } catch (err: any) {
      const errorMsg = err.message || 'فشل تصدير البيانات';
      setUploadError(errorMsg);
      notifyError(errorMsg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [success, notifyError]);

  // تنظيف الملفات المرفوعة محلياً
  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  // إزالة خطأ الرفع
  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  // التحقق من صحة الملف قبل الرفع
  const validateFileBeforeUpload = useCallback((file: File, isImage = false): {
    isValid: boolean;
    message?: string;
  } => {
    // التحقق من الحجم
    const maxSize = isImage ? filesService.MAX_IMAGE_SIZE : filesService.MAX_FILE_SIZE;
    if (!filesService.validateFileSize(file, maxSize)) {
      return {
        isValid: false,
        message: `حجم الملف كبير جداً. الحد الأقصى ${filesService.formatFileSize(maxSize)}`
      };
    }
    
    // التحقق من النوع
    const allowedTypes = isImage 
      ? filesService.ALLOWED_FILE_TYPES.images
      : [...filesService.ALLOWED_FILE_TYPES.documents];
    
    if (!filesService.validateFileType(file, allowedTypes)) {
      return {
        isValid: false,
        message: `نوع الملف غير مسموح. الأنواع المسموحة: ${allowedTypes.join(', ')}`
      };
    }
    
    return { isValid: true };
  }, []);

  // تنسيق حجم الملف
  const formatFileSize = filesService.formatFileSize;

  // الحصول على أيقونة الملف
  const getFileIcon = filesService.getFileIcon;

  return {
    // الحالة
    uploading,
    progress,
    uploadError,
    uploadedFiles,
    
    // الدوال
    uploadCourseFile,
    uploadForumImage,
    uploadMultipleFiles,
    downloadFile,
    deleteFile,
    previewFile,
    searchFiles,
    getFilesStats,
    downloadMultipleFiles,
    exportFiles,
    clearUploadedFiles,
    clearUploadError,
    validateFileBeforeUpload,
    formatFileSize,
    getFileIcon,
    
    // إعدادات الملفات
    ALLOWED_FILE_TYPES: filesService.ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE: filesService.MAX_FILE_SIZE,
    MAX_IMAGE_SIZE: filesService.MAX_IMAGE_SIZE,
  };
};

export default useUpload;
