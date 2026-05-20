# 🚀 Deploy Now - Step by Step

Follow these exact steps to deploy your contract and start minting badges.

## Prerequisites Check ✅

- [ ] Node.js installed
- [ ] `.env` file created (✅ Done automatically)
- [ ] Arbitrum Sepolia testnet ETH in wallet (get from [faucet](https://faucet.quicknode.com/arbitrum/sepolia))
- [ ] MetaMask or wallet connected to browser

## Step 1: Start the Backend API

**Open Terminal #1** and run:
```bash
npm run dev
```

**Expected Output:**
```
Progress storage: sqlite (or json)
API server running on http://localhost:3101
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

✅ **Confirm:**
- Backend running on port 3101
- Frontend running on port 5173
- No errors in console

**Keep this terminal open!**

---

## Step 2: Verify Backend is Ready

**Open Terminal #2** (while Terminal #1 still running) and test:
```bash
curl http://localhost:3101/api/contract-config
```

**If contract not deployed yet, you'll see:**
```json
{
  "FhenixLearnBadge": null,
  "network": "arb-sepolia",
  "chainId": 421614,
  "lastUpdated": null
}
```

This is normal - we'll deploy next!

---

## Step 3: Deploy the Contract

**In Terminal #2**, run:
```bash
npm run deploy:arb-sepolia
```

**This will:**
1. Compile the contract
2. Connect to Arbitrum Sepolia using your private key
3. Deploy FhenixLearnBadge
4. Save the address to database

**Expected Output:**
```
FhenixLearnBadge deployed to: 0x...
✅ Contract address saved to backend: { FhenixLearnBadge: "0x...", ... }
Deployments saved to deployments.json
```

✅ **If you see "✅ Contract address saved"** → Deployment successful!

---

## Step 4: Verify Contract is Live

**In Terminal #2**, verify the contract address is saved:
```bash
curl http://localhost:3101/api/contract-config
```

**You should now see:**
```json
{
  "FhenixLearnBadge": "0x1234567890abcdef...",
  "network": "arb-sepolia",
  "chainId": 421614,
  "lastUpdated": "2024-01-01T12:00:00Z"
}
```

✅ **Contract address is saved!**

---

## Step 5: Test Badge Minting

### Setup Wallet

1. Open your browser to `http://localhost:5173`
2. Make sure MetaMask (or your wallet) is:
   - Connected to **Arbitrum Sepolia** (Chain ID: 421614)
   - Has some test ETH for gas
   - Connected to the website

### Add Arbitrum Sepolia to Wallet (if needed)

If your wallet doesn't have Arbitrum Sepolia:
1. Click wallet extension
2. Click "Add Network" or "Add Custom Network"
3. Fill in:
   - **Name:** Arbitrum Sepolia
   - **RPC URL:** https://sepolia-rollup.arbitrum.io/rpc
   - **Chain ID:** 421614
   - **Currency:** ETH
4. Save and switch to it

### Complete a Module and Mint

1. **Complete Module 1** (or any module)
   - Go through all lessons
   - Finish all challenges
   - Badge unlock modal should appear

2. **Click "Mint On-Chain Badge"**
   - Should show "Loading..." initially (fetching contract address)
   - Button becomes active after address loads

3. **Confirm in Your Wallet**
   - You'll see a transaction popup
   - Review gas cost
   - Click "Confirm" or "Approve"

4. **Wait for Confirmation**
   - Transaction is sent to Arbitrum Sepolia
   - Frontend waits for confirmation
   - You'll see "Awesome!" button when complete

5. **Badge is Minted! 🎉**
   - Transaction hash is saved to database
   - Badge info is stored with on-chain details
   - You can view it in your wallet

---

## Step 6: Verify Everything Worked

### Check Transaction on Block Explorer

1. Copy the transaction hash from the success message
2. Go to: https://sepolia.arbiscan.io/
3. Paste transaction hash
4. Verify it shows as successful
5. Click the "To" address to see the contract

### Check Database

**In Terminal #2**, check the user's badges:
```bash
curl http://localhost:3101/api/progress/0xyourwalletaddress
```

**You should see:**
```json
{
  "user_id": "0x...",
  "badges": [
    {
      "id": "module-1",
      "name": "Badge Name",
      "txHash": "0x...",
      "contractAddress": "0x...",
      "mintedAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

✅ **Badge is saved with transaction details!**

---

## 🎯 All Done! Summary

You have successfully:

- ✅ Deployed FhenixLearnBadge contract to Arbitrum Sepolia
- ✅ Saved contract address to database
- ✅ Minted a badge by completing a module
- ✅ Saved badge transaction details to database

### What Just Happened

1. **Contract Deployed** - FhenixLearnBadge is now live on Arbitrum Sepolia
2. **Backend Ready** - API serves contract address to frontend
3. **Frontend Updated** - Loads address dynamically (no hardcoding)
4. **Badge Minted** - ERC-721 NFT created on-chain
5. **Data Saved** - Transaction hash + details in database

### Files Now Created/Updated

```
.env                          ← Your credentials
hardhat/deployments.json      ← Deployed contract address
contract-config.json          ← Database copy of address
progress.json (or DB)         ← Your badge with transaction hash
```

---

## 🔗 Useful Links

- **View Contract:** https://sepolia.arbiscan.io/address/0x...
- **View Your Badge:** https://sepolia.arbiscan.io/tx/0x... (use txHash)
- **Arbitrum Sepolia Faucet:** https://faucet.quicknode.com/arbitrum/sepolia
- **Documentation:** See BADGING_SETUP_GUIDE.md for more details

---

## ❓ Troubleshooting

### "Contract address not loaded"
- Make sure backend is running: `npm run dev`
- Check http://localhost:3101/api/contract-config in browser
- Deploy contract: `npm run deploy:arb-sepolia`

### "Wrong network" error
- Switch wallet to Arbitrum Sepolia (Chain ID: 421614)
- Or add the network to your wallet

### "Insufficient gas"
- Get test ETH from [faucet](https://faucet.quicknode.com/arbitrum/sepolia)

### Transaction fails
- Check gas price on Arbitrum (usually cheap)
- Ensure wallet has enough balance
- Try again - network might be busy

### Can't find transaction on block explorer
- Wait 30 seconds for block confirmation
- Check you're on Arbitrum Sepolia explorer (not Ethereum)
- Make sure contract address is correct

---

## 📚 Next Steps

1. **Understand the Contract** → Read CONTRACT_DOCUMENTATION.md
2. **Production Setup** → Read BADGING_SETUP_GUIDE.md
3. **Advanced Features** → Consider signature verification, IPFS images, etc.

---

**You're now ready to scale badging to production! 🚀**

For detailed documentation, see:
- `IMPLEMENTATION_SUMMARY.md` - What was changed
- `BADGING_SETUP_GUIDE.md` - Complete setup guide
- `CONTRACT_DOCUMENTATION.md` - Technical reference
- `QUICK_START.md` - Quick reference
