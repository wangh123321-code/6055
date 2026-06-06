import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="jz-navbar">
      <div className="jz-navbar-inner">
        <Link to="/" className="jz-navbar-brand">剪纸社区</Link>
        <div className="jz-navbar-links">
          <Link to="/" className="jz-navbar-link">首页</Link>
          <Link to="/match" className="jz-navbar-link">师徒匹配</Link>
          {user && (
            <>
              <Link to="/post/apprentice" className="jz-navbar-link">发布收徒帖</Link>
              <Link to="/post/seeker" className="jz-navbar-link">发布求师帖</Link>
            </>
          )}
        </div>
        <div className="jz-navbar-right">
          {user ? (
            <div className="jz-navbar-user">
              <Link to={`/profile/${user._id}`} className="jz-navbar-username">{user.username}</Link>
              <button className="jz-btn jz-btn-outline" onClick={handleLogout}>退出</button>
            </div>
          ) : (
            <div className="jz-navbar-auth">
              <Link to="/login" className="jz-btn jz-btn-outline">登录</Link>
              <Link to="/register" className="jz-btn jz-btn-primary">注册</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
