import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// إنشاء theme بسيط مباشرة هنا
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#4A90E2' },
    secondary: { main: '#00BCD4' },
  },
});

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 style={{ color: '#4A90E2' }}>🎓 مكتبة كلية الهندسة</h1>
      <h2 style={{ color: '#00BCD4' }}>جامعة البحر الأحمر</h2>
      <p>مرحباً بك في نظام المكتبة الرقمية</p>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
