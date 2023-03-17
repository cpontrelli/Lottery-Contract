import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Lottery__factory } from "../typechain-types";
import { argv } from "process";
dotenv.config();

const CONTRACT_ADDRESS = '0x21cdb3376F8a76EEa8bcB4E210Ca0c8e0916244f';


async function main() {
    // setup for wallet access of deployer
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) {
        throw new Error("No private key found");
    }

    // setup for provider access
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyApiKey || alchemyApiKey.length <= 0) {
        throw new Error("No Alchemy API key found");
    }

    const provider = new ethers.providers.AlchemyProvider("goerli", alchemyApiKey);
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`The account ${signer.address} has a balance of ${balance} wei`);

    const duration = argv[2];
    // Ballot__factory is picked directly from typechain-types
    const LotteryContractFactory = new Lottery__factory(signer);
    const lotteryContract = await LotteryContractFactory.attach(CONTRACT_ADDRESS);
    const currentBlock = await provider.getBlock("latest");
    const tx = await lotteryContract.openBets(currentBlock.timestamp + Number(duration));
    const receipt = await tx.wait();
    console.log(`Bets opened (${receipt.transactionHash})`);

    const closingTime = await lotteryContract.betsClosingTime();
    const closingTimeDate = new Date(closingTime.toNumber() * 1000);
    console.log(
        `lottery should close at ${closingTimeDate.toLocaleDateString()} : ${closingTimeDate.toLocaleTimeString()}\n`
      );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});