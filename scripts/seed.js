const hre = require("hardhat");

async function main() {
  const [owner, alice] = await hre.ethers.getSigners();

  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy("CrowdReward", "CRWD");
  await rewardToken.waitForDeployment();

  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(await rewardToken.getAddress());
  await crowdfunding.waitForDeployment();

  await rewardToken.setMinter(await crowdfunding.getAddress());

  const goal = hre.ethers.parseEther("1");
  const duration = 600; 
  await crowdfunding.createCampaign("Demo Campaign", goal, duration);

  await crowdfunding.connect(alice).contribute(1, { value: hre.ethers.parseEther("0.2") });

  console.log("RewardToken:", await rewardToken.getAddress());
  console.log("Crowdfunding:", await crowdfunding.getAddress());
  console.log("Seeded campaign #1 with 0.2 ETH contribution");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
