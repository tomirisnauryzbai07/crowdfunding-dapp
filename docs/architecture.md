# Architecture Overview

## High-level
Frontend (JS) → MetaMask → Local Ethereum Network (Localhost 8545) → Smart Contracts

## Components
- **Frontend (HTML/JS/CSS)**: UI to create campaigns, contribute, finalize, refund, and view balances.
- **MetaMask**: wallet provider and transaction signer.
- **Ethereum Local Network**: Localhost 8545 for demonstration.
- **Smart Contracts**:
  - `RewardToken.sol` (ERC-20): mints rewards on contribution.
  - `Crowdfunding.sol`: campaign lifecycle + ETH handling.

## Data Flow
1. User clicks **Connect MetaMask** → accounts requested.
2. Frontend reads network + balances via provider.
3. User creates a campaign → frontend sends `createCampaign`.
4. Contribution → frontend sends `contribute` (payable).
5. Contract mints reward tokens to contributor.
6. After deadline → `finalizeCampaign`:
   - If goal reached: funds to owner.
   - If not: refunds available via `refund`.

## Security & Constraints
- Only local test ETH used.
- Token has no real value and is for education only.
- Refunds only if campaign failed and finalized.
