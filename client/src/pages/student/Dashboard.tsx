import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationsIcon,
  Forum as ForumIcon
} from '@mui/icons-material';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 5,
    downloadedFiles: 23,
    forumPosts: 7,
    averageGrade: 85
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: 'تنزيل ملف', course: 'رياضيات هندسية 1', time: 'منذ ساعتين' },
    { id: 2, action: 'مشاركة في المنتدى', course: 'فيزياء عامة', time: 'منذ يوم' },
    { id: 3, action: 'تنزيل ملف', course: 'كيمياء عامة', time: 'منذ يومين' },
    { id: 4, action: 'مشاهدة محاضرة', course: 'برمجة 1', time: 'منذ 3 أيام' }
  ]);

  const [upcomingDeadlines, setUpcomingDeadlines] = useState([
    { id: 1, course: 'رياضيات هندسية 1', task: 'تسليم التمارين', due: 'غداً' },
    { id: 2, course: 'فيزياء عامة', task: 'امتحان منتصف الفصل', due: 'بعد 3 أيام' }
  ]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* الترحيب */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#e3f2fd' }}>
        <Typography variant="h4" gutterBottom>
          👋 مرحباً بك، محمد!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          هذه نظرة عامة على نشاطك الدراسي
        </Typography>
      </Paper>

      {/* الإحصائيات */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  mr: 2
                }}>
                  <SchoolIcon />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.enrolledCourses}</Typography>
                  <Typography variant="body2" color="textSecondary">المسجل بها</Typography>
                </Box>
              </Box>
              <Button size="small" fullWidth variant="outlined">
                عرض المواد
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#e8f5e9',
                  color: '#4caf50',
                  mr: 2
                }}>
                  <DownloadIcon />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.downloadedFiles}</Typography>
                  <Typography variant="body2" color="textSecondary">ملف منزلة</Typography>
                </Box>
              </Box>
              <Button size="small" fullWidth variant="outlined">
                سجل التنزيلات
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#fff3e0',
                  color: '#ff9800',
                  mr: 2
                }}>
                  <ForumIcon />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.forumPosts}</Typography>
                  <Typography variant="body2" color="textSecondary">مشاركة</Typography>
                </Box>
              </Box>
              <Button size="small" fullWidth variant="outlined">
                المنتدى
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f3e5f5',
                  color: '#9c27b0',
                  mr: 2
                }}>
                  <TrendingIcon />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.averageGrade}%</Typography>
                  <Typography variant="body2" color="textSecondary">المعدل</Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.averageGrade} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* الأنشطة الحديثة */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 1 }} />
              الأنشطة الحديثة
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <ListItemIcon>
                    <BookIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.action}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {activity.course}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
                          • {activity.time}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button fullWidth variant="text" sx={{ mt: 2 }}>
              عرض كل الأنشطة
            </Button>
          </Paper>
        </Grid>

        {/* المواعيد القادمة */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              المواعيد القادمة
            </Typography>
            <List>
              {upcomingDeadlines.map((deadline) => (
                <ListItem key={deadline.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <ListItemIcon>
                    <Chip label={deadline.due} color="warning" size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={deadline.task}
                    secondary={deadline.course}
                  />
                </ListItem>
              ))}
            </List>
            <Button fullWidth variant="contained" sx={{ mt: 2 }}>
              إضافة تذكير
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* الإجراءات السريعة */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          🚀 الإجراءات السريعة
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined" startIcon={<BookIcon />}>
              المواد
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined" startIcon={<DownloadIcon />}>
              التنزيلات
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined" startIcon={<ForumIcon />}>
              المنتدى
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined" startIcon={<ScheduleIcon />}>
              الجدول
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined">
              الإعدادات
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button fullWidth variant="outlined">
              المساعدة
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentDashboard;
