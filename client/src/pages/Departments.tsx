import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button
} from '@mui/material';
import {
  Bolt as ElectricalIcon,
  Science as ChemicalIcon,
  Engineering as CivilIcon,
  Build as MechanicalIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';

const departments = [
  {
    id: 'electrical',
    name: 'الهندسة الكهربائية',
    icon: <ElectricalIcon sx={{ fontSize: 40 }} />,
    color: '#FF6B6B',
    description: 'شبكات الطاقة، الإلكترونيات، التحكم الآلي'
  },
  {
    id: 'chemical',
    name: 'الهندسة الكيميائية',
    icon: <ChemicalIcon sx={{ fontSize: 40 }} />,
    color: '#4ECDC4',
    description: 'التفاعلات الكيميائية، العمليات، المواد'
  },
  {
    id: 'civil',
    name: 'الهندسة المدنية',
    icon: <CivilIcon sx={{ fontSize: 40 }} />,
    color: '#45B7D1',
    description: 'إنشاءات، طرق، جسور، مباني'
  },
  {
    id: 'mechanical',
    name: 'الهندسة الميكانيكية',
    icon: <MechanicalIcon sx={{ fontSize: 40 }} />,
    color: '#96CEB4',
    description: 'آلات، تصميم، تصنيع، طاقة'
  },
  {
    id: 'medical',
    name: 'الهندسة الطبية',
    icon: <MedicalIcon sx={{ fontSize: 40 }} />,
    color: '#FFEAA7',
    description: 'أجهزة طبية، هندسة حيوية، أطراف صناعية'
  }
];

const DepartmentsPage = () => {
  const handleDepartmentClick = (deptId: string) => {
    // الانتقال لصفحة السمسترات
    window.location.href = `/semesters?department=${deptId}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
        🎓 التخصصات الهندسية
      </Typography>
      
      <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 6 }}>
        اختر تخصصك للوصول للمواد الدراسية
      </Typography>

      <Grid container spacing={3}>
        {departments.map((dept) => (
          <Grid item xs={12} sm={6} md={4} key={dept.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                },
                cursor: 'pointer'
              }}
              onClick={() => handleDepartmentClick(dept.id)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  justifyContent: 'center'
                }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${dept.color}20`,
                    color: dept.color,
                    mr: 2
                  }}>
                    {dept.icon}
                  </Box>
                </Box>
                
                <Typography variant="h5" gutterBottom align="center">
                  {dept.name}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" align="center">
                  {dept.description}
                </Typography>
              </CardContent>
              
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button 
                  variant="contained"
                  sx={{ 
                    bgcolor: dept.color,
                    '&:hover': { bgcolor: dept.color, opacity: 0.9 }
                  }}
                >
                  عرض المواد
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DepartmentsPage;
