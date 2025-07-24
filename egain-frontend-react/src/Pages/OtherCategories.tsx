import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import ConversionRatesBySourceChart from '../Components/ConversionRatesBySourceChart';

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

const OtherCategories: React.FC = () => {
    const [weblogs, setWeblogs] = useState<WeblogEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [conversionRatesBySource, setConversionRatesBySource] = useState<AggregatedData>({});
    const [campaignEngagement, setCampaignEngagement] = useState<AggregatedData>({});
    const [selectedCountry, setSelectedCountry] = useState<string>(''); // Default to empty string for "All Countries"
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    useEffect(() => {
        const fetchWeblogs = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                // Pass selectedCountry to the backend API
                const url = selectedCountry 
                    ? `${baseUrl}/weblogs/?country=${selectedCountry}` 
                    : `${baseUrl}/weblogs/`;
                const response = await axios.get(url);
                setWeblogs(response.data.weblogs);
                const allCountries = Array.from(new Set(response.data.weblogs.map((log: WeblogEntry) => log.country))) as string[];
                setAvailableCountries(allCountries.sort());
                
            } catch (err) {
                setError('Failed to fetch weblogs.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeblogs();
    }, [selectedCountry]); // Add selectedCountry as a dependency

    useEffect(() => {
        if (weblogs.length > 0) {
            
            const filteredWeblogs = weblogs; // weblogs is already filtered by API based on selectedCountry

            const sourceConversions: { [key: string]: { converted: number; total: number } } = {};
            filteredWeblogs.forEach(log => {
                const source = log.utm_source || 'direct';
                if (!sourceConversions[source]) {
                    sourceConversions[source] = { converted: 0, total: 0 };
                }
                sourceConversions[source].total += 1;
                if (log.is_converted) {
                    sourceConversions[source].converted += 1;
                }
            });

            const conversionRates: AggregatedData = {};
            for (const source in sourceConversions) {
                if (sourceConversions[source].total > 0) {
                    conversionRates[source] = (sourceConversions[source].converted / sourceConversions[source].total) * 100;
                } else {
                    conversionRates[source] = 0;
                }
            }
            setConversionRatesBySource(conversionRates);

            // Data for UTM Campaign Engagement Insight
            const campaignEng: { [key: string]: { totalEngagement: number; count: number } } = {};
            filteredWeblogs.forEach(log => {
                const campaign = log.utm_campaign || 'No Campaign';
                if (!campaignEng[campaign]) {
                    campaignEng[campaign] = { totalEngagement: 0, count: 0 };
                }
                campaignEng[campaign].totalEngagement += log.engagement_score;
                campaignEng[campaign].count += 1;
            });

            const avgCampaignEngagement: AggregatedData = {};
            for (const campaign in campaignEng) {
                if (campaignEng[campaign].count > 0) {
                    avgCampaignEngagement[campaign] = campaignEng[campaign].totalEngagement / campaignEng[campaign].count;
                } else {
                    avgCampaignEngagement[campaign] = 0;
                }
            }
            setCampaignEngagement(avgCampaignEngagement);
        }
    }, [weblogs, selectedCountry]);

    if (loading) {
        return <div className="dashboard-container">Loading insights...</div>;
    }

    if (error) {
        return <div className="dashboard-container error-message">Error: {error}</div>;
    }

    const campaignEngagementChartData = {
        labels: Object.keys(campaignEngagement),
        datasets: [
            {
                label: 'Average Engagement Score',
                data: Object.values(campaignEngagement),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const campaignEngagementChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Average Engagement Score by UTM Campaign',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Average Engagement Score'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'UTM Campaign'
                }
            }
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">Other Categories Insights</h1>
            <div className="country-selector">
                <label htmlFor="country-select">Select Country:</label>
                <select
                    id="country-select"
                    value={selectedCountry}
                    onChange={e => setSelectedCountry(e.target.value)}
                >
                    <option value="">All Countries</option>
                    {availableCountries.map(country => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
            </div>
            <section className="charts-grid">
                <ConversionRatesBySourceChart data={conversionRatesBySource} />
                <div className="chart-card">
                    <h2>Average Engagement Score by UTM Campaign</h2>
                    <Bar data={campaignEngagementChartData} options={campaignEngagementChartOptions} />
                </div>
            </section>
        </div>
    );
};

export default OtherCategories; 