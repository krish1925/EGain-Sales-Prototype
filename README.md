# EGain-Sales-Prototype

A comprehensive web analytics dashboard designed to provide insightful data visualizations and detailed reporting on visitor engagement. This project is built with a React frontend and a FastAPI backend, offering a lightweight and high-performance solution for tracking and analyzing web traffic.

## Features

This application is divided into several pages, each providing a unique set of tools for web analytics:

### Main Dashboard
The central hub for viewing and analyzing visitor data. It contains an interactive grid where you can:
- **View Consolidated Visitor Data**: See a card for each unique visitor, summarizing their total page views, average engagement, last visit, and more.
- **Advanced Filtering**: Narrow down the data with a comprehensive set of filters, including text search, device type, conversion status, engagement score range, last visit date, and average time spent.
- **Flexible Sorting**: Sort visitors by various metrics like last visit date, engagement score, or total page views.
- **Grouped Analysis**: Group visitors by country or city to see aggregated statistics for each location and drill down into the details.

### Visitor Detail Page
For a better look at a single user's journey. When you click on a visitor from the dashboard, you are able to see:
- **Complete Visitor Profile**: Shows key information like location, device, total visits, and conversion status.
- **Visit History**: A detailed table of every page they've visited, including timestamps, time spent on each page, and engagement scores.
- **Statistical Analysis**: Provides statistics like average, median, mode, and standard deviation for time spent on each page.
- **Time on Page Graph**: Visualize how much time a visitor spent on the site during each visit.

### Regional Reports
An interactive heatmap that offers a geographical visualization of user activity.
- **Multiple Metrics**: You can switch the heatmap's data source to visualize:
    - Average Engagement Score
    - Average Time Per Session
    - Traffic for a specific page
- **Global View**: Uses Leaflet to plot data on a world map, helping you identify regional trends.

### Activity Statistics
This page provides high-level statistical charts to give you a quick overview of site-wide activity.
- **Page Views by Country**: A bar chart showing the distribution of page views across different countries.
- **Engagement Score by Device**: Compares the average engagement score for users on different devices (e.g., desktop, mobile).
- **Operating System Usage**: See which operating systems your visitors are using most frequently.

### Other Categories & Insights
A section for more specialized metrics and marketing-focused analysis.
- **Conversion Rates by Source**: Understand which UTM sources (`direct`, `google`, etc.) are driving the most conversions.
- **UTM Campaign Performance**: A bar chart that displays the average engagement score for each UTM campaign, helping you gauge marketing effectiveness.
- **Country-Specific Filtering**: The entire page's data can be filtered by a specific country.

## Tech Stack

-   **Frontend**:
    -   React (with Vite for a fast development experience)
    -   Chart.js for beautiful and responsive charts
    -   Leaflet for interactive maps
-   **Backend**:
    -   FastAPI for a robust and speedy API
    -   Uvicorn as the ASGI server

## Setup and Installation

To get this project up and running locally, you'll need to set up both the frontend and backend separately.

### Backend (FastAPI)

1.  **Navigate to the backend directory:**
    ```bash
    cd FastAPI-backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate # On Windows, use `venv\Scripts\activate`
    ```
3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run the backend server:**
    ```bash
    uvicorn api:app --reload
    ```
    The backend will be available at `http://localhost:8000`.

### Frontend (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd egain-frontend-react
    ```
2.  **Install the necessary packages:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend application will be running on `http://localhost:5173` (or another port if 5173 is in use).

## API Endpoints

The FastAPI backend exposes a few endpoints to interact with the weblog data. The primary one is:

-   `GET /weblogs/`: Fetches all weblog entries. It can also be filtered by country, e.g., `GET /weblogs/?country=USA`.
-   `POST /weblogs/`: To post a new weblog entry.

## Assumptions

This prototype operates on a few key assumptions:

-   We're assuming that all the detailed visitor information {like ISP, location, device type, etc.} is readily available and being collected.
-   Visitor identification is consistent; the same visitor will have the same `visitor_id` across different sessions. This is crucial for tracking returning users.
-   The `visitor_weblogs.json` file, which seeds the application with initial data, is located in the project's root directory.
-   The frontend is configured to communicate with the backend at `http://localhost:8000`.

