const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy("CrowdReward", "CRWD");
  await rewardToken.waitForDeployment();

  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(await rewardToken.getAddress());
  await crowdfunding.waitForDeployment();

  // Set minter to crowdfunding contract
  const tx = await rewardToken.setMinter(await crowdfunding.getAddress());
  await tx.wait();

  console.log("RewardToken:", await rewardToken.getAddress());
  console.log("Crowdfunding:", await crowdfunding.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
