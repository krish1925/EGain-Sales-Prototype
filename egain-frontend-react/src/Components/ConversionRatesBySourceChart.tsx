
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AggregatedData {
    [key: string]: number;
}

interface ConversionRatesBySourceChartProps {
    data: AggregatedData;
}

const ConversionRatesBySourceChart: React.FC<ConversionRatesBySourceChartProps> = ({ data }) => {
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: 'Conversion Rate (%)',
                data: Object.values(data),
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="chart-card">
            <h2>Conversion Rates by UTM Source</h2>
            <Bar data={chartData} />
        </div>
    );
};

export default ConversionRatesBySourceChart; 