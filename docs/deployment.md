# Deployment

## Local (recommended for demo)
1. Start local node:
   - `cd /Users/test/tomi_archive/crowdfunding-dapp`
   - `npx hardhat node`
2. In a second terminal, deploy:
   - `cd /Users/test/tomi_archive/crowdfunding-dapp`
   - `npm run deploy:local`
3. Copy addresses from output:
   - `RewardToken: 0x...`
   - `Crowdfunding: 0x...`
4. Paste into:
   - `/Users/test/tomi_archive/crowdfunding-dapp/frontend/src/app.js`
5. Open UI:
   - `/Users/test/tomi_archive/crowdfunding-dapp/frontend/public/index.html`

## Sepolia (for submission)
1. Create `.env` from example:
   - `cp /Users/test/tomi_archive/crowdfunding-dapp/.env.example /Users/test/tomi_archive/crowdfunding-dapp/.env`
2. Fill in:
   - `RPC_URL`
   - `PRIVATE_KEY` (test account only)
3. Get test ETH for the account.
4. Deploy:
   - `cd /Users/test/tomi_archive/crowdfunding-dapp`
   - `npm run deploy`
5. Paste contract addresses into:
   - `/Users/test/tomi_archive/crowdfunding-dapp/frontend/src/app.js`
