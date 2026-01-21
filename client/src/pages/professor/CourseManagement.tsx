import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  School as CourseIcon
} from '@mui/icons-material';

const CourseManagement = () => {
  const [courses, setCourses] = useState([
    { id: 1, name: 'رياضيات هندسية 1', code: 'MATH101', semester: 1, students: 45, files: 8, lastUpdate: '2024-01-15' },
    { id: 2, name: 'فيزياء عامة', code: 'PHYS101', semester: 1, students: 38, files: 5, lastUpdate: '2024-01-10' },
    { id: 3, name: 'برمجة 1', code: 'CS101', semester: 2, students: 52, files: 12, lastUpdate: '2024-01-12' }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    semester: 1,
    department: 'electrical'
  });

  const handleOpenDialog = (course: any = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        name: course.name,
        code: course.code,
        semester: course.semester,
        department: 'electrical'
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        name: '',
        code: '',
        semester: 1,
        department: 'electrical'
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
        c.id === editingCourse.id ? { ...c, ...courseForm } : c
      ));
    } else {
      // إضافة مادة جديدة
      const newCourse = {
        id: courses.length + 1,
        ...courseForm,
        students: 0,
        files: 0,
        lastUpdate: new Date().toISOString().split('T')[0]
      };
      setCourses([...courses, newCourse]);
    }
    handleCloseDialog();
  };

  const handleDeleteCourse = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handleUploadFile = (courseId: number) => {
    alert(`سيتم رفع ملف للمادة ${courseId}`);
    // API call هنا سيكون 
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        📚 إدارة المواد الدراسية
      </Typography>

      {/* إضافة مادة جديدة */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">موادك الدراسية</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            إضافة مادة جديدة
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary">
          يمكنك إضافة مواد جديدة، تعديل المواد الحالية، وإدارة ملفات كل مادة
        </Typography>
      </Paper>

      {/* إحصائيات سريعة */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{courses.length}</Typography>
              <Typography variant="body2" color="textSecondary">مادة تدرسها</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{courses.reduce((sum, c) => sum + c.students, 0)}</Typography>
              <Typography variant="body2" color="textSecondary">طالب إجمالاً</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{courses.reduce((sum, c) => sum + c.files, 0)}</Typography>
              <Typography variant="body2" color="textSecondary">ملف مرفوع</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => alert('رفع ملف لجميع المواد')}
              >
                رفع ملف للكل
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* جدول المواد */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>اسم المادة</TableCell>
              <TableCell>الكود</TableCell>
              <TableCell>السمستر</TableCell>
              <TableCell align="center">عدد الطلاب</TableCell>
              <TableCell align="center">الملفات</TableCell>
              <TableCell>آخر تحديث</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
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
                <TableCell>السمستر {course.semester}</TableCell>
                <TableCell align="center">
                  <Chip label={course.students} size="small" color="primary" />
                </TableCell>
                <TableCell align="center">
                  <Chip label={course.files} size="small" color="secondary" />
                </TableCell>
                <TableCell>{course.lastUpdate}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleUploadFile(course.id)} title="رفع ملف">
                    <UploadIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleOpenDialog(course)} title="تعديل">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteCourse(course.id)} title="حذف">
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
            <Grid item xs={12}>
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
              <TextField
                fullWidth
                select
                label="السمستر"
                value={courseForm.semester}
                onChange={(e) => setCourseForm({...courseForm, semester: parseInt(e.target.value)})}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <MenuItem key={num} value={num}>
                    السمستر {num}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="التخصص"
                value={courseForm.department}
                onChange={(e) => setCourseForm({...courseForm, department: e.target.value})}
              >
                <MenuItem value="electrical">الهندسة الكهربائية</MenuItem>
                <MenuItem value="chemical">الهندسة الكيميائية</MenuItem>
                <MenuItem value="civil">الهندسة المدنية</MenuItem>
                <MenuItem value="mechanical">الهندسة الميكانيكية</MenuItem>
                <MenuItem value="medical">الهندسة الطبية</MenuItem>
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

export default CourseManagement;
