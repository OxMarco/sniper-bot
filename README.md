# Sniper Bot
*A very basic implementation of a sniper bot for Arbitrum.*

Send several transactions batched transactions to a set of contracts from the same address, using multiple Alchemy API keys to distribute the load and avoid backend throttling.
Useful to frontrun possible hacks or to buy tokens from a contract before anyone else.
> Supports both ETH transfers and smart contract interactions.

Signing and sending is done in three steps:
1. prepare and sign all transactions
2. send all transactions
3. wait for all transactions to be confirmed
