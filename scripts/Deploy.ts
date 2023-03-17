import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Lottery__factory } from "../typechain-types";
dotenv.config();

const BET_PRICE = 1;
const BET_FEE = 0.2;
const TOKEN_RATIO = 1000;


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

    // Ballot__factory is picked directly from typechain-types
    const LotteryContractFactory = new Lottery__factory(signer);
    // check the constructor of the contract
    console.log("Deploying Lottery contract ...");
    const lotteryContract = await LotteryContractFactory.deploy(
        "LotteryToken",
        "LT0",
        TOKEN_RATIO,
        ethers.utils.parseEther(BET_PRICE.toFixed(18)),
        ethers.utils.parseEther(BET_FEE.toFixed(18))
      ); 
    console.log("Awaiting Ballot contract to be deployed ...");
    // waiting for the transaction to be mined
    const transactionReceipt = await lotteryContract.deployTransaction.wait();
    const contractAddress = transactionReceipt.contractAddress;
    const blockNumber = transactionReceipt.blockNumber;
    const tokenContractAddress = await lotteryContract.paymentToken();
    console.log(`Lottery contract deployed at ${contractAddress} and block number ${blockNumber} \n lottery token is on address ${tokenContractAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});