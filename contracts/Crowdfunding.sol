// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRewardToken {
    function mint(address to, uint256 value) external returns (bool);
}

/// @title Crowdfunding - simple crowdfunding with reward token
contract Crowdfunding {
    struct Campaign {
        string title;
        uint256 goal;
        uint256 deadline;
        address owner;
        uint256 totalRaised;
        bool finalized;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    IRewardToken public immutable rewardToken;

    // 1000 tokens per 1 ETH (1e18 wei)
    uint256 public constant TOKENS_PER_ETH = 1000;

    event CampaignCreated(uint256 indexed id, address indexed owner, string title, uint256 goal, uint256 deadline);
    event ContributionMade(uint256 indexed id, address indexed contributor, uint256 amount, uint256 rewardTokens);
    event CampaignFinalized(uint256 indexed id, bool successful, uint256 totalRaised);
    event Refunded(uint256 indexed id, address indexed contributor, uint256 amount);

    constructor(address rewardTokenAddress) {
        require(rewardTokenAddress != address(0), "TOKEN_ZERO");
        rewardToken = IRewardToken(rewardTokenAddress);
    }

    function createCampaign(string calldata title, uint256 goal, uint256 durationSeconds) external returns (uint256) {
        require(bytes(title).length > 0, "TITLE_EMPTY");
        require(goal > 0, "GOAL_ZERO");
        require(durationSeconds > 0, "DURATION_ZERO");

        uint256 id = ++campaignCount;
        uint256 deadline = block.timestamp + durationSeconds;

        campaigns[id] = Campaign({
            title: title,
            goal: goal,
            deadline: deadline,
            owner: msg.sender,
            totalRaised: 0,
            finalized: false
        });

        emit CampaignCreated(id, msg.sender, title, goal, deadline);
        return id;
    }

    function contribute(uint256 id) external payable {
        Campaign storage c = campaigns[id];
        require(c.owner != address(0), "NO_CAMPAIGN");
        require(block.timestamp < c.deadline, "CAMPAIGN_ENDED");
        require(msg.value > 0, "ZERO_CONTRIB");

        c.totalRaised += msg.value;
        contributions[id][msg.sender] += msg.value;

        uint256 rewardAmount = (msg.value * TOKENS_PER_ETH) / 1 ether;

        if (rewardAmount > 0) {
            rewardToken.mint(msg.sender, rewardAmount);
        }

        emit ContributionMade(id, msg.sender, msg.value, rewardAmount);
    }

    function finalizeCampaign(uint256 id) external {
        Campaign storage c = campaigns[id];
        require(c.owner != address(0), "NO_CAMPAIGN");
        require(!c.finalized, "ALREADY_FINALIZED");
        require(block.timestamp >= c.deadline, "NOT_ENDED");

        c.finalized = true;
        bool successful = c.totalRaised >= c.goal;

        if (successful) {
            _safeTransferETH(c.owner, c.totalRaised);
        }

        emit CampaignFinalized(id, successful, c.totalRaised);
    }

    function refund(uint256 id) external {
        Campaign storage c = campaigns[id];
        require(c.owner != address(0), "NO_CAMPAIGN");
        require(c.finalized, "NOT_FINALIZED");
        require(c.totalRaised < c.goal, "CAMPAIGN_SUCCESS");

        uint256 amount = contributions[id][msg.sender];
        require(amount > 0, "NOT_CONTRIBUTOR");

        contributions[id][msg.sender] = 0;
        _safeTransferETH(msg.sender, amount);

        emit Refunded(id, msg.sender, amount);
    }

    function getCampaign(uint256 id)
        external
        view
        returns (
            string memory title,
            uint256 goal,
            uint256 deadline,
            address owner,
            uint256 totalRaised,
            bool finalized
        )
    {
        Campaign storage c = campaigns[id];
        require(c.owner != address(0), "NO_CAMPAIGN");
        return (c.title, c.goal, c.deadline, c.owner, c.totalRaised, c.finalized);
    }

    function _safeTransferETH(address to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH_TRANSFER_FAIL");
    }
}
