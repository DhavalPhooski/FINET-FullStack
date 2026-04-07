from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True) # For Google Login
    phone = Column(String, unique=True, index=True, nullable=True) # For Phone Login
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

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
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    percent = Column(Float)
    color = Column(String)
    spent = Column(Float, default=0)

    owner = relationship("User", back_populates="nodes")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    amount = Column(Float)
    category = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    note = Column(String, nullable=True)

    owner = relationship("User", back_populates="transactions")

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
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
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    bank = Column(String)
    principal = Column(Float)
    remaining = Column(Float)
    interest_rate = Column(Float)
    tenure_months = Column(Integer)
    emi = Column(Float)

    owner = relationship("User", back_populates="loans")
