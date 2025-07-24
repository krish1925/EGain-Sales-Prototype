import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // Import Leaflet.heat

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

interface RegionalSummary {
    country: string;
    totalVisitors: number;
    totalPageViews: number;
    avgEngagement: string;
    avgTimeOnPage: string;
    conversionRate: string;
    mostCommonDevice: string;
    mostCommonOS: string;
    bounceRate: string;
    topReferrer: string;
}

const getCoordinates = (city: string, country: string): [number, number, number] => {
    const coordinates: { [key: string]: [number, number, number] } = {
        'San Francisco, United States': [37.7749, -122.4194, 1],
        'London, United Kingdom': [51.5074, 0.1278, 1],
        'New York, United States': [40.7128, -74.0060, 1],
        'Munich, Germany': [48.1351, 11.5820, 1],
        'Toronto, Canada': [43.6532, -79.3832, 1],
        'Paris, France': [48.8566, 2.3522, 1],
        'Madrid, Spain': [40.4168, -3.7038, 1],
        'Austin, United States': [30.2672, -97.7431, 1],
        'Vancouver, Canada': [49.2827, -123.1207, 1],
        'Sydney, Australia': [33.8688, 151.2093, 1],
        'Seattle, United States': [47.6062, -122.3321, 1]
    };
    return coordinates[`${city}, ${country}`] || [0, 0, 0];
};

interface CustomHeatmapLayerProps {
    points: [number, number, number][];
}

const CustomHeatmapLayer: React.FC<CustomHeatmapLayerProps> = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !points || points.length === 0) return;

        // @ts-ignore: Leaflet.heat adds .heat to L
        const heatLayer = (window as any).L.heatLayer(points, {
            radius: 15,
            blur: 15,
            maxZoom: 17,
            minOpacity: 0.3,
            gradient: {
                0.2: 'blue',
                0.5: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points]);

    return null;
};

const RegionalReports: React.FC = () => {
    const [points, setPoints] = useState<[number, number, number][]>([]);
    const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'time' | 'traffic'>('engagement');
    const [selectedPage, setSelectedPage] = useState<string>('');
    const [availablePages, setAvailablePages] = useState<string[]>([]);
    const [summaries, setSummaries] = useState<RegionalSummary[]>([]);

    useEffect(() => {
        const fetchWeblogs = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const response = await fetch(`${baseUrl}/weblogs/`);
                const data = await response.json();
                const weblogs: WeblogEntry[] = data.weblogs;

                const uniquePages = Array.from(new Set(weblogs.map(log => log.page_visited))).sort();
                setAvailablePages(uniquePages);

                // Calculate regional summaries
                const regionalData: { [country: string]: WeblogEntry[] } = {};
                weblogs.forEach(log => {
                    if (!regionalData[log.country]) {
                        regionalData[log.country] = [];
                    }
                    regionalData[log.country].push(log);
                });

                const calculatedSummaries: RegionalSummary[] = Object.keys(regionalData).map(country => {
                    const logs = regionalData[country];
                    const totalVisitors = new Set(logs.map(log => log.visitor_id)).size;
                    const totalPageViews = logs.length;
                    const totalEngagement = logs.reduce((acc, log) => acc + log.engagement_score, 0);
                    const avgEngagement = (totalEngagement / totalPageViews).toFixed(2);
                    const totalTimeOnPage = logs.reduce((acc, log) => acc + log.time_on_page_seconds, 0);
                    const avgTimeOnPage = (totalTimeOnPage / totalPageViews).toFixed(2);
                    const totalConversions = logs.filter(log => log.is_converted).length;
                    const conversionRate = ((totalConversions / totalPageViews) * 100).toFixed(2);
                    const deviceTypes = logs.map(log => log.device_type);
                    const mostCommonDevice = deviceTypes.sort((a,b) => deviceTypes.filter(v => v===a).length - deviceTypes.filter(v => v===b).length).pop() || 'N/A';
                    const osTypes = logs.map(log => log.operating_system);
                    const mostCommonOS = osTypes.sort((a,b) => osTypes.filter(v => v===a).length - osTypes.filter(v => v===b).length).pop() || 'N/A';
                    const bounces = logs.filter(log => log.is_bounce).length;
                    const bounceRate = ((bounces / totalPageViews) * 100).toFixed(2);
                    const referrers = logs.map(log => log.referrer).filter(r => r && r !== 'direct');
                    const topReferrer = referrers.sort((a,b) => referrers.filter(v => v===a).length - referrers.filter(v => v===b).length).pop() || 'Direct';

                    return {
                        country,
                        totalVisitors,
                        totalPageViews,
                        avgEngagement,
                        avgTimeOnPage,
                        conversionRate: `${conversionRate}%`,
                        mostCommonDevice,
                        mostCommonOS,
                        bounceRate: `${bounceRate}%`,
                        topReferrer,
                    };
                });
                setSummaries(calculatedSummaries);


                if (selectedMetric === 'traffic' && !selectedPage && uniquePages.length > 0) {
                    setSelectedPage(uniquePages[0]);
                    return; // Re-run effect after setting default page
                }

                const aggregatedData: { [key: string]: { lat: number, lon: number, total: number, count: number, sessions: { [key: string]: number[] }, pageTraffic: { [key: string]: number } } } = {};

                weblogs.forEach(log => {
                    const locationKey = `${log.city}, ${log.country}`;
                    if (!aggregatedData[locationKey]) {
                        const [lat, lon, _] = getCoordinates(log.city, log.country);
                        if (lat === 0 && lon === 0) return; // Skip unknown locations
                        aggregatedData[locationKey] = { lat, lon, total: 0, count: 0, sessions: {}, pageTraffic: {} };
                    }

                    if (selectedMetric === 'engagement') {
                        aggregatedData[locationKey].total += log.engagement_score;
                        aggregatedData[locationKey].count += 1;
                    } else if (selectedMetric === 'time') {
                        if (!aggregatedData[locationKey].sessions[log.session_id]) {
                            aggregatedData[locationKey].sessions[log.session_id] = [];
                        }
                        aggregatedData[locationKey].sessions[log.session_id].push(log.time_on_page_seconds);
                    } else if (selectedMetric === 'traffic') {
                        if (selectedPage && log.page_visited === selectedPage) {
                            aggregatedData[locationKey].pageTraffic[log.page_visited] = (aggregatedData[locationKey].pageTraffic[log.page_visited] || 0) + 1;
                        }
                    }
                });

                const heatmapPoints: [number, number, number][] = [];
                Object.keys(aggregatedData).forEach(locationKey => {
                    const data = aggregatedData[locationKey];
                    let intensity = 0;

                    if (selectedMetric === 'engagement') {
                        intensity = data.count > 0 ? data.total / data.count : 0;
                        intensity = intensity / 10; // Normalize to 0-1 for heatmap gradient
                    } else if (selectedMetric === 'time') {
                        let totalSessionTime = 0;
                        let sessionCount = 0;
                        Object.values(data.sessions).forEach(times => {
                            if (times.length > 0) {
                                totalSessionTime += times.reduce((a, b) => a + b, 0) / times.length; // Avg time per session
                                sessionCount += 1;
                            }
                        });
                        intensity = sessionCount > 0 ? totalSessionTime / sessionCount : 0;
                        intensity = intensity / 350; // Normalize based on max time_on_page_seconds from analysis
                    } else if (selectedMetric === 'traffic') {
                        intensity = data.pageTraffic[selectedPage] || 0;
                        intensity = intensity / 10; // Assuming max 10 visits per page in a location for normalization
                    }

                    if (intensity > 0) {
                        heatmapPoints.push([data.lat, data.lon, intensity]);
                    }
                });

                setPoints(heatmapPoints);
            } catch (error) {
                console.error("Error fetching weblogs:", error);
            }
        };

        fetchWeblogs();
    }, [selectedMetric, selectedPage]); // Re-run effect when metric or page changes

    const defaultCenter: [number, number] = [20, 0]; 
    const defaultZoom = 2; 

    const bounds = points.length > 0 
        ? points.reduce((acc, point) => {
            return [
                [Math.min(acc[0][0], point[0]), Math.min(acc[0][1], point[1])],
                [Math.max(acc[1][0], point[0]), Math.max(acc[1][1], point[1])]
            ];
        }, [[90, 180], [-90, -180]]) 
        : null;

    const center: [number, number] = bounds 
        ? [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2] 
        : defaultCenter;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">Regional Reports - Heatmap</h1>
            <div className="controls-container" style={{ marginBottom: '20px' }}>
                <label htmlFor="metric-select" style={{ marginRight: '10px' }}>Select Metric:</label>
                <select
                    id="metric-select"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as 'engagement' | 'time' | 'traffic')}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="engagement">Engagement Score</option>
                    <option value="time">Average Time Per Session</option>
                    <option value="traffic">Traffic by Page</option>
                </select>

                {selectedMetric === 'traffic' && (
                    <>
                        <label htmlFor="page-select" style={{ marginRight: '10px', marginLeft: '20px' }}>Select Page:</label>
                        <select
                            id="page-select"
                            value={selectedPage}
                            onChange={(e) => setSelectedPage(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px' }}
                        >
                            {availablePages.map(page => (
                                <option key={page} value={page}>{page}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>
            <div className="heatmap-container-wrapper">
                <MapContainer 
                    center={center} 
                    zoom={defaultZoom} 
                    className="heatmap-map-container" 
                    scrollWheelZoom={true}
                    {...({} as any)} // Type assertion to bypass the error
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        {...({} as any)} // Type assertion to bypass the error
                    />
                    {points.length > 0 && (
                        <CustomHeatmapLayer points={points} />
                    )}
                </MapContainer>
            </div>
            <div className="regional-summary-container" style={{ marginTop: '20px' }}>
                <h2>Regional Summaries</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Country</th>
                                <th>Total Visitors</th>
                                <th>Total Page Views</th>
                                <th>Avg. Engagement</th>
                                <th>Avg. Time on Page (s)</th>
                                <th>Conversion Rate</th>
                                <th>Bounce Rate</th>
                                <th>Top Device</th>
                                <th>Top OS</th>
                                <th>Top Referrer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summaries.map(summary => (
                                <tr key={summary.country}>
                                    <td>{summary.country}</td>
                                    <td>{summary.totalVisitors}</td>
                                    <td>{summary.totalPageViews}</td>
                                    <td>{summary.avgEngagement}</td>
                                    <td>{summary.avgTimeOnPage}</td>
                                    <td>{summary.conversionRate}</td>
                                    <td>{summary.bounceRate}</td>
                                    <td>{summary.mostCommonDevice}</td>
                                    <td>{summary.mostCommonOS}</td>
                                    <td>{summary.topReferrer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RegionalReports; 