import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface WeblogEntry {
    timestamp: string;
    visitor_id: string;
    session_id: string;
    page_visited: string;
    page_title: string;
    ip_address: string;
    user_agent: string;
    referrer: string;
    language: string;
    screen_resolution: string;
    viewport_size: string;
    device_type: string;
    operating_system: string;
    browser: string;
    country: string;
    region: string;
    city: string;
    isp: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    page_load_time_ms: number;
    time_on_page_seconds: number;
    scroll_depth_percent: number;
    clicks_count: number;
    is_bounce: boolean;
    is_converted: boolean;
    conversion_type: string;
    engagement_score: number;
}

interface PageVisit {
    page: string;
    visitTime: number;
}

const VisitorDetail: React.FC = () => {
    const { visitorId } = useParams<{ visitorId: string }>();
    const [allVisitorWeblogs, setAllVisitorWeblogs] = useState<WeblogEntry[]>([]); // Store all fetched weblogs for the visitor
    const [filteredVisitorWeblogs, setFilteredVisitorWeblogs] = useState<WeblogEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showGraph, setShowGraph] = useState<boolean>(false);

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [minTimeSpent, setMinTimeSpent] = useState<string>('');
    const [maxTimeSpent, setMaxTimeSpent] = useState<string>('');

    useEffect(() => {
        const fetchVisitorWeblogs = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const response = await axios.get(`${baseUrl}/weblogs/`);
                const allWeblogs: WeblogEntry[] = response.data.weblogs;
                const filteredLogs = allWeblogs.filter(log => log.visitor_id === visitorId);
                setAllVisitorWeblogs(filteredLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
            } catch (err) {
                setError('Failed to fetch visitor weblogs.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (visitorId) {
            fetchVisitorWeblogs();
        }
    }, [visitorId]);

    useEffect(() => {
        let currentLogs = [...allVisitorWeblogs];

        // Apply date range filter
        if (startDate) {
            const start = new Date(startDate).getTime();
            currentLogs = currentLogs.filter(log => new Date(log.timestamp).getTime() >= start);
        }
        if (endDate) {
            const end = new Date(endDate).getTime();
            currentLogs = currentLogs.filter(log => new Date(log.timestamp).getTime() <= end);
        }

        // Apply time spent filter
        const minT = parseFloat(minTimeSpent);
        const maxT = parseFloat(maxTimeSpent);
        if (!isNaN(minT)) {
            currentLogs = currentLogs.filter(log => log.time_on_page_seconds >= minT);
        }
        if (!isNaN(maxT)) {
            currentLogs = currentLogs.filter(log => log.time_on_page_seconds <= maxT);
        }

        setFilteredVisitorWeblogs(currentLogs);
    }, [allVisitorWeblogs, startDate, endDate, minTimeSpent, maxTimeSpent]);

    const calculatePageVisitStats = () => {
        const pageVisits: { [key: string]: number[] } = {};
        filteredVisitorWeblogs.forEach(log => {
            const page = log.page_title || log.page_visited;
            if (!pageVisits[page]) {
                pageVisits[page] = [];
            }
            pageVisits[page].push(log.time_on_page_seconds);
        });

        const stats: { page: string; avgTime: string; medianTime: string; modeTime: string; stdDevTime: string }[] = [];
        for (const page in pageVisits) {
            const times = pageVisits[page].sort((a, b) => a - b);
            const sum = times.reduce((a, b) => a + b, 0);
            const avgTime = (sum / times.length).toFixed(2);

            const mid = Math.floor(times.length / 2);
            const medianTime = times.length % 2 === 0 
                ? ((times[mid - 1] + times[mid]) / 2).toFixed(2) 
                : times[mid].toFixed(2);

            const modeMap: { [key: number]: number } = {};
            let maxCount = 0;
            let modeValue: number[] = [];
            times.forEach(time => {
                modeMap[time] = (modeMap[time] || 0) + 1;
                if (modeMap[time] > maxCount) {
                    maxCount = modeMap[time];
                    modeValue = [time];
                } else if (modeMap[time] === maxCount) {
                    modeValue.push(time);
                }
            });
            const modeTime = modeValue.join(', ');

            const variance = times.reduce((sum, time) => sum + Math.pow(time - parseFloat(avgTime), 2), 0) / times.length;
            const stdDevTime = Math.sqrt(variance).toFixed(2);

            stats.push({ page, avgTime, medianTime, modeTime, stdDevTime });
        }
        return stats;
    };

    const pageVisitStats = calculatePageVisitStats();

    const timeOnPageData = {
        labels: filteredVisitorWeblogs.map(log => new Date(log.timestamp).toLocaleString()),
        datasets: [
            {
                label: 'Time on Page (seconds)',
                data: filteredVisitorWeblogs.map(log => log.time_on_page_seconds),
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
            },
        ],
    };

    if (loading) {
        return <div className="dashboard-container">Loading visitor details...</div>;
    }

    if (error) {
        return <div className="dashboard-container error-message">Error: {error}</div>;
    }

    if (!visitorId || filteredVisitorWeblogs.length === 0) {
        return <div className="dashboard-container">No visitor data found for this ID matching the current filters.</div>;
    }

    const latestVisitorData = filteredVisitorWeblogs[filteredVisitorWeblogs.length - 1]; 
    const firstVisitorData = filteredVisitorWeblogs[0];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Details for Visitor ID: {visitorId}</h1>
                <div className="filters-container">
                    <label>Start Date:</label>
                    <input 
                        type="date" 
                        className="filter-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <label>End Date:</label>
                    <input 
                        type="date" 
                        className="filter-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <input 
                        type="number" 
                        placeholder="Min Time Spent (s)"
                        className="filter-control number-input"
                        value={minTimeSpent}
                        onChange={(e) => setMinTimeSpent(e.target.value)}
                    />
                    <input 
                        type="number" 
                        placeholder="Max Time Spent (s)"
                        className="filter-control number-input"
                        value={maxTimeSpent}
                        onChange={(e) => setMaxTimeSpent(e.target.value)}
                    />
                </div>
                <p><strong>Country:</strong> {latestVisitorData.country}</p>
                <p><strong>Device Type:</strong> {latestVisitorData.device_type}</p>
                <p><strong>Total Visits:</strong> {filteredVisitorWeblogs.length}</p>
                <p><strong>First Visit:</strong> {new Date(firstVisitorData.timestamp).toLocaleString()}</p>
                <p><strong>Last Visit:</strong> {new Date(latestVisitorData.timestamp).toLocaleString()}</p>
                <p><strong>Converted:</strong> {latestVisitorData.is_converted ? `Yes (${latestVisitorData.conversion_type || 'N/A'})` : 'No'}</p>
                <button 
                    className="filter-control view-details-button"
                    onClick={() => setShowGraph(!showGraph)}
                >
                    {showGraph ? 'Hide Time on Page Graph' : 'Generate Time on Page Graph'}
                </button>
            </header>

            {showGraph && (
                <div className="chart-card" style={{ width: '100%', maxWidth: '1000px', marginTop: '20px' }}>
                    <h2>Time on Page Over Filtered Visits</h2>
                    <Line data={timeOnPageData} />
                </div>
            )}

            <section className="visitor-detail-section">
                <h2>Page Visit Statistics (Filtered)</h2>
                {pageVisitStats.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Page</th>
                                    <th>Avg. Time (s)</th>
                                    <th>Median Time (s)</th>
                                    <th>Mode Time (s)</th>
                                    <th>Std Dev (s)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageVisitStats.map((stat, idx) => (
                                    <tr key={idx}>
                                        <td>{stat.page}</td>
                                        <td>{stat.avgTime}</td>
                                        <td>{stat.medianTime}</td>
                                        <td>{stat.modeTime}</td>
                                        <td>{stat.stdDevTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No page visit statistics available for the current filters.</p>
                )}
            </section>

            <section className="visitor-detail-section">
                <h2>Full Visit History (Filtered)</h2>
                {filteredVisitorWeblogs.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Page Visited</th>
                                    <th>Time on Page (s)</th>
                                    <th>Engagement Score</th>
                                    <th>Conversion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVisitorWeblogs.map((log, index) => (
                                    <tr key={index}>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td>{log.page_title || log.page_visited}</td>
                                        <td>{log.time_on_page_seconds}</td>
                                        <td>{log.engagement_score}</td>
                                        <td>{log.is_converted ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No detailed visit history available for the current filters.</p>
                )}
            </section>
        </div>
    );
};

export default VisitorDetail; 