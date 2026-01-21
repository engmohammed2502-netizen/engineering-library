import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Engineering, School, Email, Phone, LocationOn } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#1a237e',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Engineering sx={{ mr: 1, fontSize: 30 }} />
              <Typography variant="h6">
                مكتبة كلية الهندسة
              </Typography>
            </Box>
            <Typography variant="body2">
              نظام إلكتروني متكامل لإدارة المحتوى التعليمي لكلية الهندسة، 
              جامعة البحر الأحمر.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              روابط سريعة
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/departments" color="inherit" underline="hover">
                التخصصات الهندسية
              </Link>
              <Link href="/courses" color="inherit" underline="hover">
                المواد الدراسية
              </Link>
              <Link href="/forum" color="inherit" underline="hover">
                منتدى النقاش
              </Link>
              <Link href="/help" color="inherit" underline="hover">
                المساعدة والدعم
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              اتصل بنا
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <School sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  كلية الهندسة - جامعة البحر الأحمر
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  السودان - ولاية البحر الأحمر
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  engineering-library@rsu.edu
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  +249 123 456 789
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} مكتبة كلية الهندسة. جميع الحقوق محفوظة.
          </Typography>
          <Typography variant="body2">
            الإصدار 1.0.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
