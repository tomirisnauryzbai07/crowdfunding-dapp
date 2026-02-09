# Astana IT University
## Faculty: Software Engineering
### Course: Blockchain Technologies 1

**Final Examination Project Report**

**Topic:** Simple Crowdfunding DApp

**Instructor:** Sayakulova Zarina

**Students (Group):**
- Nauryzbay Tomiris (SE-2436)
- Aisulu Azimkhan (SE-2437)
- Medina Klyumova (SE-2437)

**Year:** 2nd year

**Submission Date:** February 9, 2026

---

## 1. Purpose of the Project
The goal of this project is to demonstrate practical skills in blockchain development:
- designing and implementing smart contracts in Solidity;
- building a client-side DApp in JavaScript;
- integrating MetaMask for secure signing and wallet access;
- using Ethereum test networks (Sepolia or Localhost);
- applying decentralized architecture patterns.

## 2. Project Overview
We built a decentralized crowdfunding application that runs on Ethereum test networks only. Users can:
- create crowdfunding campaigns with a goal and deadline;
- contribute test ETH to active campaigns;
- receive reward tokens proportional to their contributions;
- finalize campaigns after the deadline;
- request refunds if the campaign failed.

No mainnet ETH or real cryptocurrency is used.

## 3. System Requirements Mapping
**Smart contracts must provide:**
- Campaign creation (title, goal, deadline)
- Contributions with accurate tracking
- Finalization after deadline
- Reward token issuance

**Tokenization requirements:**
- Custom ERC-20 token
- Minted automatically on contribution
- Educational-only, no real value

**Frontend requirements:**
- MetaMask connection
- Show wallet address and balances
- Verify network
- Create campaigns, contribute, finalize, refund

All requirements are implemented in this project.

## 4. Architecture
**Frontend (JS/HTML/CSS)** → **MetaMask** → **Local Ethereum Network (Localhost 8545)** → **Smart Contracts**

Contracts:
- `RewardToken.sol` (ERC-20)
- `Crowdfunding.sol` (campaign logic)

The frontend communicates directly with the blockchain through MetaMask using `ethers.js`.

## 5. Smart Contract Logic
### RewardToken (ERC-20)
- Standard ERC-20 storage: balances, allowances, total supply
- `mint()` is restricted to the crowdfunding contract
- Token rewards: **1000 tokens per 1 ETH**

### Crowdfunding
- Campaigns are stored in a mapping with:
  - `title`, `goal`, `deadline`, `owner`, `totalRaised`, `finalized`
- Contributions are stored per user
- `finalizeCampaign`:
  - If `totalRaised >= goal`, funds go to the campaign owner
  - Otherwise, refunds are enabled

## 6. Frontend-to-Blockchain Interaction
The frontend uses `ethers.js` with MetaMask:
- `eth_requestAccounts` to connect wallet
- `createCampaign` to create new campaigns
- `contribute` (payable) to send test ETH
- `finalizeCampaign` for campaign closure
- `refund` for failed campaigns
- `getCampaign` for campaign data

The UI also lists all campaigns and shows wallet balances.

## 7. Deployment & Execution
### Local Demo (Used for defense)
1. `npx hardhat node`
2. `npm run deploy:local`
3. Paste contract addresses into `frontend/src/app.js`
4. Open `frontend/public/index.html`
5. Add network `Localhost 8545` in MetaMask (Chain ID 31337)

## 8. Test ETH
Test ETH is provided locally by the Hardhat node (10,000 ETH per account).
Mainnet ETH is not used and is prohibited by course rules.

## 9. Design Decisions
- Reward ratio: 1000 tokens per 1 ETH
- Refunds only after finalization and only if goal not met
- Localhost used for fast demo; Sepolia for final submission

## 10. How to Use (Demo Steps)
1. Connect MetaMask
2. Create a campaign (title, goal, duration)
3. Contribute test ETH
4. Wait until deadline
5. Finalize campaign
6. If failed, request refund

## 11. Repository Structure
- `contracts/` — Solidity contracts
- `scripts/` — deploy and seed scripts
- `frontend/` — DApp UI
- `docs/` — documentation
- `test/` — automated tests

## 12. Conclusion
The project demonstrates a complete DApp workflow with smart contracts, MetaMask integration, and testnet deployment. It satisfies all requirements of the Blockchain Technologies 1 final examination project.
