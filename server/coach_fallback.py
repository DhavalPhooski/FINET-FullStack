def get_fallback_response(message, profile=None):
    msg = message.lower()
    
    # Financial context from profile
    name = "Explorer"
    if profile and profile.get('tierInfo'):
        name = profile['tierInfo'].get('label', 'Explorer')
    
    # Basic Rule-based engine
    if "sip" in msg or "invest" in msg:
        return f"Starting a SIP is the best move for a **{name}**. Even ₹500/month in an Index Fund compounds beautifully over time. Need help picking a fund?"
    
    if "crypto" in msg:
        return "Crypto is high-risk, high-reward. For your current profile, keep it under 5% of your total portfolio. Focus on Bitcoin or Ethereum if you're just starting."
    
    if "tax" in msg or "save" in msg:
        return "To save tax, look into ELSS mutual funds or PPF. Since you're building your foundation, an ELSS gives you both tax benefits and wealth growth."
    
    if "name" in msg:
        return f"You are **{name}** on the Finet protocol. Your mission is to build lasting wealth."
        
    if "hello" in msg or "hey" in msg or "hi" in msg:
        return f"Welcome back, **{name}**! I'm your Finet Coach. How can I help you grow your money today?"

    # Contextual Roadmap response
    return "I'm currently in power-saving mode (AI API limit reached), but I can still help with basics! Ask me about SIPs, Crypto, or how to save tax."
