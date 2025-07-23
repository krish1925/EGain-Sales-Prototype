import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

// Removed: import PageViewsByCountryChart from '../Components/PageViewsByCountryChart';
// Removed: import EngagementScoreByDeviceChart from '../Components/EngagementScoreByDeviceChart';
// Removed: import ConversionRatesBySourceChart from '../Components/ConversionRatesBySourceChart';

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

interface AggregatedData {
    [key: string]: number;
}

interface ConsolidatedVisitorData {
    visitor_id: string;
    total_page_views: number;
    average_engagement_score: number;
    average_time_on_page: number; // Added for filtering
    last_visit_timestamp: string;
    is_converted: boolean;
    conversion_type: string | null;
    country: string;
    city: string;
    device_type: string;
    weblogs: WeblogEntry[]; 
}

interface AggregatedLocationData {
    name: string;
    total_visitors: number;
    average_engagement_score: number;
    average_time_on_page: number;
    total_page_views: number;
    visitors: ConsolidatedVisitorData[];
}

const Dashboard: React.FC = () => {
    const [weblogs, setWeblogs] = useState<WeblogEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Removed: const [pageViewsByCountry, setPageViewsByCountry] = useState<AggregatedData>({});
    // Removed: const [engagementScoreByDevice, setEngagementScoreByDevice] = useState<AggregatedData>({});
    // Removed: const [conversionRatesBySource, setConversionRatesBySource] = useState<AggregatedData>({});

    // State for Visitor Insights filters and data
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [deviceFilter, setDeviceFilter] = useState<string>('All');
    const [conversionFilter, setConversionFilter] = useState<string>('All');
    const [minEngagement, setMinEngagement] = useState<string>('');
    const [maxEngagement, setMaxEngagement] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('last_visit_desc'); 
    const [consolidatedVisitors, setConsolidatedVisitors] = useState<ConsolidatedVisitorData[]>([]);
    const [groupBy, setGroupBy] = useState<'none' | 'country' | 'city'>('none');
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<ConsolidatedVisitorData[]>([]);
    const [modalTitle, setModalTitle] = useState<string>('');

    const [startDateFilter, setStartDateFilter] = useState<string>('');
    const [endDateFilter, setEndDateFilter] = useState<string>('');
    const [minAvgTimeSpent, setMinAvgTimeSpent] = useState<string>('');
    const [maxAvgTimeSpent, setMaxAvgTimeSpent] = useState<string>('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchWeblogs = async () => {
            try {
                const response = await axios.get('http://localhost:8000/weblogs/');
                setWeblogs(response.data.weblogs);
            } catch (err) {
                setError('Failed to fetch weblogs.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeblogs();
    }, []);

    useEffect(() => {
        if (weblogs.length > 0) {
            // Removed: Aggregate data for Charts
            // Removed: const countryViews: AggregatedData = {};
            // Removed: const deviceEngagement: AggregatedData = {};
            // Removed: const sourceConversions: { [key: string]: { converted: number; total: number } } = {};

            weblogs.forEach(log => {
                // Removed: countryViews[log.country] = (countryViews[log.country] || 0) + 1;
                // Removed: deviceEngagement[log.device_type] = (deviceEngagement[log.device_type] || 0) + log.engagement_score;
                // Removed: const source = log.utm_source || 'direct';
                // Removed: if (!sourceConversions[source]) {
                // Removed:     sourceConversions[source] = { converted: 0, total: 0 };
                // Removed: }
                // Removed: sourceConversions[source].total += 1;
                // Removed: if (log.is_converted) {
                // Removed:     sourceConversions[source].converted += 1;
                // Removed: }
            });

            // Removed: setPageViewsByCountry(countryViews);
            // Removed: setEngagementScoreByDevice(deviceEngagement);

            // Removed: const conversionRates: AggregatedData = {};
            // Removed: for (const source in sourceConversions) {
            // Removed:     if (sourceConversions[source].total > 0) {
            // Removed:         conversionRates[source] = (sourceConversions[source].converted / sourceConversions[source].total) * 100;
            // Removed:     } else {
            // Removed:         conversionRates[source] = 0;
            // Removed:     }
            // Removed: }
            // Removed: setConversionRatesBySource(conversionRates);

            // Consolidate and filter data for Visitor Insights
            const groupedByVisitor = weblogs.reduce((acc, log) => {
                if (!acc[log.visitor_id]) {
                    acc[log.visitor_id] = [];
                }
                acc[log.visitor_id].push(log);
                return acc;
            }, {} as { [key: string]: WeblogEntry[] });
    
            let visitors: ConsolidatedVisitorData[] = Object.keys(groupedByVisitor).map(visitor_id => {
                const visitorLogs = groupedByVisitor[visitor_id];
                const total_page_views = visitorLogs.length;
                const total_engagement_score = visitorLogs.reduce((sum, log) => sum + log.engagement_score, 0);
                const average_engagement_score = total_engagement_score / total_page_views;
                const total_time_on_page = visitorLogs.reduce((sum, log) => sum + log.time_on_page_seconds, 0);
                const average_time_on_page = total_time_on_page / total_page_views;
                const last_visit_timestamp = visitorLogs.reduce((latest, log) => 
                    new Date(log.timestamp) > new Date(latest) ? log.timestamp : latest,
                    visitorLogs[0].timestamp
                );
                const is_converted = visitorLogs.some(log => log.is_converted);
                const conversion_type = is_converted 
                    ? visitorLogs.find(log => log.is_converted)?.conversion_type || null
                    : null;
                const latestLog = visitorLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
                return {
                    visitor_id,
                    total_page_views,
                    average_engagement_score,
                    average_time_on_page,
                    last_visit_timestamp,
                    is_converted,
                    conversion_type,
                    country: latestLog.country,
                    city: latestLog.city,
                    device_type: latestLog.device_type,
                    weblogs: visitorLogs,
                };
            });

            // Apply search term filter for Visitors
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            if (lowerCaseSearchTerm) {
                visitors = visitors.filter(visitor =>
                    visitor.visitor_id.toLowerCase().includes(lowerCaseSearchTerm) ||
                    visitor.country.toLowerCase().includes(lowerCaseSearchTerm) ||
                    visitor.city.toLowerCase().includes(lowerCaseSearchTerm) ||
                    visitor.weblogs.some(log => 
                        log.page_visited.toLowerCase().includes(lowerCaseSearchTerm) ||
                        log.page_title.toLowerCase().includes(lowerCaseSearchTerm) ||
                        log.utm_source.toLowerCase().includes(lowerCaseSearchTerm)
                    )
                );
            }
    
            // Apply device type filter for Visitors
            if (deviceFilter !== 'All') {
                visitors = visitors.filter(visitor => visitor.device_type === deviceFilter);
            }
    
            // Apply conversion status filter for Visitors
            if (conversionFilter !== 'All') {
                visitors = visitors.filter(visitor =>
                    conversionFilter === 'Converted' ? visitor.is_converted : !visitor.is_converted
                );
            }
    
            // Apply engagement score range filter for Visitors
            const minEng = parseFloat(minEngagement);
            const maxEng = parseFloat(maxEngagement);
            if (!isNaN(minEng)) {
                visitors = visitors.filter(visitor => visitor.average_engagement_score >= minEng);
            }
            if (!isNaN(maxEng)) {
                visitors = visitors.filter(visitor => visitor.average_engagement_score <= maxEng);
            }

            // Apply date range filter (based on last_visit_timestamp)
            if (startDateFilter) {
                const start = new Date(startDateFilter).getTime();
                visitors = visitors.filter(visitor => new Date(visitor.last_visit_timestamp).getTime() >= start);
            }
            if (endDateFilter) {
                const end = new Date(endDateFilter).getTime();
                visitors = visitors.filter(visitor => new Date(visitor.last_visit_timestamp).getTime() <= end);
            }

            // Apply average time spent filter
            const minAvgT = parseFloat(minAvgTimeSpent);
            const maxAvgT = parseFloat(maxAvgTimeSpent);
            if (!isNaN(minAvgT)) {
                visitors = visitors.filter(visitor => visitor.average_time_on_page >= minAvgT);
            }
            if (!isNaN(maxAvgT)) {
                visitors = visitors.filter(visitor => visitor.average_time_on_page <= maxAvgT);
            }

            // Apply sorting for Visitors
            visitors.sort((a, b) => {
                if (sortBy === 'last_visit_desc') {
                    return new Date(b.last_visit_timestamp).getTime() - new Date(a.last_visit_timestamp).getTime();
                } else if (sortBy === 'last_visit_asc') {
                    return new Date(a.last_visit_timestamp).getTime() - new Date(b.last_visit_timestamp).getTime();
                } else if (sortBy === 'engagement_desc') {
                    return b.average_engagement_score - a.average_engagement_score;
                } else if (sortBy === 'engagement_asc') {
                    return a.average_engagement_score - b.average_engagement_score;
                } else if (sortBy === 'page_views_desc') {
                    return b.total_page_views - a.total_page_views;
                } else if (sortBy === 'page_views_asc') {
                    return a.total_page_views - b.total_page_views;
                } else if (sortBy === 'avg_time_spent_desc') {
                    return b.average_time_on_page - a.average_time_on_page;
                } else if (sortBy === 'avg_time_spent_asc') {
                    return a.average_time_on_page - b.average_time_on_page;
                }
                return 0;
            });

            setConsolidatedVisitors(visitors);
        }
    }, [weblogs, searchTerm, deviceFilter, conversionFilter, minEngagement, maxEngagement, sortBy, startDateFilter, endDateFilter, minAvgTimeSpent, maxAvgTimeSpent]);

    // Extract unique device types for filter dropdown
    const uniqueDeviceTypes = Array.from(new Set(weblogs.map(log => log.device_type)));

    const handleViewDetails = (visitorId: string) => {
        navigate(`/visitor-detail/${visitorId}`);
    };

    const handleOpenModal = (groupName: string, visitorsInGroup: ConsolidatedVisitorData[]) => {
        setModalTitle(`${groupBy === 'country' ? 'Country' : 'City'}: ${groupName} Details`);
        setModalContent(visitorsInGroup);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalContent([]);
        setModalTitle('');
    };

    const renderVisitorCards = (visitorsToRender: ConsolidatedVisitorData[]) => (
        visitorsToRender.map((visitor, index) => (
            <div key={index} className="visitor-card">
                <h3>ID: {visitor.visitor_id.split('_')[1]}</h3>
                <p>Country: {visitor.country} / City: {visitor.city}</p>
                <p>Device: {visitor.device_type}</p>
                <p>Views: {visitor.total_page_views} | Eng: {visitor.average_engagement_score.toFixed(1)} | Time: {visitor.average_time_on_page.toFixed(0)}s</p>
                <p>Conv: {visitor.is_converted ? 'Yes' : 'No'} {visitor.is_converted ? `(${visitor.conversion_type || 'N/A'})` : ''}</p>
                <button 
                    className="view-details-button filter-control"
                    onClick={() => handleViewDetails(visitor.visitor_id)}
                >
                    Details
                </button>
            </div>
        ))
    );

    const renderGroupedCards = () => {
        const groupedData: { [key: string]: AggregatedLocationData } = {};

        consolidatedVisitors.forEach(visitor => {
            const groupKey = groupBy === 'country' ? visitor.country : visitor.city;
            if (!groupedData[groupKey]) {
                groupedData[groupKey] = {
                    name: groupKey,
                    total_visitors: 0,
                    average_engagement_score: 0,
                    average_time_on_page: 0,
                    total_page_views: 0,
                    visitors: []
                };
            }
            groupedData[groupKey].total_visitors += 1;
            groupedData[groupKey].average_engagement_score += visitor.average_engagement_score;
            groupedData[groupKey].average_time_on_page += visitor.average_time_on_page;
            groupedData[groupKey].total_page_views += visitor.total_page_views;
            groupedData[groupKey].visitors.push(visitor);
        });

        return Object.keys(groupedData).map(groupName => {
            const group = groupedData[groupName];
            const avgEngagement = group.total_visitors > 0 ? (group.average_engagement_score / group.total_visitors) : 0;
            const avgTimeOnPage = group.total_visitors > 0 ? (group.average_time_on_page / group.total_visitors) : 0;
            const avgPageViews = group.total_visitors > 0 ? (group.total_page_views / group.total_visitors) : 0;

            return (
                <div key={groupName} className="group-card">
                    <div className="group-header" onClick={() => handleOpenModal(groupName, group.visitors)}>
                        <h2>{groupBy === 'country' ? 'Country' : 'City'}: {group.name}</h2>
                        <p>Total Visitors: {group.total_visitors}</p>
                        <p>Avg. Engagement: {avgEngagement.toFixed(1)} | Avg. Time: {avgTimeOnPage.toFixed(0)}s | Avg. Views: {avgPageViews.toFixed(1)}</p>
                        <button className="expand-button">+</button>
                    </div>
                </div>
            );
        });
    };

    if (loading) {
        return <div className="dashboard-container">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-container error-message">Error: {error}</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Egain Weblog Analytics Dashboard</h1>
            </header>
            {/* Removed charts section */}

            <section className="visitor-insights-section">
                <h2>Visitor Insights</h2>
                <div className="filters-container">
                    <input
                        type="text"
                        placeholder="Search by Visitor ID, Country, Page Visited, etc."
                        className="search-input filter-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="filter-control select-filter"
                        value={deviceFilter}
                        onChange={(e) => setDeviceFilter(e.target.value)}
                    >
                        <option value="All">All Devices</option>
                        {uniqueDeviceTypes.map(device => (
                            <option key={device} value={device}>{device}</option>
                        ))}
                    </select>
                    <select
                        className="filter-control select-filter"
                        value={conversionFilter}
                        onChange={(e) => setConversionFilter(e.target.value)}
                    >
                        <option value="All">All Conversions</option>
                        <option value="Converted">Converted</option>
                        <option value="Not Converted">Not Converted</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Min Avg. Engagement Score"
                        className="filter-control number-input"
                        value={minEngagement}
                        onChange={(e) => setMinEngagement(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Max Avg. Engagement Score"
                        className="filter-control number-input"
                        value={maxEngagement}
                        onChange={(e) => setMaxEngagement(e.target.value)}
                    />
                    <label className="filter-label">Last Visit From:</label>
                    <input 
                        type="date" 
                        className="filter-control date-filter"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                    />
                    <label className="filter-label">Last Visit To:</label>
                    <input 
                        type="date" 
                        className="filter-control date-filter"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                    />
                    <input 
                        type="number" 
                        placeholder="Min Avg. Time (s)"
                        className="filter-control number-input"
                        value={minAvgTimeSpent}
                        onChange={(e) => setMinAvgTimeSpent(e.target.value)}
                    />
                    <input 
                        type="number" 
                        placeholder="Max Avg. Time (s)"
                        className="filter-control number-input"
                        value={maxAvgTimeSpent}
                        onChange={(e) => setMaxAvgTimeSpent(e.target.value)}
                    />
                    <select
                        className="filter-control select-filter"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="last_visit_desc">Last Visit (Newest First)</option>
                        <option value="last_visit_asc">Last Visit (Oldest First)</option>
                        <option value="engagement_desc">Avg. Engagement (High to Low)</option>
                        <option value="engagement_asc">Avg. Engagement (Low to High)</option>
                        <option value="page_views_desc">Total Page Views (High to Low)</option>
                        <option value="page_views_asc">Total Page Views (Low to High)</option>
                        <option value="avg_time_spent_desc">Avg. Time Spent (High to Low)</option>
                        <option value="avg_time_spent_asc">Avg. Time Spent (Low to High)</option>
                    </select>
                    <select
                        className="filter-control select-filter"
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as 'none' | 'country' | 'city')}
                    >
                        <option value="none">No Grouping</option>
                        <option value="country">Group by Country</option>
                        <option value="city">Group by City</option>
                    </select>
                </div>
                <div className="visitor-insights-grid">
                    {groupBy === 'none' ? renderVisitorCards(consolidatedVisitors) : renderGroupedCards()}
                </div>
            </section>
            
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modalTitle}</h2>
                        <div className="modal-visitor-grid">
                            {renderVisitorCards(modalContent)}
                        </div>
                        <button onClick={handleCloseModal} className="modal-close-button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard; 

