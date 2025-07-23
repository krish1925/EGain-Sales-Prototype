import React from 'react';
import './App.css'
import Dashboard from './Pages/Dashboard'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegionalReports from './Pages/RegionalReports';
import ActivityStatistics from './Pages/ActivityStatistics';
import OtherCategories from './Pages/OtherCategories';
import Navbar from './Components/Navbar';
import VisitorDetail from './Pages/VisitorDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/regional-reports" element={<RegionalReports />} />
          <Route path="/activity-statistics" element={<ActivityStatistics />} />
          <Route path="/other-categories" element={<OtherCategories />} />
          <Route path="/visitor-detail/:visitorId" element={<VisitorDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
