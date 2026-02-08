const fs = require("fs");
const path = require("path");

const artifactsBase = path.join(__dirname, "..", "artifacts", "contracts");
const outBase = path.join(__dirname, "..", "frontend", "src", "abi");

const targets = [
  {
    name: "Crowdfunding",
    src: path.join(artifactsBase, "Crowdfunding.sol", "Crowdfunding.json"),
    dst: path.join(outBase, "Crowdfunding.json")
  },
  {
    name: "RewardToken",
    src: path.join(artifactsBase, "RewardToken.sol", "RewardToken.json"),
    dst: path.join(outBase, "RewardToken.json")
  }
];

function main() {
  if (!fs.existsSync(outBase)) {
    fs.mkdirSync(outBase, { recursive: true });
  }

  for (const t of targets) {
    if (!fs.existsSync(t.src)) {
      throw new Error(`Missing artifact: ${t.src}. Run 'npx hardhat compile' first.`);
    }
    const data = JSON.parse(fs.readFileSync(t.src, "utf8"));
    if (!data.abi) throw new Error(`ABI not found in ${t.src}`);
    fs.writeFileSync(t.dst, JSON.stringify(data.abi, null, 2));
    console.log(`Wrote ${t.name} ABI -> ${t.dst}`);
  }
}

main();
