import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Match from './pages/Match';
import Profile from './pages/Profile';
import PostApprentice from './pages/PostApprentice';
import PostSeeker from './pages/PostSeeker';
import PostDetail from './pages/PostDetail';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="jz-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/match" element={<Match />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/post/apprentice" element={<PostApprentice />} />
            <Route path="/post/seeker" element={<PostSeeker />} />
            <Route path="/post/:id" element={<PostDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
