const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardToken", function () {
  it("owner can set minter and mint works", async function () {
    const [owner, minter, user] = await ethers.getSigners();

    const RewardToken = await ethers.getContractFactory("RewardToken");
    const token = await RewardToken.deploy("CrowdReward", "CRWD");
    await token.waitForDeployment();

    await expect(token.setMinter(minter.address))
      .to.emit(token, "MinterUpdated")
      .withArgs(minter.address);

    await expect(token.connect(minter).mint(user.address, 1000))
      .to.emit(token, "Transfer")
      .withArgs(ethers.ZeroAddress, user.address, 1000);

    expect(await token.balanceOf(user.address)).to.equal(1000);
  });

  it("non-minter cannot mint", async function () {
    const [owner, other] = await ethers.getSigners();

    const RewardToken = await ethers.getContractFactory("RewardToken");
    const token = await RewardToken.deploy("CrowdReward", "CRWD");
    await token.waitForDeployment();

    await expect(token.connect(other).mint(other.address, 1))
      .to.be.revertedWith("NOT_MINTER");
  });
});
