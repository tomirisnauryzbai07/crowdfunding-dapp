# Frontend Integration

## Step-by-step (Localhost demo)
1. Ensure local node is running:
   - `npx hardhat node`
2. Deploy contracts locally:
   - `npm run deploy:local`
3. Put contract addresses into:
   - `/Users/test/tomi_archive/crowdfunding-dapp/frontend/src/app.js`
4. Add network in MetaMask:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
5. Import Hardhat account:
   - Private Key: `0xac0974...ff80`
6. Open the UI:
   - `/Users/test/tomi_archive/crowdfunding-dapp/frontend/public/index.html`
7. Click **Connect MetaMask**.
8. Create a campaign:
   - Title: `Test`
   - Goal: `1` ETHa
   - Duration: `120` seconds
9. Contribute:
   - Campaign ID: `1`
   - Amount: `0.2` ETH
10. After deadline:
    - Click **Finalize**
    - If goal not reached, click **Refund**

## Contract calls
- `createCampaign(title, goal, durationSeconds)`
- `contribute(id)` (payable)
- `finalizeCampaign(id)`
- `refund(id)`
- `getCampaign(id)`

## UI Features
- Wallet connect + address display
- Network detection + quick switch to Localhost
- ETH + reward token balance
- Create, contribute, finalize, refund
- Campaign list (load all)
