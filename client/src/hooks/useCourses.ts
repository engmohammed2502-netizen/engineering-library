import { useState, useCallback, useEffect } from 'react';
import { Course, CourseFile, coursesService } from '../services/courses.service';
import { useNotification } from '../context/NotificationContext';

/**
 * هوك لإدارة المواد الدراسية
 */
export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  const { success, error: notifyError } = useNotification();

  // الحصول على جميع المواد
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await coursesService.getAllCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل المواد');
      notifyError('فشل تحميل المواد الدراسية');
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  // الحصول على مواد تخصص معين
  const fetchCoursesByDepartment = useCallback(async (department: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await coursesService.getCoursesByDepartment(department);
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل المواد');
      notifyError(`فشل تحميل مواد تخصص ${department}`);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  // الحصول على مواد سمستر معين
  const fetchCoursesBySemester = useCallback(async (department: string, semester: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await coursesService.getCoursesBySemester(department, semester);
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل المواد');
      notifyError(`فشل تحميل مواد السمستر ${semester}`);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  // الحصول على مادة بواسطة ID
  const fetchCourseById = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await coursesService.getCourseById(courseId);
      setCurrentCourse(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'فشل تحميل المادة');
      notifyError('فشل تحميل المادة');
      return null;
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  // الحصول على ملفات المادة
  const fetchCourseFiles = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await coursesService.getCourseFiles(courseId);
      setCourseFiles(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الملفات');
      notifyError('فشل تحميل ملفات المادة');
      return [];
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  // إنشاء مادة جديدة
  const createCourse = useCallback(async (courseData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await coursesService.createCourse(courseData);
      success('تم إنشاء المادة بنجاح');
      
      // إضافة المادة الجودة للقائمة
      setCourses(prev => [...prev, response.course]);
      
      return response.course;
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء المادة');
      notifyError('فشل إنشاء المادة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, notifyError]);

  // تحديث مادة
  const updateCourse = useCallback(async (courseId: string, updates: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await coursesService.updateCourse(courseId, updates);
      success('تم تحديث المادة بنجاح');
      
      // تحديث المادة في القائمة
      setCourses(prev => prev.map(course => 
        course._id === courseId ? response.course : course
      ));
      
      // تحديث المادة الحالية إذا كانت هي المحدثة
      if (currentCourse?._id === courseId) {
        setCurrentCourse(response.course);
      }
      
      return response.course;
    } catch (err: any) {
      setError(err.message || 'فشل تحديث المادة');
      notifyError('فشل تحديث المادة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, notifyError, currentCourse]);

  // حذف مادة
  const deleteCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await coursesService.deleteCourse(courseId);
      success('تم حذف المادة بنجاح');
      
      // إزالة المادة من القائمة
      setCourses(prev => prev.filter(course => course._id !== courseId));
      
      // إذا كانت المادة المحذوفة هي الحالية، تنظيفها
      if (currentCourse?._id === courseId) {
        setCurrentCourse(null);
        setCourseFiles([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل حذف المادة');
      notifyError('فشل حذف المادة');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, notifyError, currentCourse]);

  // رفع ملف لمادة
  const uploadFile = useCallback(async (
    courseId: string,
    file: File,
    type: string,
    category: string,
    description?: string,
    onProgress?: (progress: number) => void
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await coursesService.uploadFile(courseId, file, { type, category, description });
      success('تم رفع الملف بنجاح');
      
      // إضافة الملف الجديد للقائمة
      setCourseFiles(prev => [...prev, response.file]);
      
      return response.file;
    } catch (err: any) {
      setError(err.message || 'فشل رفع الملف');
      notifyError('فشل رفع الملف');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, notifyError]);

  // تحميل ملف
  const downloadFile = useCallback(async (fileId: string, filename?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await coursesService.downloadFile(fileId);
      success('بدأ تحميل الملف');
      
      // زيادة عداد التنزيلات محلياً
      setCourseFiles(prev => prev.map(file => 
        file._id === fileId 
          ? { ...file, downloadCount: file.downloadCount + 1 }
          : file
      ));
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الملف');
      notifyError('فشل تحميل الملف');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, notifyError]);

  // حذف ملف
  const deleteFile = useCallback(async (fileId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await coursesService.deleteFile(fileId);
      success('تم حذف الملف بنجاح');
      
      // إزالة الملف من القائمة
      setCourseFiles(prev => prev.filter(file => file._id !== fileId));
    } catch (err: any) {
      setError(err.message || 'فشل حذف الملف');
      notifyError('فشل حذف الملف');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, notifyError]);

  // الحصول على إحصائيات المواد
  const fetchCourseStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await coursesService.getCourseStats();
      setStats(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الإحصائيات');
      notifyError('فشل تحميل إحصائيات المواد');
      return null;
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  // البحث في المواد
  const searchCourses = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await coursesService.searchCourses(query);
      setCourses(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'فشل البحث');
      notifyError('فشل البحث في المواد');
      return [];
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  // الحصول على المواد الشعبية
  const fetchPopularCourses = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await coursesService.getPopularCourses(limit);
      return data;
    } catch (err: any) {
      setError(err.message || 'فشل تحميل المواد الشعبية');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // تصفية الملفات حسب النوع
  const filterFilesByType = useCallback((type: string): CourseFile[] => {
    return courseFiles.filter(file => file.type === type);
  }, [courseFiles]);

  // تصفية الملفات حسب التصنيف
  const filterFilesByCategory = useCallback((category: string): CourseFile[] => {
    return courseFiles.filter(file => file.category === category);
  }, [courseFiles]);

  // الحصول على جميع التصنيفات الفريدة
  const getUniqueCategories = useCallback((): string[] => {
    const categories = courseFiles.map(file => file.category);
    return Array.from(new Set(categories));
  }, [courseFiles]);

  // تفعيل/تعطيل المنتدى الخاص بالمادة
  const toggleForum = useCallback(async (courseId: string, enabled: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      await coursesService.toggleForum(courseId, enabled);
      success(`تم ${enabled ? 'تفعيل' : 'تعطيل'} المنتدى بنجاح`);
      
      // تحديث حالة المادة
      setCourses(prev => prev.map(course => 
        course._id === courseId ? { ...course, forumEnabled: enabled } : course
      ));
      
      if (currentCourse?._id === courseId) {
        setCurrentCourse(prev => prev ? { ...prev, forumEnabled: enabled } : null);
      }
    } catch (err: any) {
      setError(err.message || 'فشل تحديث حالة المنتدى');
      notifyError('فشل تحديث حالة المنتدى');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, notifyError, currentCourse]);

  // تنزيل قائمة المواد
  const exportCourses = useCallback(async (format: 'csv' | 'excel' = 'csv') => {
    setLoading(true);
    setError(null);
    
    try {
      await coursesService.exportCourses(format);
      success(`تم تصدير البيانات بصيغة ${format}`);
    } catch (err: any) {
      setError(err.message || 'فشل تصدير البيانات');
      notifyError('فشل تصدير البيانات');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, notifyError]);

  // تنظيف البيانات عند تغيير المادة
  useEffect(() => {
    return () => {
      setCourseFiles([]);
      setCurrentCourse(null);
    };
  }, []);

  return {
    // البيانات
    courses,
    currentCourse,
    courseFiles,
    loading,
    error,
    stats,
    
    // الدوال
    fetchCourses,
    fetchCoursesByDepartment,
    fetchCoursesBySemester,
    fetchCourseById,
    fetchCourseFiles,
    createCourse,
    updateCourse,
    deleteCourse,
    uploadFile,
    downloadFile,
    deleteFile,
    fetchCourseStats,
    searchCourses,
    fetchPopularCourses,
    filterFilesByType,
    filterFilesByCategory,
    getUniqueCategories,
    toggleForum,
    exportCourses,
    
    // دوال مساعدة
    getDepartments: coursesService.getDepartments,
    getSemesters: coursesService.getSemesters,
    getFileTypes: coursesService.getFileTypes,
    getFileCategories: coursesService.getFileCategories,
    
    // حالة التحميل الفرعية
    setLoading,
    setError,
    setCourses,
    setCurrentCourse,
    setCourseFiles,
  };
};

export default useCourses;
