import React from 'react';
import '../CSS/Navbar.css'; 
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                EGain Weblog Analytics
            </div>
            <ul className="navbar-nav">
                <li className="nav-item">
                    <Link to="/" className="nav-link">Dashboard</Link>
                </li>
                <li className="nav-item">
                    <Link to="/regional-reports" className="nav-link">Regional Heatmaps</Link>
                </li>
                <li className="nav-item">
                    <Link to="/activity-statistics" className="nav-link">Activity Statistics</Link>
                </li>
                <li className="nav-item">
                    <Link to="/other-categories" className="nav-link">Other Categories</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar; 