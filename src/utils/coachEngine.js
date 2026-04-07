/**
 * Finet Cognitive Coach Engine
 * Rule-based AI that builds a user financial profile from quiz answers
 * and generates personalized roadmaps + contextual chat responses.
 */

// ─── PROFILE TIERS ──────────────────────────────────────────────────────────
const TIERS = {
    TEEN: { id: 'TEEN', label: 'Explorer', emoji: '🚀' },
    BEGINNER: { id: 'BEGINNER', label: 'Starter', emoji: '🌱' },
    INTERMEDIATE: { id: 'INTERMEDIATE', label: 'Builder', emoji: '⚡' },
    ADVANCED: { id: 'ADVANCED', label: 'Strategist', emoji: '🎯' },
}

// ─── ROADMAP LIBRARY ─────────────────────────────────────────────────────────
const ROADMAPS = {
    TEEN: [
        { id: 1, phase: 'Foundation', title: 'Build your Emergency Buffer', desc: 'Keep ₹2,000–₹3,000 accessible at all times for unexpected expenses. Use a savings bank account — do not touch it.', action: 'Open a zero-balance savings account (Paytm Bank / IDFC First)', done: false, icon: '🛡' },
        { id: 2, phase: 'Foundation', title: 'Start small — ₹500 SIP', desc: 'A SIP (Systematic Investment Plan) lets you invest small amounts every month into a mutual fund. ₹500/month in a Nifty 50 Index Fund is a perfect start.', action: 'Complete KYC on Groww or Zerodha and start a ₹500 SIP', done: false, icon: '📈' },
        { id: 3, phase: 'Growth', title: 'Understand what you own', desc: 'Read what "Nifty 50" actually means. It\'s a collection of India\'s 50 biggest companies. When you invest in it, you own a tiny piece of all of them.', action: 'Search "What is Nifty 50" on YouTube — watch one 5-min video', done: false, icon: '📚' },
        { id: 4, phase: 'Growth', title: 'Track every rupee for 30 days', desc: 'Use the FINET budget tracker to log what you spend. No judgment — just awareness. You\'ll be shocked where your money disappears.', action: 'Open Flow Nodes → Create your first budget category', done: false, icon: '📊' },
        { id: 5, phase: 'Mastery', title: 'Level up: increase your SIP', desc: 'Once you\'re comfortable, increase your SIP by ₹100–200 each month. This is called "SIP top-up" and is very powerful over time.', action: 'Set a calendar reminder to increase SIP by ₹200 next month', done: false, icon: '⬆️' },
    ],
    BEGINNER: [
        { id: 1, phase: 'Foundation', title: 'Emergency Fund — 3 Months Expenses', desc: 'Before any investment, you need a safety net. Calculate 3x your monthly expenses and park it in a Liquid Mutual Fund (not a savings account).', action: 'Open a liquid fund on Coin (Zerodha) or Groww', done: false, icon: '🛡' },
        { id: 2, phase: 'Foundation', title: 'Pay Yourself First — Automate Savings', desc: 'Set up an auto-debit for investments on your salary day. This prevents lifestyle inflation from consuming your raises.', action: 'Set auto-debit SIP date to 3 days after salary credit date', done: false, icon: '🔄' },
        { id: 3, phase: 'Growth', title: 'Start a Nifty 50 Index Fund SIP', desc: 'Simple, low-cost, well-diversified. Aim for 20% of take-home salary. E.g., ₹45K salary → ₹9,000/month into index fund SIP.', action: 'Start SIP on Mirae Asset Large Cap or UTI Nifty 50 Index Fund', done: false, icon: '📈' },
        { id: 4, phase: 'Growth', title: 'Protect yourself: Get Term Insurance', desc: 'If anyone depends on your income, get a ₹50L–1Cr term plan. At 25, it costs ~₹400/month. This is not optional.', action: 'Get quotes on PolicyBazaar for ₹1Cr term plan', done: false, icon: '🛡' },
        { id: 5, phase: 'Growth', title: 'Tax Savings — Use 80C smartly', desc: 'ELSS Mutual Funds give you tax deduction up to ₹1.5L under Section 80C + potential 12-15% returns. Better than PPF for most young earners.', action: 'Start an ELSS SIP on Axis Long Term Equity Fund', done: false, icon: '💰' },
        { id: 6, phase: 'Mastery', title: 'Review and rebalance every 6 months', desc: 'Markets shift. Review your portfolio twice a year. You don\'t need to be an expert — just make sure you\'re still on track.', action: 'Set a 6-month calendar reminder for portfolio review', done: false, icon: '🔍' },
    ],
    INTERMEDIATE: [
        { id: 1, phase: 'Optimise', title: 'Portfolio X-Ray — Is it really diversified?', desc: 'Most people hold 5 funds that all invest in the same top-10 stocks. Run a portfolio overlap analysis on ValueResearch Online.', action: 'Upload portfolio to valueresearchonline.com → Fund Overlap tool', done: false, icon: '🔬' },
        { id: 2, phase: 'Optimise', title: 'Unlock NPS — Extra ₹50K deduction', desc: 'NPS Tier 1 gives ₹50,000 additional deduction under 80CCD(1B) beyond the 80C limit. For 30% bracket = ₹15,600 saved annually.', action: 'Open NPS account on eNPS portal or Zerodha Coin', done: false, icon: '💰' },
        { id: 3, phase: 'Optimise', title: 'Build a direct equity satellite (5–10%)', desc: 'If you\'re ready for stock picking, cap it at 5-10% of your portfolio. Choose 8-12 quality businesses across 3-4 sectors.', action: 'Research: PE ratio < 30, ROE > 15%, debt-to-equity < 1', done: false, icon: '📊' },
        { id: 4, phase: 'Scale', title: 'Real Estate Exposure via REITs', desc: 'REITs (Embassy, Mindspace) give property-like income without the illiquidity. Min investment ₹15K. Dividend yield ~7%.', action: 'Add REIT position on Zerodha Kite (NSE: EMBASSYPP)', done: false, icon: '🏢' },
        { id: 5, phase: 'Scale', title: 'International Diversification', desc: 'INDmoney or Vested Finance let you buy US stocks from India. Cap at 10%. Reduces India-specific risk.', action: 'Open INDmoney account and start a ₹2,000/month US fund SIP', done: false, icon: '🌍' },
    ],
    ADVANCED: [
        { id: 1, phase: 'Optimise', title: 'Asset Allocation — True Balance', desc: 'A proper asset allocation includes: 60% equity, 20% debt, 10% gold/commodities, 10% alternatives. Rebalance annually.', action: 'Calculate current allocation across all assets in FINET', done: false, icon: '⚖️' },
        { id: 2, phase: 'Optimise', title: 'Tax-Loss Harvesting', desc: 'Sell underperforming equity holdings to realize capital losses — these offset your STCG/LTCG. Can save ₹5–30K depending on portfolio size.', action: 'Review LTCG exemption status (₹1L/yr tax-free), harvest accordingly', done: false, icon: '📉' },
        { id: 3, phase: 'Scale', title: 'Options for Portfolio Hedging', desc: 'Use Nifty puts to hedge against severe corrections. Don\'t speculate — hedge. 1-2% of portfolio in OTM puts protects against 15-20% drawdowns.', action: 'Learn options basics on Zerodha Varsity, then paper-trade', done: false, icon: '🛡' },
        { id: 4, phase: 'Legacy', title: 'Estate Planning Checklist', desc: 'Write a will. Update all account nominees. Set up a trust if needed. Most people ignore this completely.', action: 'Draft a will using WillJini or consult a CA/lawyer', done: false, icon: '📜' },
    ],
}

// ─── PROFILE BUILDER ─────────────────────────────────────────────────────────
export function buildProfile(answers) {
    const { age, capital, goal, experience, income } = answers

    // Determine tier
    let tier = 'BEGINNER'
    if (age < 21 || experience === 'never') {
        tier = 'TEEN'
    } else if (experience === 'some' || experience === 'sip') {
        tier = 'INTERMEDIATE'
    } else if (experience === 'advanced') {
        tier = 'ADVANCED'
    }

    // Capital context
    const capitalNum = Number(capital) || 0
    let capitalContext = ''
    if (capitalNum < 5000) capitalContext = `With ₹${capitalNum.toLocaleString('en-IN')}, starting small is perfectly fine — every rupee compounds.`
    else if (capitalNum < 25000) capitalContext = `₹${capitalNum.toLocaleString('en-IN')} is a solid start. We'll put it to work strategically.`
    else capitalContext = `₹${capitalNum.toLocaleString('en-IN')} gives you real deployment options. Let's build a smart plan.`

    // Goal sentence
    const goalMessages = {
        grow: 'grow your money intelligently',
        save: 'build a strong savings foundation',
        invest: 'start your investment journey',
        debt: 'eliminate debt while building wealth',
        retire: 'build a long-term retirement corpus',
    }
    const goalText = goalMessages[goal] || 'build financial security'

    return {
        tier,
        tierInfo: TIERS[tier],
        roadmap: ROADMAPS[tier] || ROADMAPS.BEGINNER,
        capitalContext,
        goalText,
        answers,
        summary: `${TIERS[tier].emoji} You're a ${TIERS[tier].label}. Your mission: ${goalText}.`,
        nextStep: ROADMAPS[tier]?.[0]?.title || 'Start your financial journey',
    }
}

// ─── CHAT ENGINE ─────────────────────────────────────────────────────────────
const FINANCE_PATTERNS = [
    {
        keywords: ['sip', 'systematic investment', 'monthly invest'],
        response: (p) => `A **SIP (Systematic Investment Plan)** lets you invest a fixed amount every month, automatically. Think of it like a gym subscription — except this one makes you richer. For your profile, ${p.capitalContext} A ₹${Math.max(500, Math.round((Number(p.answers.capital) || 2000) * 0.1))} monthly SIP in a Nifty 50 Index Fund is an excellent start.`,
    },
    {
        keywords: ['mutual fund', 'mf', 'fund'],
        response: (p) => `A **Mutual Fund** is a pool of money from thousands of investors, managed by a professional. Instead of buying one stock, you own a tiny piece of hundreds of companies. For a ${p.tierInfo.label} like you, **Index Funds** (which simply track the Nifty 50) are the best starting point — low cost, well-diversified, no stock-picking stress.`,
    },
    {
        keywords: ['sensex', 'nifty', 'index', 'stock market', 'market'],
        response: (p) => `The **Sensex** is India's most famous market index — it tracks the 30 largest companies on BSE. The **Nifty 50** tracks the 50 largest on NSE. When you hear "market is up 1%", they mean these indices moved up. You don't invest directly in Sensex — you invest through **Index Mutual Funds** that mirror it. Check the Markets section for live data!`,
    },
    {
        keywords: ['start', 'begin', 'how', 'first step', 'where'],
        response: (p) => `Your first step is clear: **${p.nextStep}**. ${p.capitalContext} Don't overthink it — the best investment you can make today is *starting*. Markets reward patience, not perfection. Check your personalized Roadmap above — each card is one concrete action.`,
    },
    {
        keywords: ['risk', 'safe', 'lose', 'scared', 'worried'],
        response: (p) => `Every investment carries some risk — but the *biggest* risk is doing nothing and letting inflation eat your money. ₹1 lakh today will buy what ₹60,000 buys in 10 years if you don't invest. The key is **time in the market, not timing the market**. Start with Index Funds — they've never permanently gone to zero in 30+ years of history.`,
    },
    {
        keywords: ['tax', '80c', 'elss', 'save tax'],
        response: (p) => p.tier === 'TEEN' || p.tier === 'BEGINNER'
            ? `You don't need to worry about tax planning yet. Focus on building savings first. Once your income exceeds ₹7 lakh/year, come back to this — then **ELSS Mutual Funds** will save you money on taxes *and* grow your wealth simultaneously.`
            : `**Section 80C** allows you to deduct ₹1.5 lakh from taxable income. Best use: **ELSS Mutual Funds** — they double as tax savings + equity growth (12-15% historical CAGR). Beyond 80C, **NPS under 80CCD(1B)** gives additional ₹50K deduction — that's ₹15,600 saved if you're in the 30% bracket.`,
    },
    {
        keywords: ['emergency fund', 'emergency', 'savings'],
        response: () => `An **Emergency Fund** is 3–6 months of your monthly expenses, kept liquid (accessible within 24 hours). This is non-negotiable before any investment. If you lose your job or face a medical emergency, this is what stops you from selling your investments at a loss. Keep it in a high-yield savings account or a Liquid Mutual Fund.`,
    },
    {
        keywords: ['crypto', 'bitcoin', 'btc', 'ethereum'],
        response: (p) => p.tier === 'TEEN'
            ? `Crypto is extremely high risk and very volatile. As someone just starting out, *please* don't touch crypto until you have 6+ months emergency fund, a stable SIP running, and you fully understand the basics. Build your foundation first.`
            : `If you want crypto exposure, **cap it at 5% of your portfolio maximum**. Treat it as high-risk speculation, not investment. In India, crypto gains are taxed at 30% flat + 1% TDS. Given that, make sure your other 95% is working properly first.`,
    },
    {
        keywords: ['insurance', 'term', 'life insurance'],
        response: () => `**Term Insurance** is pure life cover — no investment, just protection. If you have dependents (family), this is mandatory. At age 25, a ₹1Cr cover costs ~₹400-500/month. At 35, it jumps to ₹1,200+/month. Buy young, buy cheap. Avoid ULIPs (insurance + investment products) — they do both poorly.`,
    },
]

const FALLBACK_RESPONSES = [
    (p) => `That's a great question for a ${p.tierInfo.label} like you. The key principle here is to start simple, stay consistent, and avoid complex strategies until you have a solid foundation. Check your roadmap for the next actionable step: **${p.nextStep}**.`,
    (p) => `Let me translate that to your situation: ${p.capitalContext} The financial world loves jargon — but every concept, at its core, is simple. Keep asking questions like this — curiosity is the most underrated financial skill.`,
    (p) => `Honestly? At your stage (${p.tierInfo.label}), focus on just 3 things: **Emergency Fund → SIP → Tax efficiency**. In that order. Everything else is noise until you've nailed these three.`,
]

export function getCoachResponse(message, profile) {
    if (!profile) return 'Please complete the profile setup first so I can give you personalized advice!'

    const lower = message.toLowerCase()

    for (const pattern of FINANCE_PATTERNS) {
        if (pattern.keywords.some(k => lower.includes(k))) {
            return pattern.response(profile)
        }
    }

    // fallback
    const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
    return fallback(profile)
}
