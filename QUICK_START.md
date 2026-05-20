# Quick Start - Deploy & Test Badging

## 🚀 Deploy Contract in 3 Commands

### Terminal 1: Start Backend & Frontend
```bash
npm run dev
```
✅ Starts API on `http://localhost:3101` and frontend on `http://localhost:5173`

### Terminal 2: Deploy Contract
```bash
npm run deploy:arb-sepolia
```
✅ Deploys FhenixLearnBadge to Arbitrum Sepolia and saves address to DB

### Verify Deployment
```bash
curl http://localhost:3101/api/contract-config
```
✅ Should return contract address and network info

## 📋 What Gets Saved Where

| Item | Location | Purpose |
|------|----------|---------|
| `.env` | Root directory | Private key & RPC URL |
| `deployments.json` | `hardhat/` | Local reference of deployed address |
| `contract-config.json` | Root directory | Database storage of contract address |
| Badge data | `progress.json` or SQLite DB | User badges with txHash & address |

## 🔄 User Flow

1. **Complete Module** → Badge modal appears
2. **Click Mint** → Contract address loaded from `/api/contract-config`
3. **Confirm in Wallet** → Transaction sent to Arbitrum Sepolia
4. **Badge Saved** → txHash + contractAddress stored in database

## ✅ Verification Checklist

- [ ] `.env` file created with credentials
- [ ] Backend running on port 3101
- [ ] `/api/contract-config` returns valid address
- [ ] Contract deployed to Arbitrum Sepolia
- [ ] Can mint badge and see transaction hash
- [ ] Badge info appears in database

## 🔗 Useful Links

- **Arbitrum Sepolia RPC**: https://sepolia-rollup.arbitrum.io/rpc
- **Chain ID**: 421614
- **Block Explorer**: https://sepolia.arbiscan.io/
- **Faucet**: https://faucet.quicknode.com/arbitrum/sepolia

## 🛠 Troubleshooting

| Issue | Solution |
|-------|----------|
| Contract address not loading | Ensure backend is running: `npm run dev` |
| "Wrong network" error | Switch wallet to Arbitrum Sepolia (Chain ID: 421614) |
| Gas error | Get ETH from faucet |
| Backend won't start | Check port 3101 is not in use |

## 📁 Key Files Modified

```
.env                                   ← Credentials (NEW)
server.js                              ← Contract config endpoints (UPDATED)
hardhat/scripts/deploy.js              ← Saves to DB (UPDATED)
src/components/learn/BadgeAwardModal.jsx ← Loads address & saves badge (UPDATED)
BADGING_SETUP_GUIDE.md                ← Full documentation (NEW)
```

## 🎯 Environment Variables

```bash
# .env (Root)
PRIVATE_KEY=f525c6adbf1b2c4a098e60747a808ff7b8258abfd3dd5797dce8e18afdacd4c1
ARBITRUM_SEPOLIA_RPC_URL=https://api.web3auth.io/infura-service/v1/0x66eee/BD2crYz1qDkkFRM8H3_vkknmMfj3B2OWzreuky7kbQ6cBLvsO033haerjjZki5bdBZv-jPsPVk7G3BdSpld6D68

# API_URL (Used by deploy script & frontend)
# Default: http://localhost:3101
# Override: API_URL=http://your-server:3101
```

## 📊 Database Queries

### Check user badges
```bash
curl http://localhost:3101/api/progress/0x{useraddress}
```

### Top leaderboard
```bash
curl http://localhost:3101/api/leaderboard?limit=10
```

### Check deployed contract
```bash
curl http://localhost:3101/api/contract-config
```

---

**Ready to deploy?** Run these 3 commands:
```bash
npm run dev                  # Terminal 1
npm run deploy:arb-sepolia   # Terminal 2
```

Then complete a module and click "Mint On-Chain Badge"! 🎉
