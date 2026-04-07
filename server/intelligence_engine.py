import google.generativeai as genai
import json
import os

# Define the "Cognitive Engine" for Finet
def analyze_news_for_user(articles, user_profile):
    """
    Takes a list of raw news articles and annotates them with 
    What, Why, Impact on User, and Final Learning.
    """
    if not articles:
        return []

    # Get user context
    goal = user_profile.get('goalText', 'financial growth')
    tier = user_profile.get('tierInfo', {}).get('label', 'Explorer')
    
    # We only analyze the top 5 most relevant for performance/API limits
    top_articles = articles[:5]
    
    prompt = f"""
    You are the "Finet Cognitive Intelligence Engine". 
    Analyise these 5 news headlines for a user who is categorized as a "{tier}" with the goal: "{goal}".
    
    For EACH article, provide:
    1. Summary (What happened)
    2. Context (Why it happened)
    3. Personal Impact (How it specifically affects this user's strategy)
    4. Learning (A 1-sentence financial lesson)
    
    Format the output as a JSON array of objects with keys: 
    "title", "summary", "why", "impact", "learning".
    
    Articles:
    {json.dumps([{'title': a['title'], 'desc': a.get('description', '')} for a in top_articles])}
    """
    
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        # Parse the JSON from the AI response
        raw_text = response.text
        # Clean up in case of md code blocks
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()
            
        annotations = json.loads(raw_text)
        
        # Merge back with original articles
        annotated_list = []
        for i, a in enumerate(top_articles):
            ann = annotations[i] if i < len(annotations) else {}
            annotated_list.append({
                **a,
                "ai_analysis": {
                    "summary": ann.get('summary', a.get('description', '')),
                    "why": ann.get('why', "Broad market shifts."),
                    "impact": ann.get('impact', "Stay focused on your long-term roadmap."),
                    "learning": ann.get('learning', "Knowledge is power in volatility.")
                }
            })
        
        # Return annotated top 5 + rest of the news (without analysis for now to save tokens)
        return annotated_list + articles[5:]
        
    except Exception as e:
        print(f"[Intelligence Engine] Analysis failed: {e}")
        return articles

def get_suggested_resources(user_profile, level):
    """
    Generates a personalized list of Articles, Blogs, and Courses 
    matched to the user's situation.
    """
    goal = user_profile.get('goalText', '').lower()
    
    # Static but goal-oriented resource map
    RESOURCES = [
        {"type": "Article", "title": "Index Funds vs Active Funds: The Multiplier Effect", "desc": "Why consistency beats luck in the Indian market.", "xp": 20, "level": 1, "link": "#learning"},
        {"type": "Blog",    "title": "My First ₹10,000", "desc": "How small savings compound into wealth.", "xp": 15, "level": 1, "link": "#learning"},
        {"type": "Course",  "title": "Mastering SIP Discipline", "desc": "A 5-part video series on systematic growth.", "xp": 50, "level": 2, "link": "#course"},
        {"type": "PDF",     "title": "The Tax-Saving Cheat Sheet (80C & Beyond)", "desc": "Maximise your take-home pay.", "xp": 30, "level": 2, "link": "#learning"},
    ]
    
    # Filter by level and relevance
    suggested = [r for r in RESOURCES if r['level'] <= level]
    
    if "save" in goal or "budget" in goal:
        suggested.append({"type": "Blog", "title": "The 50/30/20 Rule in 2026", "desc": "Allocating capital precisely.", "xp": 15, "level": 1, "link": "#learning"})
    
    return suggested
