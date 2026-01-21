import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button
} from '@mui/material';
import {
  School as SemesterIcon,
  ArrowBack as BackIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SemestersPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const department = searchParams.get('department');
  
  const [semesters, setSemesters] = useState([
    { number: 1, coursesCount: 8, lastUpdate: '2024-01-15' },
    { number: 2, coursesCount: 7, lastUpdate: '2024-01-10' },
    { number: 3, coursesCount: 9, lastUpdate: '2024-01-12' },
    { number: 4, coursesCount: 8, lastUpdate: '2024-01-08' },
    { number: 5, coursesCount: 7, lastUpdate: '2024-01-05' },
    { number: 6, coursesCount: 8, lastUpdate: '2024-01-03' },
    { number: 7, coursesCount: 6, lastUpdate: '2023-12-28' },
    { number: 8, coursesCount: 7, lastUpdate: '2023-12-25' },
    { number: 9, coursesCount: 5, lastUpdate: '2023-12-20' },
    { number: 10, coursesCount: 4, lastUpdate: '2023-12-15' }
  ]);

  const getDepartmentName = (dept: string | null) => {
    switch(dept) {
      case 'electrical': return 'الهندسة الكهربائية';
      case 'chemical': return 'الهندسة الكيميائية';
      case 'civil': return 'الهندسة المدنية';
      case 'mechanical': return 'الهندسة الميكانيكية';
      case 'medical': return 'الهندسة الطبية';
      default: return 'جميع التخصصات';
    }
  };

  const handleSemesterClick = (semesterNumber: number) => {
    navigate(`/courses?department=${department}&semester=${semesterNumber}`);
  };

  const handleBack = () => {
    navigate('/departments');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* العنوان */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          رجوع
        </Button>
        <Box>
          <Typography variant="h3" gutterBottom>
            السمسترات الدراسية
          </Typography>
          <Typography variant="h6" color="primary">
            {getDepartmentName(department)}
          </Typography>
        </Box>
      </Box>

      {/* الإحصائية */}
      <Card sx={{ mb: 4, bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <TrendingIcon sx={{ fontSize: 40, color: '#4caf50' }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h6">
                إجمالي المواد في هذا التخصص: {semesters.reduce((sum, sem) => sum + sem.coursesCount, 0)} مادة
              </Typography>
              <Typography variant="body2" color="textSecondary">
                اختر السمستر لعرض المواد الدراسية
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* قائمة السمسترات */}
      <Grid container spacing={3}>
        {semesters.map((semester) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={semester.number}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
              onClick={() => handleSemesterClick(semester.number)}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ 
                  width: 70, 
                  height: 70, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                  mx: 'auto',
                  mb: 2
                }}>
                  <SemesterIcon sx={{ fontSize: 35 }} />
                </Box>
                
                <Typography variant="h4" gutterBottom color="primary">
                  السمستر {semester.number}
                </Typography>
                
                <Chip 
                  label={`${semester.coursesCount} مادة`}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                
                <Typography variant="body2" color="textSecondary">
                  آخر تحديث: {semester.lastUpdate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SemestersPage;
