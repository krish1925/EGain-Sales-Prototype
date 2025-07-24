import React from 'react';
import { Link } from 'react-router-dom';
import '../CSS/LandingPage.css';

interface CardData {
  title: string;
  description: string;
  route: string;
}

const cardData: CardData[] = [
  {
    title: "Main Dashboard",
    description: "A central hub to view, filter, and sort visitor data. Group by location and analyze engagement at a glance.",
    route: "/dashboard"
  },
  {
    title: "Regional Reports", 
    description: "Visualize user activity on an interactive heatmap. Analyze engagement, session time, and traffic by country.",
    route: "/regional-reports"
  },
  {
    title: "Activity Statistics",
    description: "Get a high-level overview of site-wide activity with charts for page views, device engagement, and OS usage.",
    route: "/activity-statistics"
  },
  {
    title: "Marketing Insights",
    description: "Analyze conversion rates by source and measure the performance of your UTM campaigns to optimize marketing efforts.",
    route: "/other-categories"
  }
];

const Card: React.FC<CardData> = ({ title, description, route }) => (
  <article className="card">
    <h2 className="card-title">{title}</h2>
    <p className="card-description">{description}</p>
    <Link to={route} className="card-link">
      Open {title}
    </Link>
  </article>
);

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1 className="landing-title">eGain Sales Analytics</h1>
        <p className="landing-subtitle">Unlock Insights from Your Visitor Data</p>
      </header>
      
      <main className="cards-grid">
        {cardData.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </main>
    </div>
  );
};

export default LandingPage;