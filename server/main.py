# ─── Finet Python API Server ──────────────────────────────────────────────────
# Endpoints:
#   GET  /api/news          — real financial news (NewsAPI + Alpha Vantage + BS4)
#   POST /api/chat          — Gemini AI coaching (gemini-2.0-flash)
#   GET  /api/market-pulse  — quick index data from Alpha Vantage
# ─────────────────────────────────────────────────────────────────────────────

import os
import re
import json
import time
import uuid
import requests
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from intelligence_engine import analyze_news_for_user, get_suggested_resources
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt, jwk
from jose.utils import base64url_decode
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, User, BudgetNode, Transaction, PortfolioItem, Loan, CommunityPost, CommunityUpvote

load_dotenv(override=True)

# ─── API Configuration ────────────────────────────────────────────────────────
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
NEWS_API_KEY      = os.getenv("NEWS_API_KEY", "")
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "").strip().strip('"').strip("'")
SUPABASE_URL = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", "")).strip().strip('"').strip("'")
SUPABASE_JWKS_URL = os.getenv("SUPABASE_JWKS_URL", "").strip().strip('"').strip("'") or (f"{SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json" if SUPABASE_URL else "")
SUPABASE_JWT_ALGORITHM = "HS256"
JWKS_CACHE = {"keys": [], "fetched_at": 0}

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print(f"[System] Gemini active (Key ends in: ...{GEMINI_API_KEY[-4:]})")
else:
    print("[System] CRITICAL: GEMINI_API_KEY not found in .env")


# ─── JWT Utilities ─────────────────────────────────────────────────────────────

def fetch_jwks():
    if not SUPABASE_JWKS_URL:
        raise RuntimeError("SUPABASE_URL or SUPABASE_JWKS_URL is not configured for Supabase JWT verification")

    now = time.time()
    if JWKS_CACHE["keys"] and now - JWKS_CACHE["fetched_at"] < 3600:
        return JWKS_CACHE["keys"]

    resp = requests.get(SUPABASE_JWKS_URL, timeout=10)
    resp.raise_for_status()
    jwks = resp.json().get("keys", [])
    JWKS_CACHE["keys"] = jwks
    JWKS_CACHE["fetched_at"] = now
    return jwks


def get_jwks_key(token):
    try:
        header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token header")

    kid = header.get("kid")
    alg = header.get("alg")
    if not kid or not alg:
        raise HTTPException(status_code=401, detail="Invalid token header")

    keys = fetch_jwks()
    for key in keys:
        if key.get("kid") == kid:
            return key, alg

    raise HTTPException(status_code=401, detail="Unable to resolve token signing key")


# ─── Database ──────────────────────────────────────────────────────────────────
# Supabase PostgreSQL connection
SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD", "")
SUPABASE_PROJECT_ID = "rznbqthumdlmnkrfytxi"  # From your SUPABASE_URL

if SUPABASE_DB_PASSWORD:
    _DB_URL = f"postgresql://postgres:{SUPABASE_DB_PASSWORD}@db.{SUPABASE_PROJECT_ID}.supabase.co:5432/postgres"
else:
    _DB_URL = os.getenv("DATABASE_URL", "")

if not _DB_URL:
    raise RuntimeError("SUPABASE_DB_PASSWORD or DATABASE_URL is required to connect to Supabase PostgreSQL")

# SQLAlchemy connection
SQLALCHEMY_DATABASE_URL = _DB_URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

print(f"[System] Connected to Supabase PostgreSQL")

# ─── Skip In-App Migration (Supabase has schema) ────────────────────────────────
def run_migrations():
    """Supabase PostgreSQL schema is managed via SQL. No auto-migration needed."""
    print("[System] Using Supabase PostgreSQL schema (no auto-migration)")

run_migrations()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Authorization token missing")

    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token header")

    payload = None
    if alg == "HS256":
        if not SUPABASE_JWT_SECRET:
            raise HTTPException(status_code=500, detail="SUPABASE_JWT_SECRET is not configured")
        try:
            payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        except JWTError as e:
            print(f"[Auth Error] HS256 decode failed: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")
    elif alg in {"RS256", "ES256"}:
        if not SUPABASE_JWKS_URL:
            raise HTTPException(status_code=500, detail="SUPABASE_URL or SUPABASE_JWKS_URL is not configured for Supabase JWT verification")

        jwk_data = None
        try:
            key, header_alg = get_jwks_key(token)
            jwk_data = key
            key_obj = jwk.construct(jwk_data, algorithm=alg)
            key_to_use = key_obj.to_pem() if hasattr(key_obj, 'to_pem') else key_obj
            payload = jwt.decode(token, key_to_use, algorithms=[alg], options={"verify_aud": False})
        except JWTError as e:
            print(f"[Auth Error] {alg} JWT validation failed: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")
        except HTTPException:
            raise
        except Exception as e:
            print(f"[Auth Error] JWKS verification failed: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")
    else:
        raise HTTPException(status_code=401, detail=f"Unsupported token algorithm: {alg}")

    # Extract user ID from JWT (Supabase uses 'sub' claim for user UUID)
    user_id = payload.get("sub")
    email = payload.get("email")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

    # Fetch or create user in database
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            fullname = None
            metadata = payload.get("user_metadata") or {}
            if isinstance(metadata, dict):
                fullname = metadata.get("full_name")
            user = User(id=user_id, email=email, full_name=fullname)
            db.add(user)
            db.commit()
            db.refresh(user)
    except Exception as e:
        print(f"[Auth Error] Failed to fetch/create user: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    return user

app = FastAPI(title="Finet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Simple in-memory cache ───────────────────────────────────────────────────
_cache = {}

def cached(key: str, ttl_secs: int, fn):
    now = time.time()
    if key in _cache and now - _cache[key]["ts"] < ttl_secs:
        return _cache[key]["data"]
    result = fn()
    _cache[key] = {"ts": now, "data": result}
    return result

# ─────────────────────────────────────────────────────────────────────────────
#  NEWS ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

MONEYCONTROL_URL = "https://www.moneycontrol.com/news/business/markets/"

def scrape_moneycontrol():
    """Scrape Moneycontrol Markets news via BS4."""
    articles = []
    try:
        resp = requests.get(
            MONEYCONTROL_URL,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
            timeout=8
        )
        soup = BeautifulSoup(resp.text, "html.parser")
        for item in soup.select("li.clearfix")[:12]:
            a = item.find("a")
            if not a:
                continue
            h2 = item.find("h2")
            p  = item.find("p")
            articles.append({
                "title":       h2.get_text(strip=True) if h2 else a.get_text(strip=True),
                "description": p.get_text(strip=True) if p else "",
                "url":         a.get("href", ""),
                "source":      "Moneycontrol",
                "publishedAt": datetime.utcnow().isoformat(),
                "category":    "Markets",
                "complexity":  "Intermediate",
            })
    except Exception as e:
        print(f"[BS4 scrape] error: {e}")
    return articles

def fetch_newsapi(query="Indian stock market mutual fund investment"):
    """Fetch from NewsAPI."""
    if not NEWS_API_KEY:
        return []
    try:
        from_date = (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d")
        resp = requests.get(
            "https://newsapi.org/v2/everything",
            params={
                "q": query,
                "language": "en",
                "sortBy": "publishedAt",
                "from": from_date,
                "pageSize": 20,
                "apiKey": NEWS_API_KEY,
            },
            timeout=8
        )
        data = resp.json()
        articles = []
        for a in data.get("articles", []):
            if not a.get("title") or a["title"] == "[Removed]":
                continue
            articles.append({
                "title":       a["title"],
                "description": a.get("description") or "",
                "url":         a.get("url", ""),
                "source":      a.get("source", {}).get("name", "NewsAPI"),
                "publishedAt": a.get("publishedAt", ""),
                "category":    classify_article(a["title"]),
                "complexity":  complexity_level(a.get("description", "")),
            })
        return articles
    except Exception as e:
        print(f"[NewsAPI] error: {e}")
        return []

def fetch_alpha_vantage_news():
    """Fetch news sentiment from Alpha Vantage."""
    if not ALPHA_VANTAGE_KEY:
        return []
    try:
        resp = requests.get(
            "https://www.alphavantage.co/query",
            params={
                "function": "NEWS_SENTIMENT",
                "topics": "earnings,ipo,mergers_and_acquisitions,economy_macro",
                "sort": "LATEST",
                "limit": 15,
                "apikey": ALPHA_VANTAGE_KEY,
            },
            timeout=10
        )
        data = resp.json()
        articles = []
        for item in data.get("feed", []):
            articles.append({
                "title":       item.get("title", ""),
                "description": item.get("summary", ""),
                "url":         item.get("url", ""),
                "source":      item.get("source", "Alpha Vantage"),
                "publishedAt": item.get("time_published", ""),
                "sentiment":   item.get("overall_sentiment_label", "Neutral"),
                "category":    "Global Markets",
                "complexity":  "Advanced",
            })
        return articles
    except Exception as e:
        print(f"[AlphaVantage] error: {e}")
        return []

KEYWORDS_MAP = {
    "mutual fund":    "Mutual Funds",
    "sip":            "Mutual Funds",
    "nifty":          "Stocks",
    "sensex":         "Stocks",
    "ipo":            "Stocks",
    "rbi":            "RBI Policy",
    "interest rate":  "RBI Policy",
    "inflation":      "Economy",
    "gdp":            "Economy",
    "real estate":    "Real Estate",
    "tax":            "Tax",
    "income tax":     "Tax",
    "crypto":         "Crypto",
    "bitcoin":        "Crypto",
    "insurance":      "Insurance",
}

def classify_article(title: str) -> str:
    t = title.lower()
    for kw, cat in KEYWORDS_MAP.items():
        if kw in t:
            return cat
    return "Markets"

def complexity_level(desc: str) -> str:
    desc = desc.lower()
    if any(w in desc for w in ["derivative", "yield curve", "quantitative", "arbitrage", "futures", "options", "hedge"]):
        return "Advanced"
    if any(w in desc for w in ["portfolio", "nifty", "sensex", "equity", "sip", "mutual fund", "emi"]):
        return "Intermediate"
    return "Beginner"

FALLBACK_NEWS = [
    {"title": "Why Index Funds Beat Most Active Funds in India", "description": "Over a 10-year period, over 85% of actively managed large-cap funds underperformed their benchmark index. Here's why passive investing wins.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Mutual Funds", "complexity": "Beginner"},
    {"title": "RBI Holds Repo Rate at 6.5% — What This Means for Your EMIs", "description": "The Reserve Bank of India kept rates unchanged. Fixed deposit rates remain attractive, and home loan EMIs stay stable for now.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "RBI Policy", "complexity": "Intermediate"},
    {"title": "How to Start a ₹500/month SIP: Step by Step", "description": "Starting a SIP doesn't require a demat account. You can invest in a mutual fund directly with ₹500 through Groww or Zerodha Coin.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Mutual Funds", "complexity": "Beginner"},
    {"title": "Understanding Capital Gains Tax on Stocks and Mutual Funds", "description": "STCG at 15%, LTCG at 10% above ₹1 lakh — learn how to plan your redemptions to minimise tax outgo.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Tax", "complexity": "Intermediate"},
    {"title": "What is a Debt Fund and Why Should You Use One?", "description": "Debt funds invest in bonds and government securities. They're ideal for your emergency fund and short-term parking of money.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Mutual Funds", "complexity": "Beginner"},
    {"title": "Sensex Hits 75,000: What's Driving the Bull Run?", "description": "FII inflows, strong quarterly earnings, and a stable rupee are among the key factors fuelling the current market rally.", "url": "#", "source": "Finet Insights", "publishedAt": datetime.utcnow().isoformat(), "category": "Stocks", "complexity": "Intermediate"},
]

@app.get("/api/news")
def get_news(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    def _fetch_all():
        results = []

        # 1. NewsAPI (most reliable)
        results.extend(fetch_newsapi())

        # 2. Alpha Vantage (global sentiment)
        if ALPHA_VANTAGE_KEY:
            results.extend(fetch_alpha_vantage_news())

        # 3. BS4 scrape Moneycontrol
        scraped = scrape_moneycontrol()
        results.extend(scraped)

        # Deduplicate by title
        seen = set()
        unique = []
        for a in results:
            key = a["title"][:60]
            if key not in seen:
                seen.add(key)
                unique.append(a)

        return unique if unique else FALLBACK_NEWS

    articles = cached("news", 600, _fetch_all)  # cache 10 min
    
    # AI Annotation Layer
    if current_user:
        profile = current_user.profile_json or {}
        articles = analyze_news_for_user(articles, profile)

    return {"articles": articles, "count": len(articles), "cached": True}

@app.get("/api/roadmap/resources")
def get_roadmap_resources(current_user: User = Depends(get_current_user)):
    profile = current_user.profile_json or {}
    return {"resources": get_suggested_resources(profile)}


# ─────────────────────────────────────────────────────────────────────────────
#  AI CHAT ENDPOINT (Gemini)
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    profile: dict = {}
    history: list = []

SYSTEM_PROMPT = """You are Finet Coach — an expert, empathetic AI financial advisor for Indian users.
Your role: teach personal finance concepts clearly, give actionable advice tailored to the user's profile, and help them grow their money intelligently.

Rules:
- Always answer in the context of INDIAN finance (INR, SEBI, NSE/BSE, RBI, Indian tax laws)
- If user is a beginner/teen: use simple language, avoid jargon, use relatable examples (chai, cricket, Swiggy)
- If user is advanced: be precise, mention specific funds, ratios, strategies
- Always give at least one concrete next action
- Be encouraging but honest about risks
- Keep responses concise (under 200 words) unless explaining a complex concept
- Never give specific stock picks. Recommend index funds for beginners.
- Format with **bold** for key terms

User profile context will be provided. Adapt your tone and depth accordingly."""

@app.post("/api/chat")
def chat(req: ChatRequest):
    if not GEMINI_API_KEY:
        from coach_fallback import get_fallback_response
        return {"reply": get_fallback_response(req.message, req.profile)}

    try:
        # Improved model naming and parameter handling
        model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash", 
            system_instruction=SYSTEM_PROMPT,
        )
        
        # Log which key is being used for this specific request
        # print(f"[System] AI Call using key ending in: ...{GEMINI_API_KEY[-4:] if GEMINI_API_KEY else 'NONE'}")


        profile_ctx = ""
        if req.profile:
            tier  = req.profile.get("tier", "BEGINNER")
            goal  = req.profile.get("goalText", "grow money")
            cap   = req.profile.get("answers", {}).get("capital", "unknown")
            age   = req.profile.get("answers", {}).get("age", "unknown")
            profile_ctx = f"\n[USER PROFILE: Age={age}, Capital=₹{cap}, Tier={tier}, Goal={goal}]\n"

        history = []
        for msg in req.history[-6:]:
            history.append({
                "role": "user" if msg["role"] == "user" else "model",
                "parts": [msg["content"]]
            })

        # Test if model is responsive
        try:
            chat_session = model.start_chat(history=history)
            response = chat_session.send_message(profile_ctx + req.message)
            return {"reply": response.text}
        except Exception as api_err:
            print(f"[Gemini API Call] error: {api_err}")
            # Robust fallback to local engine if Gemini fails
            from coach_fallback import get_fallback_response
            return {"reply": get_fallback_response(req.message, req.profile)}

    except Exception as e:
        print(f"[Gemini Structure] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── AUTH ENDPOINTS ─────────────────────────────────────────────────────────────

# Legacy auth endpoints removed.
# Supabase auth will be added here in a future integration.

# Helper to map User database fields to the frontend Journey structure
def user_to_journey(user: User):
    return {
        "profile": user.profile_json,
        "xp": user.xp,
        "level": user.level,
        "seenOnboarding": bool(user.seen_onboarding),
        "visitedPages": user.visited_pages_json or [],
        "completedActions": user.completed_actions_json or [],
        "roadmapDone": user.roadmap_done_json or [],
        "lastVisit": user.last_visit,
        "streak": user.streak,
    }

# ─── DATA ENDPOINTS ─────────────────────────────────────────────────────────────

@app.get("/api/user/journey")
def get_user_journey(current_user: User = Depends(get_current_user)):
    return user_to_journey(current_user)

@app.post("/api/user/journey")
def save_user_journey(req: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Update the user fields based on the incoming journey object
    if "xp" in req: current_user.xp = req["xp"]
    if "level" in req: current_user.level = req["level"]
    if "profile" in req: current_user.profile_json = req["profile"]
    if "seenOnboarding" in req: current_user.seen_onboarding = 1 if req["seenOnboarding"] else 0
    if "visitedPages" in req: current_user.visited_pages_json = req["visitedPages"]
    if "completedActions" in req: current_user.completed_actions_json = req["completedActions"]
    if "roadmapDone" in req: current_user.roadmap_done_json = req["roadmapDone"]
    if "lastVisit" in req: current_user.last_visit = req["lastVisit"]
    if "streak" in req: current_user.streak = req["streak"]
    
    db.commit()
    return {"status": "ok"}

@app.get("/api/user/data")
def get_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    nodes = db.query(BudgetNode).filter(BudgetNode.user_id == current_user.id).all()
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    portfolio = db.query(PortfolioItem).filter(PortfolioItem.user_id == current_user.id).all()
    
    return {
        "nodes": nodes,
        "transactions": txs,
        "portfolio": portfolio
    }

@app.post("/api/user/transaction")
def add_transaction(req: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    amount = float(req.get("amount", 0))
    category = req.get("category")
    
    new_tx = Transaction(
        user_id=current_user.id,
        title=req.get("title"),
        amount=amount,
        category=category,
        date=datetime.utcnow(),
        note=req.get("note")
    )
    db.add(new_tx)
    
    # Update node spent
    node = db.query(BudgetNode).filter(BudgetNode.user_id == current_user.id, BudgetNode.name == category).first()
    if node:
        node.spent += amount
    
    db.commit()
    return {"status": "ok"}

@app.post("/api/user/portfolio")
def add_portfolio_item(req: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_item = PortfolioItem(
        user_id=current_user.id,
        name=req.get("name"),
        type=req.get("type"),
        invested=float(req.get("invested", 0)),
        current_value=float(req.get("current_value", 0)),
        roi=0.0,
        color=req.get("color", "#6366f1")
    )
    # Calculate initial ROI
    if new_item.invested > 0:
        new_item.roi = ((new_item.current_value - new_item.invested) / new_item.invested) * 100
        
    db.add(new_item)
    db.commit()
    return {"status": "ok"}

@app.post("/api/user/loans")
def add_loan(req: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_loan = Loan(
        user_id=current_user.id,
        name=req.get("name"),
        bank=req.get("bank"),
        principal=float(req.get("principal", 0)),
        remaining=float(req.get("remaining", 0)),
        interest_rate=float(req.get("interest_rate", 0)),
        tenure_months=int(req.get("tenure_months", 0)),
        emi=float(req.get("emi", 0))
    )
    db.add(new_loan)
    db.commit()
    return {"status": "ok"}

@app.post("/api/user/nodes")
def add_budget_node(req: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_node = BudgetNode(
        user_id=current_user.id,
        name=req.get("name"),
        percent=float(req.get("percent", 0)),
        color=req.get("color", "#6366f1"),
        spent=0.0
    )
    db.add(new_node)
    db.commit()
    return {"status": "ok"}

@app.get("/api/user/nodes")
def get_budget_nodes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    nodes = db.query(BudgetNode).filter(BudgetNode.user_id == current_user.id).all()
    return {"nodes": [{"id": n.name, "name": n.name, "percent": n.percent, "color": n.color, "spent": n.spent} for n in nodes]}

#  MARKET PULSE (Alpha Vantage — quick index quote)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/market-pulse")
def get_market_pulse():
    if not ALPHA_VANTAGE_KEY:
        return {"error": "No Alpha Vantage key configured", "data": []}

    symbols = ["^BSESN", "^NSEI"]  # Sensex, Nifty
    results = []

    def _fetch():
        for sym in symbols:
            try:
                resp = requests.get(
                    "https://www.alphavantage.co/query",
                    params={"function": "GLOBAL_QUOTE", "symbol": sym, "apikey": ALPHA_VANTAGE_KEY},
                    timeout=8
                )
                data = resp.json().get("Global Quote", {})
                if data:
                    results.append({
                        "symbol":  sym,
                        "price":   float(data.get("05. price", 0)),
                        "change":  float(data.get("09. change", 0)),
                        "pct":     float(data.get("10. change percent", "0%").replace("%", "")),
                    })
            except Exception as e:
                print(f"[AV market] {sym}: {e}")
        return results

    data = cached("market_pulse", 300, _fetch)
    return {"data": data}


# ─── COMMUNITY / SOCIAL INTELLIGENCE ────────────────────────────────────────

@app.get("/api/community/posts")
def get_community_posts(
    category: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch all community posts, optionally filtered by category. Includes user's vote status."""
    query = db.query(CommunityPost).order_by(CommunityPost.created_at.desc())
    
    if category and category != "All":
        category_map = {'Success Stories': 'success', 'Questions': 'question', 'Tips': 'tip', 'Discussions': 'discussion'}
        cat_value = category_map.get(category)
        if cat_value:
            query = query.filter(CommunityPost.category == cat_value)
    
    posts = query.all()
    
    # Get current user's upvotes
    my_upvotes = db.query(CommunityUpvote.post_id).filter(CommunityUpvote.user_id == current_user.id).all()
    my_upvote_ids = {u[0] for u in my_upvotes}
    
    return {
        "posts": [
            {
                "id": str(post.id),
                "author": post.author.full_name or post.author.email.split('@')[0],
                "avatar": "👤",  # Default avatar
                "title": post.title,
                "content": post.content,
                "category": post.category,
                "tag": post.category,
                "tags": post.tags or [],
                "votes": post.upvote_count,
                "userVoted": str(post.id) in my_upvote_ids,
                "comments": post.comment_count,
                "time": _time_ago(post.created_at),
                "hot": post.upvote_count > 100,
                "authorBadge": None,  # Can add verification/mentor badges later
            }
            for post in posts
        ]
    }


@app.post("/api/community/posts")
def create_community_post(
    req: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new community post."""
    title = req.get("title", "").strip()
    content = req.get("content", "").strip()
    category = req.get("category", "discussion")
    tags = req.get("tags", [])
    
    if not title or not content:
        raise HTTPException(status_code=400, detail="Title and content are required")
    
    # Map category names to database values
    category_map = {
        'Query': 'question',
        'Tactical Success': 'success',
        'Intelligence Tip': 'tip',
        'Open Discussion': 'discussion'
    }
    category = category_map.get(category, 'discussion')
    
    new_post = CommunityPost(
        user_id=current_user.id,
        title=title,
        content=content,
        category=category,
        tags=tags if isinstance(tags, list) else []
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return {
        "id": str(new_post.id),
        "status": "success",
        "message": "Post created successfully!"
    }


@app.post("/api/community/posts/{post_id}/upvote")
def toggle_upvote(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add or remove an upvote for a post."""
    try:
        post_uuid = uuid.UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = db.query(CommunityPost).filter(CommunityPost.id == post_uuid).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already upvoted
    existing = db.query(CommunityUpvote).filter(
        CommunityUpvote.user_id == current_user.id,
        CommunityUpvote.post_id == post_uuid
    ).first()
    
    if existing:
        # Remove upvote
        db.delete(existing)
        post.upvote_count = max(0, post.upvote_count - 1)
        action = "removed"
    else:
        # Add upvote
        new_upvote = CommunityUpvote(user_id=current_user.id, post_id=post_uuid)
        db.add(new_upvote)
        post.upvote_count += 1
        action = "added"
    
    db.commit()
    return {"status": "success", "action": action, "votes": post.upvote_count}


def _time_ago(dt):
    """Convert datetime to 'X ago' format."""
    if not dt:
        return "now"
    delta = datetime.utcnow() - dt
    seconds = delta.total_seconds()
    if seconds < 60:
        return "now"
    elif seconds < 3600:
        mins = int(seconds // 60)
        return f"{mins}m ago"
    elif seconds < 86400:
        hours = int(seconds // 3600)
        return f"{hours}h ago"
    elif seconds < 604800:
        days = int(seconds // 86400)
        return f"{days}d ago"
    else:
        return dt.strftime('%Y-%m-%d')


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "gemini": bool(GEMINI_API_KEY),
        "newsapi": bool(NEWS_API_KEY),
        "alphavantage": bool(ALPHA_VANTAGE_KEY),
    }


@app.get("/api/roadmap/resources")
async def roadmap_resources(user: User = Depends(get_current_user)):
    db = get_db()
    j_data = db.execute("SELECT profile, level FROM user_journey WHERE user_id = ?", (user.id,)).fetchone()
    if not j_data:
        return {"resources": []}
        
    profile = json.loads(j_data[0]) if j_data[0] else {}
    level = j_data[1] or 1
    
    resources = get_suggested_resources(profile, level)
    return {"resources": resources}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
