# Deployment

## Local (used for defense)
1. Start local node:
   - `cd /Users/test/crowdfunding-dapp-3`
   - `npx hardhat node`
2. In a second terminal, deploy:
   - `cd /Users/test/crowdfunding-dapp-3`
   - `npm run deploy:local`
3. Copy addresses from output:
   - `RewardToken: 0x...`
   - `Crowdfunding: 0x...`
4. Paste into:
   - `/Users/test/crowdfunding-dapp-3/frontend/src/app.js`
5. Open UI:
   - `/Users/test/crowdfunding-dapp-3/frontend/public/index.html`
