import json

def analyze_weblogs(file_path='FastAPI-backend/synthetic_visitor_weblogs.json'):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        return

    problematic_entries = []
    
    # Define keywords or patterns that might indicate problematic locations
    # These are just examples, you might need to refine them based on what you actually find
    problematic_keywords = ["ocean", "sea", "water", "pacific", "atlantic", "indian", "arctic", 
                            "southern", "equatorial", "international waters", "to the right of japan", "unspecified"]

    for entry in data.get('weblogs', []):
        country = entry.get('country', '').lower()
        region = entry.get('region', '').lower()
        city = entry.get('city', '').lower()

        # Check for problematic keywords in country, region, or city
        if any(keyword in country for keyword in problematic_keywords) or \
           any(keyword in region for keyword in problematic_keywords) or \
           any(keyword in city for keyword in problematic_keywords):
            problematic_entries.append(entry)
        
        # Additional check: look for specific non-geographic or placeholder values
        if country in ["n/a", "unknown", "none"] or \
           region in ["n/a", "unknown", "none"] or \
           city in ["n/a", "unknown", "none"]:
            problematic_entries.append(entry)

    if problematic_entries:
        print("Found problematic weblog entries:")
        for entry in problematic_entries:
            print(json.dumps(entry, indent=2))
    else:
        print("No problematic weblog entries found based on the defined keywords.")

if __name__ == "__main__":
    analyze_weblogs() 