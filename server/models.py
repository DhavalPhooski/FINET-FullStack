from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Uuid, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    # Journey / Gamification fields
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    profile_json = Column(JSON, nullable=True) # Stores the quiz results object
    seen_onboarding = Column(Integer, default=0) # 0=False, 1=True (SQLite compat)
    visited_pages_json = Column(JSON, default=list)
    completed_actions_json = Column(JSON, default=list)
    roadmap_done_json = Column(JSON, default=list)
    last_visit = Column(String, nullable=True)
    streak = Column(Integer, default=0)

    # Relationships
    nodes = relationship("BudgetNode", back_populates="owner", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="owner", cascade="all, delete-orphan")
    portfolio = relationship("PortfolioItem", back_populates="owner", cascade="all, delete-orphan")
    loans = relationship("Loan", back_populates="owner", cascade="all, delete-orphan")

class BudgetNode(Base):
    __tablename__ = "budget_nodes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    name = Column(String, index=True)
    percent = Column(Float)
    color = Column(String)
    spent = Column(Float, default=0)

    owner = relationship("User", back_populates="nodes")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    title = Column(String)
    amount = Column(Float)
    category = Column(String)
    date = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    note = Column(String, nullable=True)

    owner = relationship("User", back_populates="transactions")

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    name = Column(String)
    type = Column(String)
    invested = Column(Float)
    current_value = Column(Float)
    roi = Column(Float)
    color = Column(String)

    owner = relationship("User", back_populates="portfolio")

class Loan(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    name = Column(String)
    bank = Column(String)
    principal = Column(Float)
    remaining = Column(Float)
    interest_rate = Column(Float)
    tenure_months = Column(Integer)
    emi = Column(Float)

    owner = relationship("User", back_populates="loans")

# ─── SOCIAL INTELLIGENCE (Community Posts) ──────────────────────────────────

class CommunityPost(Base):
    __tablename__ = "community_posts"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    category = Column(String, nullable=False)  # 'success', 'question', 'tip', 'discussion'
    tags = Column(JSON, default=list)
    upvote_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow, index=True)
    updated_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    author = relationship("User", backref="community_posts")

class CommunityUpvote(Base):
    __tablename__ = "community_upvotes"
    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(Uuid, ForeignKey("community_posts.id"), nullable=False, index=True)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        # UNIQUE constraint: each user can upvote a post only once
        # This would need to be handled at DB level, but we'll validate in code
    )
