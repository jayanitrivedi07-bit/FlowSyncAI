import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import FloatingChat from './components/FloatingChat';
import Home from './pages/Home';
import MapView from './pages/Map';
import Entry from './pages/Entry';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import UserStats from './pages/UserStats';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/map"     element={<MapView />} />
            <Route path="/entry"   element={<Entry />} />
            <Route path="/orders"  element={<Orders />} />
            <Route path="/admin"   element={<AdminDashboard />} />
            <Route path="/stats"   element={<UserStats />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <FloatingChat />
      </div>
    </Router>
  );
}

export default App;
