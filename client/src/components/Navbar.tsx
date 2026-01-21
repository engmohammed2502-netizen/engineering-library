import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School,
  Engineering,
  LibraryBooks,
  Forum,
  Dashboard,
  Person,
  Logout,
  Notifications,
  Settings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { role, displayName } = user;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getRoleLabel = () => {
    switch(role) {
      case 'student': return 'طالب';
      case 'professor': return 'أستاذ';
      case 'root': return 'مدير النظام';
      default: return 'مستخدم';
    }
  };

  const getRoleColor = () => {
    switch(role) {
      case 'student': return 'primary';
      case 'professor': return 'secondary';
      case 'root': return 'warning';
      default: return 'default';
    }
  };

  const drawer = (
    <Box sx={{ width: 250, pt: 8 }} onClick={handleDrawerToggle}>
      <List>
        <ListItem button onClick={() => navigate('/departments')}>
          <ListItemIcon><School /></ListItemIcon>
          <ListItemText primary="التخصصات" />
        </ListItem>
        
        <ListItem button onClick={() => navigate('/courses')}>
          <ListItemIcon><LibraryBooks /></ListItemIcon>
          <ListItemText primary="المواد الدراسية" />
        </ListItem>
        
        <ListItem button onClick={() => navigate('/forum/1')}>
          <ListItemIcon><Forum /></ListItemIcon>
          <ListItemText primary="المنتدى" />
        </ListItem>
        
        {role === 'student' && (
          <ListItem button onClick={() => navigate('/student/dashboard')}>
            <ListItemIcon><Dashboard /></ListItemIcon>
            <ListItemText primary="لوحة الطالب" />
          </ListItem>
        )}
        
        {['professor', 'root'].includes(role) && (
          <ListItem button onClick={() => navigate('/professor/dashboard')}>
            <ListItemIcon><Dashboard /></ListItemIcon>
            <ListItemText primary="لوحة الأستاذ" />
          </ListItem>
        )}
        
        {role === 'root' && (
          <ListItem button onClick={() => navigate('/admin')}>
            <ListItemIcon><Engineering /></ListItemIcon>
            <ListItemText primary="لوحة الإدارة" />
          </ListItem>
        )}
      </List>
      
      <Divider />
      
      <List>
        <ListItem button onClick={() => navigate('/profile')}>
          <ListItemIcon><Person /></ListItemIcon>
          <ListItemText primary="الملف الشخصي" />
        </ListItem>
        
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="تسجيل الخروج" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* شعار وأيقونة القائمة للجوال */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* الشعار */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Engineering sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
              مكتبة كلية الهندسة
            </Typography>
            <Typography variant="h6" noWrap sx={{ display: { xs: 'block', sm: 'none' } }}>
              المكتبة
            </Typography>
          </Box>

          {/* التنقل للشاشات الكبيرة */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/departments')}>
              التخصصات
            </Button>
            <Button color="inherit" onClick={() => navigate('/courses')}>
              المواد
            </Button>
            <Button color="inherit" onClick={() => navigate('/forum/1')}>
              المنتدى
            </Button>
            
            {role === 'student' && (
              <Button color="inherit" onClick={() => navigate('/student/dashboard')}>
                لوحتي
              </Button>
            )}
            
            {['professor', 'root'].includes(role) && (
              <Button color="inherit" onClick={() => navigate('/professor/dashboard')}>
                لوحة الأستاذ
              </Button>
            )}
            
            {role === 'root' && (
              <Button color="inherit" onClick={() => navigate('/admin')}>
                الإدارة
              </Button>
            )}
          </Box>

          {/* الإشعارات */}
          <IconButton color="inherit" sx={{ ml: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* حساب المستخدم */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Chip
              label={getRoleLabel()}
              size="small"
              color={getRoleColor() as any}
              sx={{ mr: 1 }}
            />
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                {displayName?.charAt(0) || '?'}
              </Avatar>
            </IconButton>
          </Box>

          {/* قائمة المستخدم */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/profile')}>
              <Person sx={{ ml: 1 }} />
              الملف الشخصي
            </MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>
              <Settings sx={{ ml: 1 }} />
              الإعدادات
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ ml: 1 }} />
              تسجيل الخروج
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* القائمة الجانبية للجوال */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
