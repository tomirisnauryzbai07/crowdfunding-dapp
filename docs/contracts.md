# Smart Contracts

## RewardToken (ERC-20)
**Purpose**: internal reward token minted when users contribute.

**State**
- `name`, `symbol`, `decimals`
- `totalSupply`
- `owner`, `minter`
- `balanceOf`, `allowance`

**Functions**
- `setMinter(address)` — owner sets crowdfunding contract as minter.
- `mint(address to, uint256 value)` — only minter can mint.
- `transfer`, `approve`, `transferFrom` — standard ERC-20.

**Events**
- `Transfer`, `Approval`, `MinterUpdated`

## Crowdfunding
**Purpose**: manage campaigns, accept contributions, finalize, and refund.

**State**
- `campaignCount`
- `campaigns[id]` with:
  - `title`, `goal`, `deadline`, `owner`, `totalRaised`, `finalized`
- `contributions[id][address]` — per-user tracking
- `rewardToken` (ERC-20)

**Constants**
- `TOKENS_PER_ETH = 1000`

**Functions**
- `createCampaign(title, goal, durationSeconds)`
- `contribute(id)` (payable) + mint rewards
- `finalizeCampaign(id)` — after deadline
- `refund(id)` — only after failure + finalization
- `getCampaign(id)` — view details

**Events**
- `CampaignCreated`, `ContributionMade`, `CampaignFinalized`, `Refunded`
