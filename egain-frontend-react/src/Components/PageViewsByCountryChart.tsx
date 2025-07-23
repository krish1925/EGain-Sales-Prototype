
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AggregatedData {
    [key: string]: number;
}

interface PageViewsByCountryChartProps {
    data: AggregatedData;
}

const PageViewsByCountryChart: React.FC<PageViewsByCountryChartProps> = ({ data }) => {
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: 'Page Views',
                data: Object.values(data),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="chart-card">
            <h2>Page Views by Country</h2>
            <Bar data={chartData} />
        </div>
    );
};

export default PageViewsByCountryChart; 