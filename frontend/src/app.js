const connectBtn = document.getElementById("connectBtn");
const walletAddress = document.getElementById("walletAddress");
const networkLabel = document.getElementById("network");
const ethBalance = document.getElementById("ethBalance");
const tokenBalance = document.getElementById("tokenBalance");
const networkWarning = document.getElementById("networkWarning");
const switchBtn = document.getElementById("switchBtn");

const createBtn = document.getElementById("createBtn");
const createStatus = document.getElementById("createStatus");
const contributeBtn = document.getElementById("contributeBtn");
const contributeStatus = document.getElementById("contributeStatus");
const finalizeBtn = document.getElementById("finalizeBtn");
const refundBtn = document.getElementById("refundBtn");
const finalizeStatus = document.getElementById("finalizeStatus");
const infoBtn = document.getElementById("infoBtn");
const campaignInfo = document.getElementById("campaignInfo");
const listBtn = document.getElementById("listBtn");
const campaignList = document.getElementById("campaignList");
const listStatus = document.getElementById("listStatus");

const titleInput = document.getElementById("title");
const goalInput = document.getElementById("goal");
const durationInput = document.getElementById("duration");
const campaignIdInput = document.getElementById("campaignId");
const amountInput = document.getElementById("amount");
const finalizeIdInput = document.getElementById("finalizeId");
const infoIdInput = document.getElementById("infoId");

const config = {
  
  rewardTokenAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  crowdfundingAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  allowedChainIds: [11155111, 31337] 
};

let crowdfundingAbi;
let rewardTokenAbi;

let provider;
let signer;
let crowdfunding;
let rewardToken;
let currentAddress = "";

async function ensureConnected() {
  if (crowdfunding && rewardToken && signer && provider) return;
  await connect();
}

async function connect() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  const address = await signer.getAddress();
  currentAddress = address;
  walletAddress.textContent = address;

  if (!crowdfundingAbi || !rewardTokenAbi) {
    [crowdfundingAbi, rewardTokenAbi] = await Promise.all([
      fetch("../src/abi/Crowdfunding.json").then((r) => r.json()),
      fetch("../src/abi/RewardToken.json").then((r) => r.json())
    ]);
  }

  crowdfunding = new ethers.Contract(config.crowdfundingAddress, crowdfundingAbi, signer);
  rewardToken = new ethers.Contract(config.rewardTokenAddress, rewardTokenAbi, signer);

  await refreshNetwork();
  await refreshBalances();
}

async function refreshNetwork() {
  const network = await provider.getNetwork();
  networkLabel.textContent = `${network.name} (${network.chainId})`;
  const ok = config.allowedChainIds.includes(Number(network.chainId));
  networkWarning.classList.toggle("hidden", ok);
}

async function refreshBalances() {
  const address = await signer.getAddress();
  const bal = await provider.getBalance(address);
  ethBalance.textContent = `${ethers.formatEther(bal)} ETH`;

  if (rewardToken && config.rewardTokenAddress) {
    const dec = await rewardToken.decimals();
    const tBal = await rewardToken.balanceOf(address);
    tokenBalance.textContent = `${ethers.formatUnits(tBal, dec)} CRWD`;
  }
}

function setStatus(el, msg) {
  el.textContent = msg;
}

function requireValue(value, label) {
  if (!value || String(value).trim() === "") {
    throw new Error(`${label} is required`);
  }
}

async function createCampaign() {
  try {
    await ensureConnected();
    setStatus(createStatus, "Sending transaction...");
    const title = titleInput.value.trim();
    const goalEth = goalInput.value.trim();
    const duration = durationInput.value.trim();

    requireValue(title, "Title");
    requireValue(goalEth, "Goal");
    requireValue(duration, "Duration");

    const goal = ethers.parseEther(goalEth);
    const tx = await crowdfunding.createCampaign(title, goal, BigInt(duration));
    await tx.wait();

    setStatus(createStatus, "Campaign created");
  } catch (e) {
    setStatus(createStatus, e.message || "Failed");
  }
}

async function contribute() {
  try {
    await ensureConnected();
    setStatus(contributeStatus, "Sending transaction...");
    const id = campaignIdInput.value.trim();
    const amountEth = amountInput.value.trim();

    requireValue(id, "Campaign ID");
    requireValue(amountEth, "Amount");

    const tx = await crowdfunding.contribute(BigInt(id), { value: ethers.parseEther(amountEth) });
    await tx.wait();

    setStatus(contributeStatus, "Contribution sent");
    await refreshBalances();
  } catch (e) {
    setStatus(contributeStatus, e.message || "Failed");
  }
}

async function finalize() {
  try {
    await ensureConnected();
    setStatus(finalizeStatus, "Finalizing...");
    const id = finalizeIdInput.value.trim();
    requireValue(id, "Campaign ID");
    const tx = await crowdfunding.finalizeCampaign(BigInt(id));
    await tx.wait();
    setStatus(finalizeStatus, "Finalized");
  } catch (e) {
    setStatus(finalizeStatus, e.message || "Failed");
  }
}

async function refund() {
  try {
    await ensureConnected();
    setStatus(finalizeStatus, "Refunding...");
    const id = finalizeIdInput.value.trim();
    requireValue(id, "Campaign ID");
    const tx = await crowdfunding.refund(BigInt(id));
    await tx.wait();
    setStatus(finalizeStatus, "Refunded");
  } catch (e) {
    setStatus(finalizeStatus, e.message || "Failed");
  }
}

async function loadInfo() {
  try {
    await ensureConnected();
    const id = infoIdInput.value.trim();
    requireValue(id, "Campaign ID");
    const info = await crowdfunding.getCampaign(BigInt(id));
    campaignInfo.textContent = JSON.stringify(
      {
        title: info[0],
        goal: ethers.formatEther(info[1]),
        deadline: new Date(Number(info[2]) * 1000).toISOString(),
        owner: info[3],
        totalRaised: ethers.formatEther(info[4]),
        finalized: info[5]
      },
      null,
      2
    );
  } catch (e) {
    campaignInfo.textContent = e.message || "Failed";
  }
}

async function loadCampaigns() {
  try {
    await ensureConnected();
    campaignList.innerHTML = "";
    listStatus.textContent = "Loading...";

    const count = await crowdfunding.campaignCount();
    const total = Number(count);
    if (total === 0) {
      campaignList.textContent = "No campaigns yet.";
      listStatus.textContent = "";
      return;
    }

    const items = [];
    for (let i = 1; i <= total; i += 1) {
      const info = await crowdfunding.getCampaign(BigInt(i));
      items.push({
        id: i,
        title: info[0],
        goal: ethers.formatEther(info[1]),
        deadline: new Date(Number(info[2]) * 1000).toISOString(),
        owner: info[3],
        totalRaised: ethers.formatEther(info[4]),
        finalized: info[5]
      });
    }

    campaignList.innerHTML = items
      .map(
        (c) => `
        <div class="card">
          <div class="card-title">#${c.id} — ${c.title}</div>
          <div class="card-row">Goal: ${c.goal} ETH</div>
          <div class="card-row">Raised: ${c.totalRaised} ETH</div>
          <div class="card-row">Deadline: ${c.deadline}</div>
          <div class="card-row">Owner: ${c.owner}</div>
          <div class="card-row">Finalized: ${c.finalized}</div>
        </div>
      `
      )
      .join("");
    listStatus.textContent = `Loaded ${items.length} campaigns.`;
  } catch (e) {
    campaignList.textContent = e.message || "Failed";
    listStatus.textContent = "";
  }
}

async function switchToLocalhost() {
  if (!window.ethereum) return;
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x7A69", 
          chainName: "Localhost 8545",
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["http://127.0.0.1:8545"],
          blockExplorerUrls: []
        }
      ]
    });
  } catch (e) {
    
  }
}

connectBtn.addEventListener("click", connect);
createBtn.addEventListener("click", createCampaign);
contributeBtn.addEventListener("click", contribute);
finalizeBtn.addEventListener("click", finalize);
refundBtn.addEventListener("click", refund);
infoBtn.addEventListener("click", loadInfo);
listBtn.addEventListener("click", loadCampaigns);
switchBtn.addEventListener("click", switchToLocalhost);

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => connect());
  window.ethereum.on("chainChanged", () => connect());
}
