import json
import random
import numpy as np
from datetime import datetime, timedelta
import secrets
from collections import defaultdict
import math

class WeblogGenerator:
    def __init__(self):
        self.setup_data_structures()
        self.setup_probability_distributions()
    
    def setup_data_structures(self):
        """Setup all the data structures and mappings"""
        
        # Enhanced location data with ISPs, timezones, and probabilities
        self.location_data = {
            'United States': {
                'weight': 0.35,
                'timezone_offset': [-8, -5, -6, -7],  # PST, EST, CST, MST
                'regions': {
                    'California': {
                        'weight': 0.4,
                        'cities': {
                            'Los Angeles': {'weight': 0.4, 'tech_affinity': 0.8},
                            'San Francisco': {'weight': 0.35, 'tech_affinity': 0.95},
                            'San Diego': {'weight': 0.15, 'tech_affinity': 0.7},
                            'Sacramento': {'weight': 0.1, 'tech_affinity': 0.6}
                        }
                    },
                    'New York': {
                        'weight': 0.25,
                        'cities': {
                            'New York': {'weight': 0.7, 'tech_affinity': 0.85},
                            'Buffalo': {'weight': 0.2, 'tech_affinity': 0.6},
                            'Albany': {'weight': 0.1, 'tech_affinity': 0.65}
                        }
                    },
                    'Texas': {
                        'weight': 0.2,
                        'cities': {
                            'Houston': {'weight': 0.4, 'tech_affinity': 0.75},
                            'Austin': {'weight': 0.35, 'tech_affinity': 0.9},
                            'Dallas': {'weight': 0.25, 'tech_affinity': 0.8}
                        }
                    },
                    'Washington': {
                        'weight': 0.15,
                        'cities': {
                            'Seattle': {'weight': 0.8, 'tech_affinity': 0.92},
                            'Spokane': {'weight': 0.2, 'tech_affinity': 0.65}
                        }
                    }
                },
                'isps': ['Comcast Cable', 'Verizon Wireless', 'AT&T Internet', 'Charter Spectrum', 'Cox Communications']
            },
            'United Kingdom': {
                'weight': 0.2,
                'timezone_offset': [0],  # GMT
                'regions': {
                    'England': {
                        'weight': 0.8,
                        'cities': {
                            'London': {'weight': 0.6, 'tech_affinity': 0.88},
                            'Manchester': {'weight': 0.2, 'tech_affinity': 0.75},
                            'Birmingham': {'weight': 0.15, 'tech_affinity': 0.7},
                            'Leeds': {'weight': 0.05, 'tech_affinity': 0.72}
                        }
                    },
                    'Scotland': {
                        'weight': 0.15,
                        'cities': {
                            'Edinburgh': {'weight': 0.6, 'tech_affinity': 0.8},
                            'Glasgow': {'weight': 0.4, 'tech_affinity': 0.75}
                        }
                    },
                    'Wales': {
                        'weight': 0.05,
                        'cities': {
                            'Cardiff': {'weight': 1.0, 'tech_affinity': 0.7}
                        }
                    }
                },
                'isps': ['BT Broadband', 'Sky Broadband', 'Virgin Media', 'TalkTalk', 'Plusnet']
            },
            'Germany': {
                'weight': 0.15,
                'timezone_offset': [1],  # CET
                'regions': {
                    'Bavaria': {
                        'weight': 0.3,
                        'cities': {
                            'Munich': {'weight': 0.7, 'tech_affinity': 0.82},
                            'Nuremberg': {'weight': 0.3, 'tech_affinity': 0.75}
                        }
                    },
                    'North Rhine-Westphalia': {
                        'weight': 0.35,
                        'cities': {
                            'Cologne': {'weight': 0.4, 'tech_affinity': 0.78},
                            'Düsseldorf': {'weight': 0.35, 'tech_affinity': 0.8},
                            'Dortmund': {'weight': 0.25, 'tech_affinity': 0.72}
                        }
                    },
                    'Berlin': {
                        'weight': 0.35,
                        'cities': {
                            'Berlin': {'weight': 1.0, 'tech_affinity': 0.85}
                        }
                    }
                },
                'isps': ['Deutsche Telekom', 'Vodafone Germany', '1&1', 'O2 Germany']
            },
            'Canada': {
                'weight': 0.1,
                'timezone_offset': [-8, -5, -6],  # PST, EST, CST
                'regions': {
                    'Ontario': {
                        'weight': 0.5,
                        'cities': {
                            'Toronto': {'weight': 0.7, 'tech_affinity': 0.83},
                            'Ottawa': {'weight': 0.3, 'tech_affinity': 0.78}
                        }
                    },
                    'British Columbia': {
                        'weight': 0.3,
                        'cities': {
                            'Vancouver': {'weight': 0.8, 'tech_affinity': 0.85},
                            'Victoria': {'weight': 0.2, 'tech_affinity': 0.75}
                        }
                    },
                    'Quebec': {
                        'weight': 0.2,
                        'cities': {
                            'Montreal': {'weight': 0.8, 'tech_affinity': 0.8},
                            'Quebec City': {'weight': 0.2, 'tech_affinity': 0.7}
                        }
                    }
                },
                'isps': ['Bell Canada', 'Rogers Communications', 'Telus', 'Shaw Communications']
            },
            'Australia': {
                'weight': 0.08,
                'timezone_offset': [10, 11],  # AEST, AEDT
                'regions': {
                    'New South Wales': {
                        'weight': 0.5,
                        'cities': {
                            'Sydney': {'weight': 0.8, 'tech_affinity': 0.84},
                            'Newcastle': {'weight': 0.2, 'tech_affinity': 0.72}
                        }
                    },
                    'Victoria': {
                        'weight': 0.35,
                        'cities': {
                            'Melbourne': {'weight': 0.9, 'tech_affinity': 0.86},
                            'Geelong': {'weight': 0.1, 'tech_affinity': 0.7}
                        }
                    },
                    'Queensland': {
                        'weight': 0.15,
                        'cities': {
                            'Brisbane': {'weight': 0.7, 'tech_affinity': 0.78},
                            'Gold Coast': {'weight': 0.3, 'tech_affinity': 0.73}
                        }
                    }
                },
                'isps': ['Telstra', 'Optus', 'TPG', 'Aussie Broadband']
            },
            'France': {
                'weight': 0.07,
                'timezone_offset': [1],  # CET
                'regions': {
                    'Île-de-France': {
                        'weight': 0.6,
                        'cities': {
                            'Paris': {'weight': 1.0, 'tech_affinity': 0.83}
                        }
                    },
                    'Provence-Alpes-Côte d\'Azur': {
                        'weight': 0.25,
                        'cities': {
                            'Marseille': {'weight': 0.6, 'tech_affinity': 0.75},
                            'Nice': {'weight': 0.4, 'tech_affinity': 0.78}
                        }
                    },
                    'Auvergne-Rhône-Alpes': {
                        'weight': 0.15,
                        'cities': {
                            'Lyon': {'weight': 1.0, 'tech_affinity': 0.8}
                        }
                    }
                },
                'isps': ['Orange France', 'Free', 'SFR', 'Bouygues Telecom']
            },
            'Spain': {
                'weight': 0.05,
                'timezone_offset': [1],  # CET
                'regions': {
                    'Madrid': {
                        'weight': 0.4,
                        'cities': {
                            'Madrid': {'weight': 1.0, 'tech_affinity': 0.8}
                        }
                    },
                    'Catalonia': {
                        'weight': 0.4,
                        'cities': {
                            'Barcelona': {'weight': 0.8, 'tech_affinity': 0.82},
                            'Girona': {'weight': 0.2, 'tech_affinity': 0.7}
                        }
                    },
                    'Andalusia': {
                        'weight': 0.2,
                        'cities': {
                            'Seville': {'weight': 0.5, 'tech_affinity': 0.72},
                            'Málaga': {'weight': 0.5, 'tech_affinity': 0.75}
                        }
                    }
                },
                'isps': ['Movistar', 'Vodafone Spain', 'Orange Spain', 'MásMóvil']
            }
        }
        
        # Enhanced page data with conversion probabilities and typical user flows
        self.page_data = {
            '/': {
                'title': 'eGain - Customer Engagement Platform',
                'conversion_probability': 0.02,
                'avg_time_on_page': 45,
                'bounce_probability': 0.3,
                'next_pages': {
                    '/pricing': 0.25,
                    '/products/chatbot-solutions': 0.2,
                    '/solutions/financial-services': 0.15,
                    '/products/customer-engagement': 0.15,
                    '/about/careers': 0.1,
                    '/contact': 0.05,
                    'exit': 0.1
                }
            },
            '/pricing': {
                'title': 'Pricing & Plans - eGain',
                'conversion_probability': 0.15,
                'avg_time_on_page': 120,
                'bounce_probability': 0.15,
                'next_pages': {
                    '/contact': 0.4,
                    '/products/chatbot-solutions': 0.2,
                    '/': 0.15,
                    '/solutions/enterprise': 0.1,
                    'exit': 0.15
                }
            },
            '/products/chatbot-solutions': {
                'title': 'AI Chatbot Solutions - eGain',
                'conversion_probability': 0.08,
                'avg_time_on_page': 90,
                'bounce_probability': 0.2,
                'next_pages': {
                    '/pricing': 0.3,
                    '/case-studies/bank-of-america': 0.25,
                    '/contact': 0.2,
                    '/': 0.1,
                    'exit': 0.15
                }
            },
            '/solutions/financial-services': {
                'title': 'Financial Services Customer Engagement - eGain',
                'conversion_probability': 0.12,
                'avg_time_on_page': 105,
                'bounce_probability': 0.18,
                'next_pages': {
                    '/case-studies/bank-of-america': 0.35,
                    '/pricing': 0.25,
                    '/contact': 0.2,
                    '/': 0.1,
                    'exit': 0.1
                }
            },
            '/resources/whitepapers': {
                'title': 'Free Whitepapers & Resources - eGain',
                'conversion_probability': 0.25,
                'avg_time_on_page': 180,
                'bounce_probability': 0.1,
                'next_pages': {
                    '/blog/ai-customer-service-trends': 0.3,
                    '/products/customer-engagement': 0.25,
                    '/contact': 0.2,
                    '/': 0.15,
                    'exit': 0.1
                }
            },
            '/about/careers': {
                'title': 'Careers at eGain - Join Our Team',
                'conversion_probability': 0.05,
                'avg_time_on_page': 75,
                'bounce_probability': 0.25,
                'next_pages': {
                    '/': 0.4,
                    '/contact': 0.3,
                    'exit': 0.3
                }
            },
            '/products/customer-engagement': {
                'title': 'Customer Engagement Solutions - eGain',
                'conversion_probability': 0.1,
                'avg_time_on_page': 95,
                'bounce_probability': 0.2,
                'next_pages': {
                    '/pricing': 0.35,
                    '/products/chatbot-solutions': 0.2,
                    '/contact': 0.2,
                    '/': 0.15,
                    'exit': 0.1
                }
            },
            '/solutions/enterprise': {
                'title': 'Enterprise Customer Engagement Solutions - eGain',
                'conversion_probability': 0.14,
                'avg_time_on_page': 110,
                'bounce_probability': 0.15,
                'next_pages': {
                    '/pricing': 0.4,
                    '/contact': 0.3,
                    '/case-studies/bank-of-america': 0.15,
                    '/': 0.1,
                    'exit': 0.05
                }
            },
            '/solutions/healthcare': {
                'title': 'Healthcare Customer Engagement Solutions - eGain',
                'conversion_probability': 0.11,
                'avg_time_on_page': 100,
                'bounce_probability': 0.2,
                'next_pages': {
                    '/pricing': 0.35,
                    '/contact': 0.25,
                    '/': 0.2,
                    'exit': 0.2
                }
            },
            '/blog/ai-customer-service-trends': {
                'title': 'AI Customer Service Trends 2024 - eGain Blog',
                'conversion_probability': 0.03,
                'avg_time_on_page': 210,
                'bounce_probability': 0.4,
                'next_pages': {
                    '/resources/whitepapers': 0.3,
                    '/products/chatbot-solutions': 0.25,
                    '/': 0.2,
                    'exit': 0.25
                }
            },
            '/case-studies/bank-of-america': {
                'title': 'Bank of America Case Study - eGain',
                'conversion_probability': 0.18,
                'avg_time_on_page': 150,
                'bounce_probability': 0.12,
                'next_pages': {
                    '/contact': 0.4,
                    '/pricing': 0.3,
                    '/solutions/financial-services': 0.15,
                    '/': 0.1,
                    'exit': 0.05
                }
            },
            '/products/knowledge-management': {
                'title': 'Knowledge Management Solutions - eGain',
                'conversion_probability': 0.09,
                'avg_time_on_page': 85,
                'bounce_probability': 0.22,
                'next_pages': {
                    '/pricing': 0.3,
                    '/contact': 0.25,
                    '/': 0.2,
                    'exit': 0.25
                }
            },
            '/contact': {
                'title': 'Contact Us - eGain',
                'conversion_probability': 0.35,
                'avg_time_on_page': 60,
                'bounce_probability': 0.05,
                'next_pages': {
                    'exit': 1.0
                }
            }
        }
        
        # Device and browser data with realistic distributions
        self.device_browser_data = {
            'desktop': {
                'weight': 0.65,
                'browsers': {
                    'Chrome': {'weight': 0.6, 'versions': ['91.0.4472.124', '92.0.4515.107', '93.0.4577.82']},
                    'Firefox': {'weight': 0.15, 'versions': ['89.0', '90.0', '91.0']},
                    'Safari': {'weight': 0.12, 'versions': ['14.1.1', '14.1.2', '15.0']},
                    'Edge': {'weight': 0.13, 'versions': ['91.0.864.59', '92.0.902.67', '93.0.961.38']}
                },
                'operating_systems': {
                    'Windows 10': {'weight': 0.7},
                    'macOS 11.4': {'weight': 0.25},
                    'Ubuntu 20.04': {'weight': 0.05}
                },
                'screen_resolutions': ['1920x1080', '1366x768', '1440x900', '2560x1440', '1600x900'],
                'viewport_sizes': ['1400x900', '1366x768', '1200x800', '1440x766', '1600x900']
            },
            'mobile': {
                'weight': 0.28,
                'browsers': {
                    'Mobile Safari': {'weight': 0.5, 'versions': ['14.1.1', '14.1.2', '15.0']},
                    'Chrome Mobile': {'weight': 0.4, 'versions': ['91.0.4472.120', '92.0.4515.115', '93.0.4577.62']},
                    'Firefox Mobile': {'weight': 0.1, 'versions': ['89.0', '90.0', '91.0']}
                },
                'operating_systems': {
                    'iOS 14.6': {'weight': 0.5},
                    'Android 11': {'weight': 0.4},
                    'iOS 15.0': {'weight': 0.1}
                },
                'screen_resolutions': ['375x812', '414x896', '390x844', '412x915', '360x800'],
                'viewport_sizes': ['375x667', '414x736', '390x664', '412x774', '360x640']
            },
            'tablet': {
                'weight': 0.07,
                'browsers': {
                    'Mobile Safari': {'weight': 0.7, 'versions': ['14.1.1', '14.1.2', '15.0']},
                    'Chrome Mobile': {'weight': 0.3, 'versions': ['91.0.4472.120', '92.0.4515.115']}
                },
                'operating_systems': {
                    'iOS 14.6': {'weight': 0.6},
                    'Android 11': {'weight': 0.4}
                },
                'screen_resolutions': ['834x1194', '1024x768', '800x1280', '768x1024'],
                'viewport_sizes': ['834x1053', '1024x704', '800x1205', '768x954']
            }
        }
        
        # UTM and referrer data with realistic patterns
        self.marketing_data = {
            'utm_sources': {
                'direct': {'weight': 0.4, 'mediums': [''], 'campaigns': ['']},
                'google': {
                    'weight': 0.25,
                    'mediums': ['organic', 'cpc', 'email'],
                    'campaigns': ['brand_search', 'sem_spain', 'brand_awareness', 'q1_promo']
                },
                'bing': {
                    'weight': 0.1,
                    'mediums': ['organic', 'cpc'],
                    'campaigns': ['brand_search', 'lead_gen_q1']
                },
                'linkedin': {
                    'weight': 0.1,
                    'mediums': ['social', 'paid'],
                    'campaigns': ['brand_awareness', 'lead_gen_q1']
                },
                'newsletter': {
                    'weight': 0.08,
                    'mediums': ['email'],
                    'campaigns': ['march_newsletter', 'q1_promo']
                },
                'twitter': {
                    'weight': 0.04,
                    'mediums': ['social'],
                    'campaigns': ['brand_awareness']
                },
                'facebook': {
                    'weight': 0.03,
                    'mediums': ['social', 'paid'],
                    'campaigns': ['brand_awareness', 'lead_gen_q1']
                }
            },
            'referrers': {
                '': 0.4,
                'https://www.google.com/': 0.2,
                'https://www.bing.com/': 0.1,
                'https://www.linkedin.com/company/egain': 0.08,
                'https://www.google.com/search?q=customer+engagement+software': 0.07,
                'https://www.google.com/search?q=ai+customer+service+trends+2024': 0.05,
                'https://t.co/abc123': 0.03,
                'https://www.egain.com/blog/ai-customer-service-trends': 0.04,
                'https://www.egain.com/solutions/financial-services': 0.02,
                'https://www.egain.com/': 0.01
            }
        }
        
        self.conversion_types = ['whitepaper_download', 'contact_form', 'demo_request', 'newsletter_signup']
        self.languages = ['en-US', 'en-GB', 'en-CA', 'fr-FR', 'de-DE', 'es-ES', 'en-AU']
    
    def setup_probability_distributions(self):
        """Setup probability distributions for various metrics"""
        self.time_distributions = {
            'business_hours': (9, 17),  # 9 AM to 5 PM local time
            'peak_days': [1, 2, 3, 4],  # Tuesday to Friday (Monday=0)
            'session_duration_mean': 8,  # minutes
            'session_duration_std': 5
        }
    
    def weighted_choice(self, choices):
        """Make a weighted random choice from a dictionary with weights"""
        if isinstance(choices, dict):
            items = list(choices.keys())
            weights = [choices[item].get('weight', 1) if isinstance(choices[item], dict) else choices[item] for item in items]
        else:
            items = list(choices.keys())
            weights = list(choices.values())
        
        return random.choices(items, weights=weights, k=1)[0]
    
    def generate_realistic_timestamp(self, start_time, timezone_offset=0, user_behavior_pattern='normal'):
        """Generate realistic timestamps based on user behavior patterns"""
        base_time = start_time + timedelta(hours=timezone_offset)
        
        # Add business hours bias
        if user_behavior_pattern == 'business':
            # More likely during business hours
            hour_bias = np.random.normal(13, 3)  # Peak around 1 PM
            hour_bias = max(9, min(17, hour_bias))
        elif user_behavior_pattern == 'evening':
            # Evening user
            hour_bias = np.random.normal(20, 2)  # Peak around 8 PM
            hour_bias = max(18, min(23, hour_bias))
        else:
            # Normal distribution throughout the day
            hour_bias = np.random.normal(14, 4)
            hour_bias = max(0, min(23, hour_bias))
        
        # Add day of week bias (less traffic on weekends)
        day_bias = random.choices([0, 1, 2, 3, 4, 5, 6], weights=[0.8, 1.2, 1.3, 1.3, 1.2, 0.9, 0.7])[0]
        
        # Calculate final timestamp
        random_days = random.randint(0, 30)  # Within 30 days
        random_hours = int(hour_bias)
        random_minutes = random.randint(0, 59)
        random_seconds = random.randint(0, 59)
        
        final_time = base_time + timedelta(
            days=random_days,
            hours=random_hours,
            minutes=random_minutes,
            seconds=random_seconds
        )
        
        # Adjust for day of week bias
        while final_time.weekday() != day_bias and random.random() < 0.7:
            final_time += timedelta(days=random.choice([-1, 1]))
        
        return final_time
    
    def generate_user_location(self):
        """Generate user location with realistic clustering"""
        country = self.weighted_choice(self.location_data)
        country_data = self.location_data[country]
        
        region = self.weighted_choice(country_data['regions'])
        region_data = country_data['regions'][region]
        
        city = self.weighted_choice(region_data['cities'])
        city_data = region_data['cities'][city]
        
        isp = random.choice(country_data['isps'])
        timezone_offset = random.choice(country_data['timezone_offset'])
        
        return {
            'country': country,
            'region': region,
            'city': city,
            'isp': isp,
            'timezone_offset': timezone_offset,
            'tech_affinity': city_data['tech_affinity']
        }
    
    def generate_device_info(self, tech_affinity=0.75):
        """Generate device information based on tech affinity"""
        # Higher tech affinity = more likely to use newer devices/browsers
        device_weights = {
            'desktop': 0.65 + (tech_affinity - 0.75) * 0.1,
            'mobile': 0.28 - (tech_affinity - 0.75) * 0.05,
            'tablet': 0.07 - (tech_affinity - 0.75) * 0.05
        }
        
        device_type = self.weighted_choice(device_weights)
        device_data = self.device_browser_data[device_type]
        
        browser = self.weighted_choice(device_data['browsers'])
        browser_version = random.choice(device_data['browsers'][browser]['versions'])
        
        os = self.weighted_choice(device_data['operating_systems'])
        screen_resolution = random.choice(device_data['screen_resolutions'])
        viewport_size = random.choice(device_data['viewport_sizes'])
        
        # Generate user agent string
        user_agent = self.generate_user_agent(device_type, browser, browser_version, os)
        
        return {
            'device_type': device_type,
            'browser': f"{browser} {browser_version}",
            'operating_system': os,
            'screen_resolution': screen_resolution,
            'viewport_size': viewport_size,
            'user_agent': user_agent
        }
    
    def generate_user_agent(self, device_type, browser, version, os):
        """Generate realistic user agent strings"""
        user_agents = {
            'desktop': {
                'Chrome': f'Mozilla/5.0 ({os.replace("macOS", "Macintosh; Intel Mac OS X").replace("Ubuntu", "X11; Linux x86_64").replace("Windows", "Windows NT")}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36',
                'Firefox': f'Mozilla/5.0 ({os.replace("macOS", "Macintosh").replace("Ubuntu", "X11; Linux x86_64").replace("Windows", "Windows NT")}) Gecko/20100101 Firefox/{version}',
                'Safari': f'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/{version} Safari/605.1.15',
                'Edge': f'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36 Edg/{version}'
            },
            'mobile': {
                'Mobile Safari': f'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/{version} Mobile/15E148 Safari/604.1',
                'Chrome Mobile': f'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Mobile Safari/537.36',
                'Firefox Mobile': f'Mozilla/5.0 (Mobile; rv:{version}) Gecko/{version} Firefox/{version}'
            },
            'tablet': {
                'Mobile Safari': f'Mozilla/5.0 (iPad; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/{version} Mobile/15E148 Safari/604.1',
                'Chrome Mobile': f'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36'
            }
        }
        
        browser_key = browser.split()[0] if device_type == 'desktop' else browser
        return user_agents.get(device_type, {}).get(browser_key, 'Mozilla/5.0 (Unknown)')
    
    def generate_marketing_attribution(self):
        """Generate realistic marketing attribution"""
        utm_source = self.weighted_choice(self.marketing_data['utm_sources'])
        source_data = self.marketing_data['utm_sources'][utm_source]
        
        utm_medium = random.choice(source_data['mediums'])
        utm_campaign = random.choice(source_data['campaigns'])
        
        # Generate referrer based on source
        referrer = self.weighted_choice(self.marketing_data['referrers'])
        
        return {
            'utm_source': utm_source,
            'utm_medium': utm_medium,
            'utm_campaign': utm_campaign,
            'referrer': referrer
        }
    
    def generate_user_journey(self, start_page='/', tech_affinity=0.75, user_type='normal'):
        """Generate a realistic user journey through the website"""
        journey = []
        current_page = start_page
        session_duration = max(1, int(np.random.exponential(self.time_distributions['session_duration_mean'])))
        
        for step in range(random.randint(1, min(8, session_duration))):
            page_data = self.page_data[current_page]
            
            # Calculate time on page with realistic distribution
            base_time = page_data['avg_time_on_page']
            time_variance = base_time * 0.6  # 60% variance
            time_on_page = max(10, int(np.random.gamma(2, base_time/2)))
            
            # Calculate scroll depth based on time on page and tech affinity
            if time_on_page < 30:
                scroll_depth = random.randint(20, 50)
            elif time_on_page < 60:
                scroll_depth = random.randint(40, 75)
            else:
                scroll_depth = random.randint(60, 100)
            
            # Adjust for tech affinity
            scroll_depth = min(100, scroll_depth + int((tech_affinity - 0.75) * 20))
            
            # Calculate clicks based on page type and engagement
            if current_page == '/contact':
                clicks_count = random.choices([1, 2, 3, 4], weights=[0.3, 0.4, 0.2, 0.1])[0]
            elif current_page in ['/pricing', '/products/chatbot-solutions']:
                clicks_count = random.choices([0, 1, 2, 3], weights=[0.2, 0.4, 0.3, 0.1])[0]
            else:
                clicks_count = random.choices([0, 1, 2], weights=[0.5, 0.4, 0.1])[0]
            
            # Generate page load time (with some outliers)
            if random.random() < 0.05:  # 5% chance of slow load (outlier)
                page_load_time = random.randint(3000, 8000)
            elif random.random() < 0.1:  # 10% chance of very fast load
                page_load_time = random.randint(200, 600)
            else:
                page_load_time = random.randint(700, 2500)
            
            # Calculate engagement score
            engagement_factors = [
                time_on_page / 60,  # Time factor
                scroll_depth / 100,  # Scroll factor
                clicks_count / 3,   # Click factor
                tech_affinity       # Tech affinity factor
            ]
            base_engagement = sum(engagement_factors) / len(engagement_factors)
            engagement_score = round(base_engagement * 10 + random.uniform(-1, 1), 1)
            engagement_score = max(1.0, min(10.0, engagement_score))
            
            # Determine if this is a bounce
            is_bounce = step == 0 and random.random() < page_data['bounce_probability']
            
            # Determine conversion
            conversion_prob = page_data['conversion_probability']
            if user_type == 'high_intent':
                conversion_prob *= 2
            elif user_type == 'researcher':
                conversion_prob *= 0.5
            
            is_converted = random.random() < conversion_prob
            conversion_type = random.choice(self.conversion_types) if is_converted else ""
            
            journey.append({
                'page_visited': current_page,
                'page_title': page_data['title'],
                'time_on_page_seconds': time_on_page,
                'scroll_depth_percent': scroll_depth,
                'clicks_count': clicks_count,
                'page_load_time_ms': page_load_time,
                'engagement_score': engagement_score,
                'is_bounce': is_bounce,
                'is_converted': is_converted,
                'conversion_type': conversion_type
            })
            
            # Determine next page
            if is_bounce or current_page == '/contact':
                break
            
            next_page_choices = page_data['next_pages']
            next_page = self.weighted_choice(next_page_choices)
            
            if next_page == 'exit':
                break
            
            current_page = next_page
        
        return journey
    
    def generate_ip_address(self, country):
        """Generate realistic IP addresses based on country"""
        ip_ranges = {
            'United States': '192.168',
            'United Kingdom': '10.0',
            'Germany': '172.16',
            'Canada': '192.168',
            'Australia': '10.1',
            'France': '172.17',
            'Spain': '10.2'
        }
        
        base = ip_ranges.get(country, '192.168')
        third_octet = random.randint(0, 255)
        fourth_octet = random.randint(1, 254)
        
        return f"{base}.{third_octet}.{fourth_octet}"
    
    def generate_user_profile(self, user_id):
        """Generate a comprehensive user profile with consistent behavior"""
        location = self.generate_user_location()
        
        # User behavior patterns
        user_types = {
            'researcher': {'weight': 0.3, 'session_frequency': 'high', 'conversion_likelihood': 'low'},
            'evaluator': {'weight': 0.25, 'session_frequency': 'medium', 'conversion_likelihood': 'medium'},
            'buyer': {'weight': 0.15, 'session_frequency': 'low', 'conversion_likelihood': 'high'},
            'casual': {'weight': 0.2, 'session_frequency': 'low', 'conversion_likelihood': 'very_low'},
            'returning_customer': {'weight': 0.1, 'session_frequency': 'medium', 'conversion_likelihood': 'medium'}
        }
        
        user_type = self.weighted_choice(user_types)
        user_behavior = user_types[user_type]
        
        # Generate consistent device info
        device_info = self.generate_device_info(location['tech_affinity'])
        
        # Generate user behavior pattern
        if user_behavior['session_frequency'] == 'high':
            num_sessions = random.randint(8, 25)
            behavior_pattern = 'business'
        elif user_behavior['session_frequency'] == 'medium':
            num_sessions = random.randint(3, 12)
            behavior_pattern = random.choice(['business', 'normal'])
        else:
            num_sessions = random.randint(1, 6)
            behavior_pattern = random.choice(['normal', 'evening'])
        
        return {
            'user_id': user_id,
            'user_type': user_type,
            'behavior_pattern': behavior_pattern,
            'num_sessions': num_sessions,
            'location': location,
            'device_info': device_info,
            'ip_address': self.generate_ip_address(location['country']),
            'language': self.get_language_for_country(location['country'])
        }
    
    def get_language_for_country(self, country):
        """Get appropriate language based on country"""
        language_map = {
            'United States': 'en-US',
            'United Kingdom': 'en-GB',
            'Canada': random.choice(['en-CA', 'fr-FR']),
            'Australia': 'en-AU',
            'Germany': 'de-DE',
            'France': 'fr-FR',
            'Spain': 'es-ES'
        }
        return language_map.get(country, 'en-US')
    
    def generate_synthetic_weblogs(self, num_users=20, start_date=None):
        """Generate synthetic weblog data with realistic patterns and outliers"""
        if start_date is None:
            start_date = datetime(2024, 3, 15, 0, 0, 0)
        
        weblogs = []
        
        print(f"Generating profiles for {num_users} users...")
        
        # Generate user profiles
        user_profiles = []
        for i in range(1, num_users + 1):
            user_id = f"visitor_{i:03d}"
            profile = self.generate_user_profile(user_id)
            user_profiles.append(profile)
        
        print("Generating weblog entries...")
        
        # Generate sessions for each user
        for profile in user_profiles:
            for session_num in range(profile['num_sessions']):
                session_id = f"sess_{secrets.token_hex(8)}"
                
                # Generate session timestamp
                session_start = self.generate_realistic_timestamp(
                    start_date, 
                    profile['location']['timezone_offset'],
                    profile['behavior_pattern']
                )
                
                # Generate marketing attribution for this session
                marketing = self.generate_marketing_attribution()
                
                # Determine entry page based on marketing source
                entry_pages = {
                    'direct': ['/'],
                    'google': ['/', '/pricing', '/products/chatbot-solutions'],
                    'bing': ['/', '/products/customer-engagement'],
                    'linkedin': ['/solutions/enterprise', '/about/careers'],
                    'newsletter': ['/blog/ai-customer-service-trends', '/resources/whitepapers'],
                    'twitter': ['/blog/ai-customer-service-trends'],
                    'facebook': ['/']
                }
                
                entry_page = random.choice(entry_pages.get(marketing['utm_source'], ['/']))
                
                # Generate user journey
                journey = self.generate_user_journey(
                    entry_page, 
                    profile['location']['tech_affinity'],
                    profile['user_type']
                )
                
                # Create weblog entries for each page in the journey
                for step, page_data in enumerate(journey):
                    timestamp = session_start + timedelta(minutes=step * 2, seconds=random.randint(0, 120))

                    weblog_entry = {
                        "timestamp": timestamp.isoformat(timespec='milliseconds') + 'Z',
                        "visitor_id": profile['user_id'],
                        "session_id": session_id,
                        "page_visited": page_data['page_visited'],
                        "page_title": page_data['page_title'],
                        "ip_address": profile['ip_address'],
                        "user_agent": profile['device_info']['user_agent'],
                        "referrer": marketing['referrer'],
                        "language": profile['language'],
                        "screen_resolution": profile['device_info']['screen_resolution'],
                        "viewport_size": profile['device_info']['viewport_size'],
                        "device_type": profile['device_info']['device_type'],
                        "operating_system": profile['device_info']['operating_system'],
                        "browser": profile['device_info']['browser'],
                        "country": profile['location']['country'],
                        "region": profile['location']['region'],
                        "city": profile['location']['city'],
                        "isp": profile['location']['isp'],
                        "utm_source": marketing['utm_source'],
                        "utm_medium": marketing['utm_medium'],
                        "utm_campaign": marketing['utm_campaign'],
                        "page_load_time_ms": page_data['page_load_time_ms'],
                        "time_on_page_seconds": page_data['time_on_page_seconds'],
                        "scroll_depth_percent": page_data['scroll_depth_percent'],
                        "clicks_count": page_data['clicks_count'],
                        "is_bounce": page_data['is_bounce'],
                        "is_converted": page_data['is_converted'],
                        "conversion_type": page_data['conversion_type'],
                        "engagement_score": page_data['engagement_score']
                    }
                    
                    weblogs.append(weblog_entry)
            
            # Sort by timestamp to make data more realistic
        weblogs.sort(key=lambda x: x['timestamp'])
        
        print(f"Generated {len(weblogs)} weblog entries across {num_users} users")
        print(f"Average {len(weblogs)/num_users:.1f} page views per user")
        
        # Generate summary statistics
        self.print_summary_stats(weblogs)
        
        return {"weblogs": weblogs}

    def print_summary_stats(self, weblogs):
        """Print summary statistics about the generated data"""
        print("\n--- DATA SUMMARY ---")
        
        # Country distribution
        countries = {}
        for log in weblogs:
            countries[log['country']] = countries.get(log['country'], 0) + 1
        
        print("Country Distribution:")
        for country, count in sorted(countries.items(), key=lambda x: x[1], reverse=True):
            print(f"  {country}: {count} ({count/len(weblogs)*100:.1f}%)")
        
        # Device distribution
        devices = {}
        for log in weblogs:
            devices[log['device_type']] = devices.get(log['device_type'], 0) + 1
        
        print("\nDevice Distribution:")
        for device, count in sorted(devices.items(), key=lambda x: x[1], reverse=True):
            print(f"  {device}: {count} ({count/len(weblogs)*100:.1f}%)")
        
        # Conversion stats
        conversions = sum(1 for log in weblogs if log['is_converted'])
        print(f"\nConversions: {conversions} ({conversions/len(weblogs)*100:.1f}%)")
        
        # Popular pages
        pages = {}
        for log in weblogs:
            pages[log['page_visited']] = pages.get(log['page_visited'], 0) + 1
        
        print("\nTop 5 Pages:")
        for page, count in sorted(pages.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"  {page}: {count} views")


def main():
    """Main function to generate synthetic weblog data"""
    generator = WeblogGenerator()
    
    # Generate data with more users and better distribution
    synthetic_data = generator.generate_synthetic_weblogs(
        num_users=50,  # Increased for better patterns
        start_date=datetime(2024, 3, 15, 0, 0, 0)
    )
    
    # Save to file
    output_file = 'enhanced_synthetic_visitor_weblogs.json'
    with open(output_file, 'w') as f:
        json.dump(synthetic_data, f, indent=2)
    
    print(f"\nData saved to {output_file}")
    
    # Generate a smaller sample for testing
    test_data = generator.generate_synthetic_weblogs(num_users=5)
    with open('test_sample_weblogs.json', 'w') as f:
        json.dump(test_data, f, indent=2)
    
    print("Test sample saved to test_sample_weblogs.json")


if __name__ == "__main__":
    main()