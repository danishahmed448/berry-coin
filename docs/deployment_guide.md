# $BERRY Deployment & Audit Guide

## 1. Prerequisites
- Install Rust and Solana CLI.
- Install Anchor AVM (`avm install latest`).
- Create a new wallet: `solana-keygen new -o deploy-wallet.json` (Do not use your personal wallet).

## 2. Deploying the Program
1. Update `Anchor.toml` with your cluster (mainnet-beta) and wallet path.
2. Run `anchor build`.
3. Run `anchor deploy`.
4. **Copy the Program ID** returned by the deployment and update it in `lib.rs` (`declare_id!`) and `Anchor.toml`.
5. Run `anchor build` and `anchor deploy` again to verify.

## 3. Initializing the Token
Use the `initialize_token` instruction provided in the Rust code.
- **Fee Basis Points:** Set to `100` (1%).
- **Max Fee:** Set a reasonable cap (e.g., 5000 tokens) or `u64::MAX` for percentage only.

## 4. Post-Launch Security (Binance Requirements)
To get listed on Tier 1 exchanges, you must prove the token is safe.

### Step A: Renounce Ownership (Mint Authority)
This stops you from minting new tokens.
```bash
spl-token authorize <MINT_ADDRESS> mint --disable
```

### Step B: Renounce Freeze Authority
This stops you from freezing user wallets (critical for trust).
```bash
spl-token authorize <MINT_ADDRESS> freeze --disable
```

### Step C: Manage Fee Authority
You can choose to keep the Fee Authority (to lower tax later) OR renounce it to make the 1% tax permanent.
To renounce:
```bash
spl-token-2022 set-transfer-fee <MINT_ADDRESS> 100 --authority <YOUR_WALLET> --disable
```

## 5. The "Harvest & Burn" Strategy
The smart contract includes a `harvest_and_burn` function.
- **Strategy:** Create a cron job or a simple button on the website (The "Offer to the Sea" button) that calls this function on the Liquidity Pool address.
- **Effect:** Every time users trade on Raydium/Jupiter, fees accumulate in the LP token account. Calling this function extracts those fees and burns them. 
- **Marketing:** "Every click burns $BERRY."

## 6. Audit Verification
When submitting to CertiK:
1. Provide the Git commit hash of the deployed code.
2. Highlight that you use standard `Token-2022` extensions.
3. Show proof of renounced authorities (on Solscan).
