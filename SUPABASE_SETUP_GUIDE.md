# 🗄️ Supabase PostgreSQL Setup Guide

Your code is now configured to work with Supabase PostgreSQL. Here's what to do next:

## ✅ What We've Done

1. ✓ Models updated to use UUID for user IDs (Supabase native)
2. ✓ Database connection configured for Supabase PostgreSQL
3. ✓ All endpoints filter data by `user_id` (code-level isolation, no RLS needed)
4. ✓ GET `/api/user/nodes` endpoint added
5. ✓ Migrations disabled (Supabase manages schema)

## 🔑 Final Step: Get Your Supabase DB Password

You need to complete the `.env` file with your database password.

### Step 1: Get Your Database Password

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. You'll see:
   ```
   Connection String: postgresql://postgres:[YOUR_PASSWORD]@db.rznbqthumdlmnkrfytxi.supabase.co:5432/postgres
   ```
3. Copy the password (between `postgres:` and `@`)

### Step 2: Update `.env`

Open `.env` and update:

```env
VITE_SUPABASE_URL=https://rznbqthumdlmnkrfytxi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_oiERsP0ZcX0UPmDYTGmEGg_nhrOEesr
SUPABASE_URL=https://rznbqthumdlmnkrfytxi.supabase.co
SUPABASE_JWT_SECRET=a15zJ2aJ1H1XKIT0THaPN4XSSDCLc1xLbEGDNLV308079B9JWw5GLMzp+WhJWGoB5qxS0+x1zztxMxBIilKgfA==
SUPABASE_DB_PASSWORD=your_actual_password_here
```

**⚠️ IMPORTANT:** 
- Replace `your_actual_password_here` with your actual database password
- **Never commit `.env` to git** — it contains secrets
- For Vercel: Add `SUPABASE_DB_PASSWORD` to Environment Variables in Vercel Project Settings

## 🌐 How It Works Now

### User Isolation (No RLS)

Every endpoint filters by `current_user.id`:

```python
# GET /api/user/data
nodes = db.query(BudgetNode).filter(BudgetNode.user_id == current_user.id).all()
txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
```

✅ **User A** logs in → sees only their nodes, transactions, portfolio  
✅ **User B** logs in → sees only their nodes, transactions, portfolio  
✅ Complete data isolation via code (not database-level RLS)

### Data Flow

```
1. User logs in with email/password → Supabase JWT assigned
2. JWT sent in Authorization header → Backend validates JWT
3. JWT contains `sub` (user UUID) → Used to extract user_id
4. All queries filtered by user_id → Only personal data returned
```

## 🚀 Start Using It

### Local Development

```bash
# Backend
cd FINET
$env:PYTHONPATH = "."; python -m uvicorn server.main:app --reload

# Frontend
npm run dev
```

### Test Flow

1. Open http://localhost:5173
2. Register with email/password
3. After login, go to `/graph` (Flow Nodes)
4. Create a budget node → Saved to YOUR user's budget_nodes table
5. Register another user → See only THEIR nodes

## 📊 FlowNodes & Allocations

**FlowNodes** = Budget categories (50/30/20 split)  
**Allocations** = How much of each category you've spent

```
Monthly Income: ₹50,000
├─ Needs (50%): ₹25,000 budget
│  └─ Transactions: Rent (₹15,000), Food (₹8,000) → 92% consumed
├─ Wants (30%): ₹15,000 budget
│  └─ Transactions: Coffee (₹500), Shopping (₹2,000) → 17% consumed
└─ Invest (20%): ₹10,000 budget
   └─ Transactions: SIP (₹10,000) → 100% consumed (AT LIMIT)
```

All data is per-user in the database!

## 🛠️ Troubleshooting

| Error | Fix |
|-------|-----|
| `SUPABASE_DB_PASSWORD is required` | Add real password to `.env` `SUPABASE_DB_PASSWORD=` |
| `Connection refused` | Check password + internet connection |
| `Invalid token: missing user ID` | Token doesn't have `sub` claim (check Supabase JWT) |
| `operator does not exist: uuid = integer` | UUID type mismatch — ensure models.py uses `Uuid` |

## ✨ You're Done!

Your FINET app now:
- ✅ Stores FlowNodes per user in Supabase PostgreSQL
- ✅ Stores Allocations/Transactions per user
- ✅ Isolates data by user_id in code
- ✅ Scales to unlimited users
- ✅ Ready to deploy to Vercel

Start creating budget nodes! 🎯
