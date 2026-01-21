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
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as CourseIcon,
  Person as ProfessorIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const CoursesAdmin = () => {
  const [courses, setCourses] = useState([
    { id: 1, name: 'رياضيات هندسية 1', code: 'MATH101', professor: 'د. أحمد محمد', department: 'electrical', semester: 1, students: 45, files: 8, status: 'active' },
    { id: 2, name: 'فيزياء عامة', code: 'PHYS101', professor: 'د. سعاد علي', department: 'electrical', semester: 1, students: 38, files: 5, status: 'active' },
    { id: 3, name: 'كيمياء عامة', code: 'CHEM101', professor: 'د. خالد محمد', department: 'chemical', semester: 2, students: 52, files: 12, status: 'inactive' },
    { id: 4, name: 'برمجة 1', code: 'CS101', professor: 'د. فاطمة أحمد', department: 'computer', semester: 2, students: 60, files: 15, status: 'active' },
    { id: 5, name: 'ميكانيكا هندسية', code: 'MECH101', professor: 'د. عمر خالد', department: 'mechanical', semester: 3, students: 42, files: 7, status: 'active' }
  ]);

  const [professors] = useState([
    { id: 1, name: 'د. أحمد محمد', department: 'electrical' },
    { id: 2, name: 'د. سعاد علي', department: 'electrical' },
    { id: 3, name: 'د. خالد محمد', department: 'chemical' },
    { id: 4, name: 'د. فاطمة أحمد', department: 'computer' },
    { id: 5, name: 'د. عمر خالد', department: 'mechanical' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    professor: '',
    department: 'electrical',
    semester: 1
  });

  const departments = [
    { value: 'electrical', label: 'الهندسة الكهربائية' },
    { value: 'chemical', label: 'الهندسة الكيميائية' },
    { value: 'civil', label: 'الهندسة المدنية' },
    { value: 'mechanical', label: 'الهندسة الميكانيكية' },
    { value: 'medical', label: 'الهندسة الطبية' },
    { value: 'computer', label: 'هندسة الحاسوب' }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.professor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesSemester = semesterFilter === 'all' || course.semester.toString() === semesterFilter;
    
    return matchesSearch && matchesDepartment && matchesSemester;
  });

  const getDepartmentLabel = (dept: string) => {
    const department = departments.find(d => d.value === dept);
    return department ? department.label : dept;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const handleOpenDialog = (course: any = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        name: course.name,
        code: course.code,
        professor: course.professor,
        department: course.department,
        semester: course.semester
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        name: '',
        code: '',
        professor: professors[0]?.name || '',
        department: 'electrical',
        semester: 1
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
  };

  const handleSaveCourse = () => {
    if (editingCourse) {
      // تحديث المادة
      setCourses(courses.map(c => 
        c.id === editingCourse.id ? { 
          ...c, 
          ...courseForm,
          students: c.students,
          files: c.files
        } : c
      ));
    } else {
      // إضافة مادة جديدة
      const newCourse = {
        id: courses.length + 1,
        ...courseForm,
        students: 0,
        files: 0,
        status: 'active'
      };
      setCourses([...courses, newCourse]);
    }
    handleCloseDialog();
  };

  const handleToggleStatus = (courseId: number) => {
    setCourses(courses.map(course =>
      course.id === courseId 
        ? { ...course, status: course.status === 'active' ? 'inactive' : 'active' }
        : course
    ));
  };

  const handleDeleteCourse = (courseId: number) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      setCourses(courses.filter(course => course.id !== courseId));
    }
  };

  const handleAssignProfessor = (courseId: number) => {
    const professorName = prompt('أدخل اسم الأستاذ الجديد:');
    if (professorName) {
      setCourses(courses.map(course =>
        course.id === courseId 
          ? { ...course, professor: professorName }
          : course
      ));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        📚 إدارة المواد (مدير النظام)
      </Typography>

      {/* الإحصائيات */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{courses.length}</Typography>
            <Typography variant="body2" color="textSecondary">مادة إجمالاً</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{courses.filter(c => c.status === 'active').length}</Typography>
            <Typography variant="body2" color="textSecondary">مادة نشطة</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{courses.reduce((sum, c) => sum + c.students, 0)}</Typography>
            <Typography variant="body2" color="textSecondary">طالب إجمالاً</Typography>
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
              إضافة مادة
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
              placeholder="ابحث عن مادة..."
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
              label="التخصص"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              InputProps={{
                startAdornment: <FilterIcon sx={{ mr: 1, color: '#666' }} />
              }}
            >
              <MenuItem value="all">جميع التخصصات</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.value} value={dept.value}>
                  {dept.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="السمستر"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              <MenuItem value="all">جميع السمسترات</MenuItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                <MenuItem key={sem} value={sem.toString()}>
                  السمستر {sem}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('all');
                setSemesterFilter('all');
              }}
            >
              إعادة تعيين
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* جدول المواد */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>اسم المادة</TableCell>
              <TableCell>الكود</TableCell>
              <TableCell>الأستاذ</TableCell>
              <TableCell>التخصص</TableCell>
              <TableCell>السمستر</TableCell>
              <TableCell align="center">الطلاب</TableCell>
              <TableCell align="center">الملفات</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CourseIcon sx={{ mr: 1, color: '#666' }} />
                    {course.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={course.code} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ProfessorIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                    {course.professor}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getDepartmentLabel(course.department)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip label={`س ${course.semester}`} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Chip label={course.students} size="small" color="primary" />
                </TableCell>
                <TableCell align="center">
                  <Chip label={course.files} size="small" color="secondary" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={course.status === 'active' ? 'نشطة' : 'غير نشطة'}
                    color={getStatusColor(course.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDialog(course)}
                    title="تعديل"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleAssignProfessor(course.id)}
                    title="تعيين أستاذ"
                  >
                    <ProfessorIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleToggleStatus(course.id)}
                    title={course.status === 'active' ? 'تعطيل' : 'تفعيل'}
                  >
                    <ViewIcon fontSize="small" color={course.status === 'active' ? 'success' : 'error'} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteCourse(course.id)}
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

      {/* حوار إضافة/تعديل مادة */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCourse ? 'تعديل المادة' : 'إضافة مادة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="اسم المادة"
                value={courseForm.name}
                onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="كود المادة"
                value={courseForm.code}
                onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>الأستاذ</InputLabel>
                <Select
                  value={courseForm.professor}
                  label="الأستاذ"
                  onChange={(e) => setCourseForm({...courseForm, professor: e.target.value})}
                >
                  {professors.map((prof) => (
                    <MenuItem key={prof.id} value={prof.name}>
                      {prof.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="التخصص"
                value={courseForm.department}
                onChange={(e) => setCourseForm({...courseForm, department: e.target.value})}
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
                select
                label="السمستر"
                value={courseForm.semester}
                onChange={(e) => setCourseForm({...courseForm, semester: parseInt(e.target.value)})}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    السمستر {sem}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSaveCourse} variant="contained">
            {editingCourse ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CoursesAdmin;
