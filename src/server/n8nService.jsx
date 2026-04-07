export const n8nService = {
  chatWithMentor: async (userMessage, currentContext) => {
    // DEV: simulated responses. Replace with real endpoint: `${import.meta.env.VITE_N8N_URL}/mentor-chat`
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerMsg = (userMessage || '').toLowerCase();
        if (lowerMsg.includes('invest')) return resolve(`Given you have ${currentContext.nodes.find(n=>n.name==='Invest')?.percent}% allocated to Investments, I recommend diversifying.`);
        if (lowerMsg.includes('debt') || lowerMsg.includes('loan')) return resolve("Debt reduction is priority #1. Use the 'Snowball Method'.");
        if (lowerMsg.includes('save')) return resolve("A good rule of thumb is to save at least 20%.");
        resolve("I'm analyzing your financial nodes. How else can I help?");
      }, 900);
    });
  },
  fetchResources: async () => {
    return [
      { id: 1, title: 'Market Update: Nifty 50 reaches new high', type: 'News', content: 'The markets rallied today driven by tech sector gains...' },
      { id: 2, title: 'Rakesh Jhunjhunwala: The Big Bull Strategy', type: 'Case Study', content: 'Patience is the key to wealth.' },
      { id: 3, title: 'SGB Series IV: Applications Open', type: 'Alert', content: 'Sovereign Gold Bonds are open for subscription...' }
    ]
  }
}