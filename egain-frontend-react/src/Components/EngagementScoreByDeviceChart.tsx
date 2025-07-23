
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AggregatedData {
    [key: string]: number;
}

interface EngagementScoreByDeviceChartProps {
    data: AggregatedData;
}

const EngagementScoreByDeviceChart: React.FC<EngagementScoreByDeviceChartProps> = ({ data }) => {
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: 'Total Engagement Score',
                data: Object.values(data),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="chart-card">
            <h2>Engagement Score by Device Type</h2>
            <Line data={chartData} />
        </div>
    );
};

export default EngagementScoreByDeviceChart; 