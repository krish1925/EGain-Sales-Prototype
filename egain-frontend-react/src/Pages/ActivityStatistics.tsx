import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import PageViewsByCountryChart from '../Components/PageViewsByCountryChart';
import EngagementScoreByDeviceChart from '../Components/EngagementScoreByDeviceChart';

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

const ActivityStatistics: React.FC = () => {
    const [weblogs, setWeblogs] = useState<WeblogEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pageViewsByCountry, setPageViewsByCountry] = useState<AggregatedData>({});
    const [engagementScoreByDevice, setEngagementScoreByDevice] = useState<AggregatedData>({});
    const [osUsage, setOsUsage] = useState<AggregatedData>({});

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
            // Data for Page Views by Country Chart
            const countryViews: AggregatedData = {};
            weblogs.forEach(log => {
                countryViews[log.country] = (countryViews[log.country] || 0) + 1;
            });
            setPageViewsByCountry(countryViews);

            // Data for Engagement Score by Device Chart
            const deviceEngagement: { [key: string]: { totalEngagement: number; count: number } } = {};
            weblogs.forEach(log => {
                if (!deviceEngagement[log.device_type]) {
                    deviceEngagement[log.device_type] = { totalEngagement: 0, count: 0 };
                }
                deviceEngagement[log.device_type].totalEngagement += log.engagement_score;
                deviceEngagement[log.device_type].count += 1;
            });

            const avgEngagementByDevice: AggregatedData = {};
            for (const device in deviceEngagement) {
                if (deviceEngagement[device].count > 0) {
                    avgEngagementByDevice[device] = deviceEngagement[device].totalEngagement / deviceEngagement[device].count;
                } else {
                    avgEngagementByDevice[device] = 0;
                }
            }
            setEngagementScoreByDevice(avgEngagementByDevice);

            // Data for Operating System Usage Insight
            const osCounts: AggregatedData = {};
            weblogs.forEach(log => {
                osCounts[log.operating_system] = (osCounts[log.operating_system] || 0) + 1;
            });
            setOsUsage(osCounts);
        }
    }, [weblogs]);

    if (loading) {
        return <div className="dashboard-container">Loading insights...</div>;
    }

    if (error) {
        return <div className="dashboard-container error-message">Error: {error}</div>;
    }

    const osUsageChartData = {
        labels: Object.keys(osUsage),
        datasets: [
            {
                label: 'Number of Visits',
                data: Object.values(osUsage),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const osUsageChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Operating System Usage',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Visits'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Operating System'
                }
            }
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">Activity Statistics Insights</h1>
            <section className="charts-grid">
                <PageViewsByCountryChart data={pageViewsByCountry} />
                <EngagementScoreByDeviceChart data={engagementScoreByDevice} />
                <div className="chart-card">
                    <h2>Operating System Usage</h2>
                    <Bar data={osUsageChartData} options={osUsageChartOptions} />
                </div>
            </section>
        </div>
    );
};

export default ActivityStatistics; 