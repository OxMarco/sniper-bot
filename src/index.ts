import { Alchemy, Network, Wallet, Utils } from "alchemy-sdk";

const settings = {
    apiKey: '',
    network: Network.ARB_MAINNET,
};
const alchemy = new Alchemy(settings);

async function transferEth(flag: boolean = false) {
    const maxPriorityFeePerGas = Utils.parseUnits('0', 'gwei');
    const gasPrice = Utils.parseUnits('0.13', 'gwei');

    const wallet = new Wallet('');
    const nonce = await alchemy.core.getTransactionCount(wallet.address, "latest");

    let transferTxData = {
        to: "0xabcdBC2EcB47642Ee8cf52fD7B88Fa42FBb69f98",
        value: Utils.parseEther("0.002"),
        gasLimit: "1000000",
        gasPrice,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas,
        nonce,
        type: 2,
        chainId: 42161,
    };
    let rawTransaction = await wallet.signTransaction(transferTxData);

    let signedTx: any;
    if(flag) {
        signedTx = await alchemy.transact.sendPrivateTransaction(
        rawTransaction,
        (await alchemy.core.getBlockNumber()) + 1
        );
    } else {
        signedTx = await alchemy.core.sendTransaction(rawTransaction);
    }
    await signedTx.wait();

    return signedTx;
}

async function callContract(flag: boolean = false) {
    const maxPriorityFeePerGas = Utils.parseUnits('0.12', 'gwei');
    const gasPrice = Utils.parseUnits('0.21', 'gwei');

    const wallet = new Wallet('');
    const nonce = await alchemy.core.getTransactionCount(wallet.address, "latest");

    let callContractTxData = {
        to: "0xA2536a8af58Ec400b40Fe8eCcB93f863B84FD1A3",
        data: "0xf2fde38b00000000000000000000000053c3b817f800b8aa95c34e5e2de8e5fee7a8e4e8",
        value: 0,
        gasLimit: "6000000",
        gasPrice,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas,
        nonce,
        type: 2,
        chainId: 42161,
    };
    let rawTransaction = await wallet.signTransaction(callContractTxData);

    let signedTx: any;
    if(flag) {
        signedTx = await alchemy.transact.sendPrivateTransaction(
        rawTransaction,
        (await alchemy.core.getBlockNumber()) + 1);
    } else {
        signedTx = await alchemy.core.sendTransaction(rawTransaction);
    }
    await signedTx.wait();

    return signedTx;
}

async function main() {
    await callContract();

    const signedTx1 = await transferEth();
    alchemy.core.getTransactionReceipt(signedTx1.hash).then(async (tx) => {
        if (!tx) {
            console.log("Pending or Unknown Transaction");
        } else if (tx.status === 1) {
            console.log("Transaction was successful! Sending second transaction");
            await callContract();
            console.log("Sent second transaction");
        } else {
            console.log("Transaction failed!");
        }
    });
}

main();
