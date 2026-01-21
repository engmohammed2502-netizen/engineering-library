import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Person as PersonIcon,
  School as StudentIcon,
  Engineering as ProfessorIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const AdminUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, username: 'zero', displayName: 'مدير النظام', role: 'root', department: null, status: 'active', createdAt: '2024-01-01', lastLogin: '2024-01-15' },
    { id: 2, username: 'د.أحمد', displayName: 'د. أحمد محمد', role: 'professor', department: 'electrical', status: 'active', createdAt: '2024-01-02', lastLogin: '2024-01-14' },
    { id: 3, username: '20231001', displayName: 'محمد أحمد', role: 'student', department: 'electrical', status: 'active', createdAt: '2024-01-03', lastLogin: '2024-01-13' },
    { id: 4, username: '20231002', displayName: 'سارة محمد', role: 'student', department: 'chemical', status: 'inactive', createdAt: '2024-01-04', lastLogin: '2024-01-10' },
    { id: 5, username: 'د.سعاد', displayName: 'د. سعاد علي', role: 'professor', department: 'civil', status: 'active', createdAt: '2024-01-05', lastLogin: '2024-01-12' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    displayName: '',
    role: 'student',
    department: 'electrical',
    password: ''
  });

  const roles = [
    { value: 'student', label: 'طالب', icon: <StudentIcon /> },
    { value: 'professor', label: 'أستاذ', icon: <ProfessorIcon /> },
    { value: 'admin', label: 'مدير', icon: <AdminIcon /> },
    { value: 'root', label: 'مدير النظام', icon: <PersonIcon /> }
  ];

  const departments = [
    { value: 'electrical', label: 'الهندسة الكهربائية' },
    { value: 'chemical', label: 'الهندسة الكيميائية' },
    { value: 'civil', label: 'الهندسة المدنية' },
    { value: 'mechanical', label: 'الهندسة الميكانيكية' },
    { value: 'medical', label: 'الهندسة الطبية' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'student': return <StudentIcon fontSize="small" />;
      case 'professor': return <ProfessorIcon fontSize="small" />;
      case 'admin': return <AdminIcon fontSize="small" />;
      case 'root': return <PersonIcon fontSize="small" />;
      default: return <PersonIcon fontSize="small" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'student': return 'primary';
      case 'professor': return 'secondary';
      case 'admin': return 'info';
      case 'root': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const handleOpenDialog = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        department: user.department || 'electrical',
        password: ''
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: '',
        displayName: '',
        role: 'student',
        department: 'electrical',
        password: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      // تحديث المستخدم
      setUsers(users.map(u => 
        u.id === editingUser.id ? { ...u, ...userForm } : u
      ));
    } else {
      // إضافة مستخدم جديد
      const newUser = {
        id: users.length + 1,
        ...userForm,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'لم يسجل دخول'
      };
      setUsers([...users, newUser]);
    }
    handleCloseDialog();
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(users.map(user =>
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        👥 إدارة المستخدمين
      </Typography>

      {/* الإحصائيات */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{users.length}</Typography>
            <Typography variant="body2" color="textSecondary">مستخدم إجمالاً</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{users.filter(u => u.role === 'student').length}</Typography>
            <Typography variant="body2" color="textSecondary">طالب</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{users.filter(u => u.role === 'professor').length}</Typography>
            <Typography variant="body2" color="textSecondary">أستاذ</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              إضافة مستخدم
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* البحث والتصفية */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="ابحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="الدور"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              InputProps={{
                startAdornment: <FilterIcon sx={{ mr: 1, color: '#666' }} />
              }}
            >
              <MenuItem value="all">جميع الأدوار</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {role.icon}
                    <Typography sx={{ mr: 1 }}>{role.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="الحالة"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">جميع الحالات</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="inactive">غير نشط</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
            >
              إعادة تعيين
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* جدول المستخدمين */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>اسم المستخدم</TableCell>
              <TableCell>الاسم المعروض</TableCell>
              <TableCell>الدور</TableCell>
              <TableCell>التخصص</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>تاريخ الإنشاء</TableCell>
              <TableCell>آخر دخول</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getRoleIcon(user.role)}
                    <Typography sx={{ mr: 1 }}>{user.username}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role === 'student' ? 'طالب' : 
                           user.role === 'professor' ? 'أستاذ' : 
                           user.role === 'admin' ? 'مدير' : 'مدير النظام'}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.department ? (
                    <Chip 
                      label={departments.find(d => d.value === user.department)?.label || user.department}
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="caption" color="textSecondary">-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status === 'active' ? 'نشط' : 'غير نشط'}
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(user)}
                    title="تعديل"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleToggleStatus(user.id)}
                    title={user.status === 'active' ? 'تعطيل' : 'تفعيل'}
                  >
                    {user.status === 'active' ? 
                      <LockIcon fontSize="small" color="warning" /> : 
                      <UnlockIcon fontSize="small" color="success" />
                    }
                  </IconButton>
                  {user.role !== 'root' && (
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteUser(user.id)}
                      title="حذف"
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* حوار إضافة/تعديل مستخدم */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="اسم المستخدم"
                value={userForm.username}
                onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                disabled={!!editingUser}
                helperText="للطلاب: الرقم الجامعي، للأساتذة: الاسم"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="الاسم المعروض"
                value={userForm.displayName}
                onChange={(e) => setUserForm({...userForm, displayName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="الدور"
                value={userForm.role}
                onChange={(e) => setUserForm({...userForm, role: e.target.value})}
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {role.icon}
                      <Typography sx={{ mr: 1 }}>{role.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="التخصص"
                value={userForm.department}
                onChange={(e) => setUserForm({...userForm, department: e.target.value})}
                disabled={userForm.role === 'root'}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label={editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                helperText="كلمة المرور يجب أن تكون بين 6 و12 حرفاً"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {editingUser ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;
