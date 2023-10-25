import { Alchemy, Network, Wallet, Utils } from "alchemy-sdk";

export async function callContract(apiKey: string[], privKey: string[], calldata: any[], recipient: string[], value: string[], flag: boolean = false) {
    if(recipient.length != calldata.length) throw new Error("recipient and calldata must be the same length");

    const maxPriorityFeePerGas = Utils.parseUnits('0.1', 'gwei');
    const gasPrice = Utils.parseUnits('0.1', 'gwei');
    const gasLimit = Utils.parseUnits('0.1', 'gwei');

    let wallets = [];
    for(let i = 0; i < recipient.length; i++) {
        const settings = {
            apiKey: apiKey[i],
            network: Network.ARB_MAINNET,
        };
        const alchemy = new Alchemy(settings);
        const wallet = new Wallet(privKey[i], alchemy);
        const nonce = await alchemy.core.getTransactionCount(wallet.address, "latest");
        const walletData = {
            provider: alchemy,
            wallet,
            nonce,
        };
        wallets.push(walletData);
    }

    let rawTransactions = [];
    for(let i = 0; i < recipient.length; i++) {
        let callContractTxData = {
            to: recipient[i],
            data: calldata[i] ? calldata[i] : "0x",
            value: Utils.parseEther(value[i]),
            gasLimit,
            gasPrice,
            maxFeePerGas: gasPrice,
            maxPriorityFeePerGas,
            nonce: wallets[i].nonce + i,
            type: 2,
            chainId: 42161,
        };
        rawTransactions.push(await wallets[i].wallet.signTransaction(callContractTxData));
    }

    let signedTx: any;
    for(let i = 0; i < recipient.length; i++) {
        if(flag) {
            signedTx = await wallets[i].provider.transact.sendPrivateTransaction(
            rawTransactions[i],
            (await wallets[i].provider.core.getBlockNumber()) + 1);
        } else {
            signedTx.push(await wallets[i].provider.core.sendTransaction(rawTransactions[i]))
        }
    }

    for(let i = 0; i < recipient.length; i++) {
        await signedTx[i].wait();
    }
}
