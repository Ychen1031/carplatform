import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import NewCarsPage from './components/NewCarsPage';
import UsedCarsPage from './components/UsedCarsPage';
import AboutPage from './components/AboutPage';
import MyFavoritesPage from './components/MyFavoritesPage';
import ContactPage from './components/ContactPage';
import PostPage from './components/PostPage';
import LoginPage from './components/LoginPage';
import EditProfilePage from './components/EditProfilePage';
import MessagesPage from './components/MessagesPage';
import MyListingsPage from './components/MyListingsPage';
import EditCarPage from './components/EditCarPage';
import ProtectedRoute from './components/ProtectedRoute';
import { CarProvider } from './contexts/CarContext';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

// Ant Design 主題配置
const antTheme = {
  token: {
    colorPrimary: '#d9863d', // 主要顏色 (sun-500)
    colorSuccess: '#2f866f', // 成功顏色 (mint-500)
    borderRadius: 6,
    fontFamily: 'inherit',
  },
  components: {
    Card: {
      colorBgContainer: '#ffffff',
      boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.06)',
    },
    Button: {
      colorPrimary: '#d9863d',
    },
    Tag: {
      colorBgContainer: '#f5f2eb',
      colorTextBase: '#5d5b62',
    },
  },
};

function App() {
  return (
    <ConfigProvider theme={antTheme}>
      <ToastProvider>
        <CarProvider>
          <Router>
            <div className="app-shell">
              <Header />
              
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/new-cars" element={<NewCarsPage />} />
                <Route path="/used-cars" element={<UsedCarsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <MyFavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/admin/messages" element={<MessagesPage />} />
                <Route
                  path="/post"
                  element={
                    <ProtectedRoute>
                      <PostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-listings"
                  element={
                    <ProtectedRoute>
                      <MyListingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-car/:carId"
                  element={
                    <ProtectedRoute>
                      <EditCarPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/profile/edit" element={<EditProfilePage />} />
              </Routes>

            <Footer />
          </div>
        </Router>
      </CarProvider>
    </ToastProvider>
    </ConfigProvider>
  );
}

export default App;
