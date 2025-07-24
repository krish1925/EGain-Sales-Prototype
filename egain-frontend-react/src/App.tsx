import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import LandingPage from './Pages/LandingPage';
import RegionalReports from './Pages/RegionalReports';
import ActivityStatistics from './Pages/ActivityStatistics';
import OtherCategories from './Pages/OtherCategories';
import VisitorDetail from './Pages/VisitorDetail';
import Navbar from './Components/Navbar';
import './CSS/App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <>
                            <Navbar />
                            <Dashboard />
                        </>
                    }
                />
                <Route
                    path="/regional-reports"
                    element={
                        <>
                            <Navbar />
                            <RegionalReports />
                        </>
                    }
                />
                <Route
                    path="/activity-statistics"
                    element={
                        <>
                            <Navbar />
                            <ActivityStatistics />
                        </>
                    }
                />
                <Route
                    path="/other-categories"
                    element={
                        <>
                            <Navbar />
                            <OtherCategories />
                        </>
                    }
                />
                <Route
                    path="/visitor-detail/:visitorId"
                    element={
                        <>
                            <Navbar />
                            <VisitorDetail />
                        </>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
