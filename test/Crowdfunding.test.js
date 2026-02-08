const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crowdfunding", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();

    const RewardToken = await ethers.getContractFactory("RewardToken");
    const token = await RewardToken.deploy("CrowdReward", "CRWD");
    await token.waitForDeployment();

    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    const crowdfunding = await Crowdfunding.deploy(await token.getAddress());
    await crowdfunding.waitForDeployment();

    await token.setMinter(await crowdfunding.getAddress());

    return { owner, alice, bob, token, crowdfunding };
  }

  it("creates campaign and accepts contributions", async function () {
    const { alice, token, crowdfunding } = await deployFixture();

    const goal = ethers.parseEther("1");
    const duration = 3600; // 1 hour

    const tx = await crowdfunding.connect(alice).createCampaign("Test", goal, duration);
    const receipt = await tx.wait();
    const event = receipt.logs.find((l) => l.fragment && l.fragment.name === "CampaignCreated");
    const id = event.args.id;

    await expect(
      crowdfunding.connect(alice).contribute(id, { value: ethers.parseEther("0.5") })
    ).to.emit(crowdfunding, "ContributionMade");

    const info = await crowdfunding.getCampaign(id);
    expect(info.totalRaised).to.equal(ethers.parseEther("0.5"));

    const balance = await token.balanceOf(alice.address);
    // 0.5 ETH * 1000 = 500 tokens
    expect(balance).to.equal(ethers.parseUnits("500", 18));
  });

  it("finalizes successful campaign and transfers funds", async function () {
    const { owner, alice, crowdfunding } = await deployFixture();

    const goal = ethers.parseEther("1");
    const duration = 1; // 1 second

    const tx = await crowdfunding.createCampaign("Goal", goal, duration);
    const receipt = await tx.wait();
    const event = receipt.logs.find((l) => l.fragment && l.fragment.name === "CampaignCreated");
    const id = event.args.id;

    await crowdfunding.connect(alice).contribute(id, { value: ethers.parseEther("1") });

    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    const before = await ethers.provider.getBalance(owner.address);
    const finalizeTx = await crowdfunding.finalizeCampaign(id);
    const finalizeReceipt = await finalizeTx.wait();
    const gasCost = finalizeReceipt.gasUsed * finalizeReceipt.gasPrice;
    const after = await ethers.provider.getBalance(owner.address);

    expect(after + gasCost).to.equal(before + ethers.parseEther("1"));
  });

  it("allows refunds if goal not reached", async function () {
    const { alice, crowdfunding } = await deployFixture();

    const goal = ethers.parseEther("2");
    const duration = 1;

    const tx = await crowdfunding.createCampaign("Refund", goal, duration);
    const receipt = await tx.wait();
    const event = receipt.logs.find((l) => l.fragment && l.fragment.name === "CampaignCreated");
    const id = event.args.id;

    await crowdfunding.connect(alice).contribute(id, { value: ethers.parseEther("0.5") });

    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    await crowdfunding.finalizeCampaign(id);

    const before = await ethers.provider.getBalance(alice.address);
    const refundTx = await crowdfunding.connect(alice).refund(id);
    const refundReceipt = await refundTx.wait();
    const gasCost = refundReceipt.gasUsed * refundReceipt.gasPrice;
    const after = await ethers.provider.getBalance(alice.address);

    expect(after + gasCost).to.equal(before + ethers.parseEther("0.5"));
  });
});

  it("rejects invalid campaign params", async function () {
    const { alice, crowdfunding } = await deployFixture();

    await expect(crowdfunding.connect(alice).createCampaign("", 1, 1))
      .to.be.revertedWith("TITLE_EMPTY");
    await expect(crowdfunding.connect(alice).createCampaign("Ok", 0, 1))
      .to.be.revertedWith("GOAL_ZERO");
    await expect(crowdfunding.connect(alice).createCampaign("Ok", 1, 0))
      .to.be.revertedWith("DURATION_ZERO");
  });

  it("rejects zero contribution and late contribution", async function () {
    const { crowdfunding } = await deployFixture();

    const goal = ethers.parseEther("1");
    const duration = 1;

    const tx = await crowdfunding.createCampaign("Late", goal, duration);
    const receipt = await tx.wait();
    const event = receipt.logs.find((l) => l.fragment && l.fragment.name === "CampaignCreated");
    const id = event.args.id;

    await expect(crowdfunding.contribute(id, { value: 0 }))
      .to.be.revertedWith("ZERO_CONTRIB");

    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    await expect(crowdfunding.contribute(id, { value: ethers.parseEther("0.1") }))
      .to.be.revertedWith("CAMPAIGN_ENDED");
  });

  it("rejects finalize before deadline and refund on success", async function () {
    const { alice, crowdfunding } = await deployFixture();

    const goal = ethers.parseEther("1");
    const duration = 100;

    const tx = await crowdfunding.createCampaign("Early", goal, duration);
    const receipt = await tx.wait();
    const event = receipt.logs.find((l) => l.fragment && l.fragment.name === "CampaignCreated");
    const id = event.args.id;

    await expect(crowdfunding.finalizeCampaign(id))
      .to.be.revertedWith("NOT_ENDED");

    await crowdfunding.connect(alice).contribute(id, { value: ethers.parseEther("1") });

    await ethers.provider.send("evm_increaseTime", [200]);
    await ethers.provider.send("evm_mine");

    await crowdfunding.finalizeCampaign(id);

    await expect(crowdfunding.connect(alice).refund(id))
      .to.be.revertedWith("CAMPAIGN_SUCCESS");
  });
