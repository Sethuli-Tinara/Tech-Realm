import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  // The login token is kept in the browser so you stay logged in after a refresh.
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <nav className="nav">
        <Link to="/" className="brand">Tech Realm</Link>
        <div className="nav-links">
          {token ? (
            <>
              <Link to="/dashboard">My Realm</Link>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Enter the Realm</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Auth onLogin={handleLogin} />}
        />
        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
