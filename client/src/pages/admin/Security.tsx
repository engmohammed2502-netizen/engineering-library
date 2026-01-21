import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  LinearProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const AdminSecurity = () => {
  const [securityAlerts, setSecurityAlerts] = useState([
    { id: 1, type: 'failed_login', user: 'unknown', ip: '192.168.1.100', time: '10:30 ص', severity: 'high', status: 'new' },
    { id: 2, type: 'suspicious_download', user: '20231001', ip: '192.168.1.101', time: '09:45 ص', severity: 'medium', status: 'investigating' },
    { id: 3, type: 'multiple_failures', user: '20231002', ip: '192.168.1.102', time: 'أمس 3:20 م', severity: 'critical', status: 'resolved' },
    { id: 4, type: 'file_upload', user: 'د.أحمد', ip: '192.168.1.103', time: 'أمس 2:15 م', severity: 'low', status: 'new' }
  ]);

  const [blockedIPs, setBlockedIPs] = useState([
    { id: 1, ip: '192.168.100.1', reason: 'محاولات تسجيل دخول متعددة', blockedAt: '2024-01-10', blockedUntil: '2024-01-17' },
    { id: 2, ip: '192.168.100.2', reason: 'هجمات DDoS', blockedAt: '2024-01-09', blockedUntil: '2024-01-16' }
  ]);

  const [securityStats, setSecurityStats] = useState({
    totalAlerts: 24,
    criticalAlerts: 3,
    blockedIPs: 2,
    failedLogins: 156,
    securityScore: 85
  });

  const [settings, setSettings] = useState({
    enableBruteForceProtection: true,
    enableFileScanning: true,
    enableRateLimiting: true,
    maxLoginAttempts: 5,
    lockDuration: 24, // ساعات
    sessionTimeout: 60, // دقائق
    enable2FA: false
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [newIP, setNewIP] = useState({ ip: '', reason: '', duration: 24 });

  const getAlertTypeLabel = (type: string) => {
    switch(type) {
      case 'failed_login': return 'تسجيل دخول فاشل';
      case 'suspicious_download': return 'تنزيل مشبوه';
      case 'multiple_failures': return 'فشل متعدد';
      case 'file_upload': return 'رفع ملف';
      default: return type;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'primary';
      case 'investigating': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const handleViewAlert = (alert: any) => {
    setSelectedAlert(alert);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAlert(null);
  };

  const handleResolveAlert = (alertId: number) => {
    setSecurityAlerts(alerts =>
      alerts.map(alert =>
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      )
    );
  };

  const handleDeleteAlert = (alertId: number) => {
    setSecurityAlerts(alerts => alerts.filter(alert => alert.id !== alertId));
  };

  const handleBlockIP = () => {
    if (newIP.ip && newIP.reason) {
      const blockedIP = {
        id: blockedIPs.length + 1,
        ip: newIP.ip,
        reason: newIP.reason,
        blockedAt: new Date().toISOString().split('T')[0],
        blockedUntil: new Date(Date.now() + newIP.duration * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setBlockedIPs([...blockedIPs, blockedIP]);
      setNewIP({ ip: '', reason: '', duration: 24 });
      alert('تم حظر عنوان IP بنجاح');
    }
  };

  const handleUnblockIP = (ipId: number) => {
    setBlockedIPs(blockedIPs.filter(ip => ip.id !== ipId));
  };

  const handleExportLogs = () => {
    alert('جاري تصدير سجلات الأمان...');
  };

  const handleScanNow = () => {
    alert('جاري فحص النظام...');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        🛡️ مراقبة الأمان
      </Typography>

      {/* إحصائيات الأمان */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="error.main">
                    {securityStats.criticalAlerts}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    تنبيه حرج
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: '#f44336' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4">{securityStats.blockedIPs}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    IP محظور
                  </Typography>
                </Box>
                <BlockIcon sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4">{securityStats.failedLogins}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    محاولة فاشلة
                  </Typography>
                </Box>
                <LockIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4">{securityStats.securityScore}%</Typography>
                  <Typography variant="body2" color="textSecondary">
                    درجة الأمان
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={securityStats.securityScore} 
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    color={securityStats.securityScore > 80 ? 'success' : 'warning'}
                  />
                </Box>
                <SecurityIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* التنبيهات الأمنية */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                🔔 التنبيهات الأمنية
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => alert('تحديث التنبيهات')}
                >
                  تحديث
                </Button>
                <Button
                  size="small"
                  startIcon={<ExportIcon />}
                  onClick={handleExportLogs}
                >
                  تصدير
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>النوع</TableCell>
                    <TableCell>المستخدم</TableCell>
                    <TableCell>عنوان IP</TableCell>
                    <TableCell>الوقت</TableCell>
                    <TableCell>الخطورة</TableCell>
                    <TableCell>الحالة</TableCell>
                    <TableCell align="center">الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {securityAlerts.map((alert) => (
                    <TableRow key={alert.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {alert.severity === 'critical' && <ErrorIcon color="error" sx={{ mr: 1, fontSize: 16 }} />}
                          {alert.severity === 'high' && <WarningIcon color="warning" sx={{ mr: 1, fontSize: 16 }} />}
                          {getAlertTypeLabel(alert.type)}
                        </Box>
                      </TableCell>
                      <TableCell>{alert.user}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {alert.ip}
                        </Typography>
                      </TableCell>
                      <TableCell>{alert.time}</TableCell>
                      <TableCell>
                        <Chip 
                          label={alert.severity === 'critical' ? 'حرج' : 
                                 alert.severity === 'high' ? 'عالي' :
                                 alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={alert.status === 'new' ? 'جديد' : 
                                 alert.status === 'investigating' ? 'قيد التحقيق' : 'محلول'}
                          color={getStatusColor(alert.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewAlert(alert)}
                          title="عرض التفاصيل"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        {alert.status !== 'resolved' && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleResolveAlert(alert.id)}
                            title="حل التنبيه"
                          >
                            <CheckIcon fontSize="small" color="success" />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteAlert(alert.id)}
                          title="حذف"
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* IPs المحظورة */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              🚫 عناوين IP المحظورة
            </Typography>
            
            <TableContainer sx={{ maxHeight: 300, mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>عنوان IP</TableCell>
                    <TableCell>السبب</TableCell>
                    <TableCell align="center">إجراء</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blockedIPs.map((ip) => (
                    <TableRow key={ip.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {ip.ip}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="textSecondary">
                          {ip.reason}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleUnblockIP(ip.id)}
                          title="إلغاء الحظر"
                        >
                          <UnlockIcon fontSize="small" color="success" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* إضافة IP جديد */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                إضافة عنوان IP جديد للحظر
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="عنوان IP"
                value={newIP.ip}
                onChange={(e) => setNewIP({...newIP, ip: e.target.value})}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                placeholder="سبب الحظر"
                value={newIP.reason}
                onChange={(e) => setNewIP({...newIP, reason: e.target.value})}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                select
                label="مدة الحظر"
                value={newIP.duration}
                onChange={(e) => setNewIP({...newIP, duration: parseInt(e.target.value)})}
                sx={{ mb: 2 }}
              >
                <MenuItem value={1}>1 ساعة</MenuItem>
                <MenuItem value={24}>24 ساعة</MenuItem>
                <MenuItem value={168}>7 أيام</MenuItem>
                <MenuItem value={720}>30 يوماً</MenuItem>
              </TextField>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={handleBlockIP}
                disabled={!newIP.ip || !newIP.reason}
              >
                حظر العنوان
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* إعدادات الأمان */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          ⚙️ إعدادات الأمان
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableBruteForceProtection}
                  onChange={(e) => setSettings({...settings, enableBruteForceProtection: e.target.checked})}
                />
              }
              label="حماية من هجمات Brute Force"
            />
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
              تجميد الحساب بعد {settings.maxLoginAttempts} محاولات فاشلة
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableFileScanning}
                  onChange={(e) => setSettings({...settings, enableFileScanning: e.target.checked})}
                />
              }
              label="فحص الملفات المرفوعة"
            />
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
              فحص الملفات للكشف عن البرمجيات الخبيثة
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableRateLimiting}
                  onChange={(e) => setSettings({...settings, enableRateLimiting: e.target.checked})}
                />
              }
              label="تقييد عدد الطلبات"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="عدد المحاولات المسموحة"
              value={settings.maxLoginAttempts}
              onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              type="number"
              label="مدة التجميد (ساعات)"
              value={settings.lockDuration}
              onChange={(e) => setSettings({...settings, lockDuration: parseInt(e.target.value)})}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              type="number"
              label="مهلة الجلسة (دقائق)"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              size="small"
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enable2FA}
                  onChange={(e) => setSettings({...settings, enable2FA: e.target.checked})}
                />
              }
              label="تفعيل المصادقة بخطوتين (للأساتذة والمديرين)"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => setSettings({
                  enableBruteForceProtection: true,
                  enableFileScanning: true,
                  enableRateLimiting: true,
                  maxLoginAttempts: 5,
                  lockDuration: 24,
                  sessionTimeout: 60,
                  enable2FA: false
                })}
              >
                استعادة الافتراضيات
              </Button>
              <Button
                variant="contained"
                onClick={handleScanNow}
              >
                فحص النظام الآن
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => alert('تم حفظ الإعدادات')}
              >
                حفظ الإعدادات
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* حوار تفاصيل التنبيه */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedAlert && (
          <>
            <DialogTitle>
              تفاصيل التنبيه الأمني
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">النوع</Typography>
                  <Typography variant="body1">{getAlertTypeLabel(selectedAlert.type)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">المستخدم</Typography>
                  <Typography variant="body1">{selectedAlert.user}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">عنوان IP</Typography>
                  <Typography variant="body1" fontFamily="monospace">{selectedAlert.ip}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">الوقت</Typography>
                  <Typography variant="body1">{selectedAlert.time}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">الخطورة</Typography>
                  <Chip 
                    label={selectedAlert.severity === 'critical' ? 'حرج' : 
                           selectedAlert.severity === 'high' ? 'عالي' :
                           selectedAlert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                    color={getSeverityColor(selectedAlert.severity)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">الإجراءات المقترحة</Typography>
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {selectedAlert.severity === 'critical' && 'يجب التحقق الفوري من هذا الحادث.'}
                    {selectedAlert.severity === 'high' && 'يجب التحقق من هذا الحادث خلال 24 ساعة.'}
                    {selectedAlert.severity === 'medium' && 'يجب التحقق من هذا الحادث خلال 72 ساعة.'}
                    {selectedAlert.severity === 'low' && 'مراقبة الوضع.'}
                  </Alert>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>إغلاق</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  handleResolveAlert(selectedAlert.id);
                  handleCloseDialog();
                }}
              >
                تم الحل
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminSecurity;
