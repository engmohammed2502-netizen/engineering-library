import { User } from '../context/AuthContext';
import { http } from './api';

// أنواع البيانات
export interface LoginRequest {
  universityId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export interface GuestLoginRequest {
  name: string;
}

export interface RegisterRequest {
  universityId: string;
  password: string;
  name: string;
  email?: string;
  department: string;
  semester: number;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ResetPasswordRequest {
  universityId: string;
  email: string;
}

// خدمة المصادقة
export const authService = {
  // تسجيل الدخول
  async login(universityId: string, password: string): Promise<LoginResponse> {
    return http.post<LoginResponse>('/auth/login', { universityId, password });
  },

  // تسجيل دخول الضيف
  async guestLogin(name: string): Promise<LoginResponse> {
    return http.post<LoginResponse>('/auth/guest', { name });
  },

  // تسجيل الطالب (للأساتذة والإدارة فقط)
  async registerStudent(data: RegisterRequest): Promise<{ message: string; student: User }> {
    return http.post('/auth/register/student', data);
  },

  // تسجيل الدكتور (للإدارة والروت فقط)
  async registerProfessor(data: Omit<RegisterRequest, 'semester'>): Promise<{ message: string; professor: User }> {
    return http.post('/auth/register/professor', data);
  },

  // الحصول على المستخدم الحالي
  async getCurrentUser(): Promise<User> {
    return http.get<User>('/auth/me');
  },

  // تحديث الملف الشخصي
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return http.put<User>('/auth/profile', data);
  },

  // تغيير كلمة المرور
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return http.put('/auth/change-password', { currentPassword, newPassword });
  },

  // تجديد التوكن
  async refreshToken(): Promise<string> {
    const response = await http.post<{ token: string }>('/auth/refresh');
    return response.token;
  },

  // تسجيل الخروج
  async logout(): Promise<{ message: string }> {
    const response = await http.post('/auth/logout');
    
    // تنظيف التخزين المحلي
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('guestName');
    sessionStorage.removeItem('token');
    
    return response;
  },

  // التحقق من التوكن
  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    return http.get('/auth/verify');
  },

  // إعادة تعيين كلمة المرور (طلب)
  async requestPasswordReset(universityId: string, email: string): Promise<{ message: string }> {
    return http.post('/auth/forgot-password', { universityId, email });
  },

  // إعادة تعيين كلمة المرور (تأكيد)
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return http.post('/auth/reset-password', { token, newPassword });
  },

  // الحصول على جميع المستخدمين (للإدارة فقط)
  async getAllUsers(): Promise<User[]> {
    return http.get<User[]>('/auth/users');
  },

  // تحديث حالة المستخدم (للإدارة فقط)
  async updateUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
    return http.put(`/auth/users/${userId}/status`, { isActive });
  },

  // حذف المستخدم (للإدارة فقط)
  async deleteUser(userId: string): Promise<{ message: string }> {
    return http.delete(`/auth/users/${userId}`);
  },

  // تفعيل/تعطيل الحساب بعد 5 محاولات فاشلة
  async toggleAccountLock(userId: string, unlock: boolean): Promise<{ message: string }> {
    return http.put(`/auth/users/${userId}/lock`, { unlock });
  },

  // التحقق من صلاحيات المستخدم
  async checkPermission(permission: string): Promise<{ allowed: boolean }> {
    return http.get(`/auth/permissions/${permission}`);
  },

  // الحصول على إحصائيات المستخدمين (للروت فقط)
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    students: number;
    professors: number;
    admins: number;
    guests: number;
    recentLogins: User[];
  }> {
    return http.get('/auth/stats');
  },

  // تسجيل الدخول كروت (خاص بحساب zero)
  async rootLogin(password: string): Promise<LoginResponse> {
    return http.post<LoginResponse>('/auth/root', { password });
  },

  // إنشاء حساب إداري جديد (للروت فقط)
  async createAdmin(data: {
    username: string;
    password: string;
    name: string;
    email: string;
    department: string;
  }): Promise<{ message: string; admin: User }> {
    return http.post('/auth/create-admin', data);
  },
};

export default authService;
