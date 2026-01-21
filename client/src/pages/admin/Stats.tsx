import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  School as StudentIcon,
  Person as ProfessorIcon,
  Download as DownloadIcon,
  Forum as ForumIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

const AdminStats = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 156,
    activeUsers: 23,
    totalStudents: 142,
    totalProfessors: 14,
    totalCourses: 28,
    totalFiles: 324,
    totalDownloads: 1245,
    forumPosts: 89
  });

  const [departmentStats, setDepartmentStats] = useState([
    { name: 'كهربائية', students: 45, courses: 8, downloads: 320 },
    { name: 'كيميائية', students: 38, courses: 7, downloads: 280 },
    { name: 'مدنية', students: 32, courses: 6, downloads: 240 },
    { name: 'ميكانيكية', students: 28, courses: 5, downloads: 210 },
    { name: 'طبية', students: 15, courses: 3, downloads: 120 }
  ]);

  const [downloadTrend, setDownloadTrend] = useState([
    { date: '1 ينا', downloads: 45 },
    { date: '2 ينا', downloads: 52 },
    { date: '3 ينا', downloads: 38 },
    { date: '4 ينا', downloads: 67 },
    { date: '5 ينا', downloads: 58 },
    { date: '6 ينا', downloads: 72 },
    { date: '7 ينا', downloads: 65 }
  ]);

  const [activeHours, setActiveHours] = useState([
    { hour: '8 ص', users: 12 },
    { hour: '10 ص', users: 45 },
    { hour: '12 م', users: 68 },
    { hour: '2 م', users: 52 },
    { hour: '4 م', users: 38 },
    { hour: '6 م', users: 25 },
    { hour: '8 م', users: 18 }
  ]);

  const [topCourses, setTopCourses] = useState([
    { name: 'رياضيات هندسية 1', downloads: 245, students: 45 },
    { name: 'فيزياء عامة', downloads: 198, students: 38 },
    { name: 'برمجة 1', downloads: 176, students: 52 },
    { name: 'كيمياء عامة', downloads: 154, students: 32 },
    { name: 'ميكانيكا هندسية', downloads: 132, students: 28 }
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {title}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 50, 
            height: 50, 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}20`,
            color: color
          }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TrendingIcon sx={{ fontSize: 16, color: trend > 0 ? '#4caf50' : '#f44336' }} />
            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
              {trend > 0 ? '+' : ''}{trend}% عن الشهر الماضي
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const handleRefresh = () => {
    // API call هنا سيكون 
    alert('جاري تحديث الإحصائيات...');
  };

  const handleExport = () => {
    alert('جاري تصدير البيانات...');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* العنوان */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3">
          📊 لوحة الإحصائيات
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={handleRefresh} title="تحديث البيانات">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleExport} title="تصدير البيانات">
            <ExportIcon />
          </IconButton>
        </Box>
      </Box>

      {/* الفلاتر */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>الفترة الزمنية</InputLabel>
              <Select
                value={timeRange}
                label="الفترة الزمنية"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="today">اليوم</MenuItem>
                <MenuItem value="week">الأسبوع</MenuItem>
                <MenuItem value="month">الشهر</MenuItem>
                <MenuItem value="year">السنة</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>التخصص</InputLabel>
              <Select
                value={departmentFilter}
                label="التخصص"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="all">جميع التخصصات</MenuItem>
                <MenuItem value="electrical">الهندسة الكهربائية</MenuItem>
                <MenuItem value="chemical">الهندسة الكيميائية</MenuItem>
                <MenuItem value="civil">الهندسة المدنية</MenuItem>
                <MenuItem value="mechanical">الهندسة الميكانيكية</MenuItem>
                <MenuItem value="medical">الهندسة الطبية</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="action" />
              <Typography variant="body2" color="textSecondary">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* الإحصائيات الأساسية */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="المستخدمون النشطون"
            value={stats.activeUsers}
            icon={<PeopleIcon />}
            color="#2196f3"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="إجمالي الطلاب"
            value={stats.totalStudents}
            icon={<StudentIcon />}
            color="#4caf50"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="إجمالي الأساتذة"
            value={stats.totalProfessors}
            icon={<ProfessorIcon />}
            color="#ff9800"
            trend={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="إجمالي التنزيلات"
            value={stats.totalDownloads}
            icon={<DownloadIcon />}
            color="#9c27b0"
            trend={23}
          />
        </Grid>
      </Grid>

      {/* الرسوم البيانية */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* توزيع التنزيلات على التخصصات */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              📈 توزيع التنزيلات على التخصصات
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="downloads" name="التنزيلات" fill="#8884d8" />
                <Bar dataKey="students" name="الطلاب" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* نسبة التخصصات */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              🎯 توزيع الطلاب على التخصصات
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.students}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="students"
                  nameKey="name"
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* اتجاه التنزيلات */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 اتجاه التنزيلات خلال الأسبوع
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={downloadTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="downloads" 
                  name="التنزيلات" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* ساعات النشاط */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ⏰ ساعات النشاط خلال اليوم
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activeHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" name="المستخدمون النشطون" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* أكثر المواد تنزيلاً */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          🏆 أكثر المواد تنزيلاً
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>#</TableCell>
                <TableCell>اسم المادة</TableCell>
                <TableCell align="center">عدد الطلاب</TableCell>
                <TableCell align="center">التنزيلات</TableCell>
                <TableCell align="center">النسبة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topCourses.map((course, index) => {
                const percentage = Math.round((course.downloads / stats.totalDownloads) * 100);
                return (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Chip label={index + 1} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell align="center">
                      <Chip label={course.students} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={course.downloads} size="small" color="secondary" />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ width: '100%', height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">{percentage}%</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AdminStats;
