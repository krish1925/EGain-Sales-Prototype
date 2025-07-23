# main.py
print(">>> RUNNING FROM:", __file__)

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from starlette.middleware.cors import CORSMiddleware

import datetime
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
    
)

class WeblogEntry(BaseModel):
    timestamp: datetime.datetime
    visitor_id: str
    session_id: str
    page_visited: str
    page_title: str
    ip_address: str
    user_agent: str
    referrer: str
    language: str
    screen_resolution: str
    viewport_size: str
    device_type: str
    operating_system: str
    browser: str
    country: str
    region: str
    city: str
    isp: str
    utm_source: str
    utm_medium: str
    utm_campaign: str
    page_load_time_ms: int
    time_on_page_seconds: int
    scroll_depth_percent: int
    clicks_count: int
    is_bounce: bool
    is_converted: bool
    conversion_type: str
    engagement_score: float


# In-memory storage for weblogs 
# Load initial data from visitor_weblogs.json
with open('../visitor_weblogs.json', 'r') as f:
    initial_data = json.load(f)
    weblogs_db = [WeblogEntry(**entry) for entry in initial_data['weblogs']]

@app.post("/weblogs/")
async def create_weblog_entry(weblog: WeblogEntry):
    weblogs_db.append(weblog)
    return {"message": "Weblog entry received", "weblog": weblog}

@app.get("/weblogs/")
async def get_all_weblogs(country: Optional[str] = None):
    if country:
        filtered_weblogs = [log for log in weblogs_db if log.country == country]
        return {"weblogs": filtered_weblogs}
    return {"weblogs": weblogs_db}

@app.get("/")
async def read_root():
    """
    Defines a GET endpoint for the root URL ("/").
    This asynchronous function will be called when a GET request
    is made to the root path.
    """
    return {"message": "Hello, FastAPI!"}
