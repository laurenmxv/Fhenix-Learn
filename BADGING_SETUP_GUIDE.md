# Fhenix Learn - On-Chain Badging Setup Guide

## Overview

This guide walks you through deploying the FhenixLearnBadge contract to Arbitrum Sepolia and integrating it with the Fhenix Learn platform.

## Prerequisites

- Node.js and npm installed
- Hardhat project configured (already set up)
- `.env` file with credentials (already created)
- Backend API running

## Step-by-Step Setup

### 1. Environment Configuration ✅

The `.env` file has been created in the root directory with your credentials:
```
PRIVATE_KEY=f525c6adbf1b2c4a098e60747a808ff7b8258abfd3dd5797dce8e18afdacd4c1
ARBITRUM_SEPOLIA_RPC_URL=https://api.web3auth.io/infura-service/v1/0x66eee/...
```

### 2. Start the Backend Server

Open a terminal and run:
```bash
npm run dev
```

This starts:
- Backend API server on `http://localhost:3101`
- Frontend dev server with Vite

The backend will:
- Load existing contract addresses from `contract-config.json`
- Serve contract configuration to frontend
- Save badge minting information to the database

### 3. Deploy the Contract to Arbitrum Sepolia

In another terminal, from the root directory, run:
```bash
npm run deploy:arb-sepolia
```

**What happens during deployment:**
1. Compiles the FhenixLearnBadge contract
2. Connects to Arbitrum Sepolia using your PRIVATE_KEY
3. Deploys the contract
4. Saves the contract address to:
   - `hardhat/deployments.json` (local reference)
   - Backend database via `/api/contract-config` endpoint
5. Displays the deployed contract address

**Expected output:**
```
FhenixLearnBadge deployed to: 0x...
✅ Contract address saved to backend: { ... }
```

### 4. Verify Deployment

Check that the contract address is accessible:
```bash
curl http://localhost:3101/api/contract-config
```

Expected response:
```json
{
  "FhenixLearnBadge": "0x...",
  "network": "arb-sepolia",
  "chainId": 421614,
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

## Using the Badging System

### User Flow

1. **Complete a Module**
   - User completes all lessons in a module
   - Badge unlock modal appears automatically

2. **Mint Badge**
   - User clicks "Mint On-Chain Badge" button
   - Modal shows loading state while fetching contract address
   - User confirms transaction in their wallet
   - Transaction is sent to Arbitrum Sepolia

3. **Badge Saved**
   - After confirmation, badge info is saved to database
   - Includes: transaction hash, contract address, and metadata
   - User sees "Awesome!" button with share option

### Smart Contract Functions

The FhenixLearnBadge contract (ERC-721) has two main functions:

**Public Mint:**
```solidity
function mint(string memory uri) public returns (uint256)
```
- Any user can call this
- Automatically assigns tokenId
- Sets metadata URI
- Emits BadgeMinted event

**Admin Mint:**
```solidity
function adminMint(address to, string memory uri) public onlyOwner returns (uint256)
```
- Only contract owner (deployer) can call
- Can mint to any address
- Used for manual badge awards if needed

## Database Schema

### Badge Entry
```json
{
  "id": "module-1",
  "name": "Module 1 Badge",
  "description": "Completed Module 1",
  "txHash": "0x...",
  "contractAddress": "0x...",
  "tokenId": 0,
  "mintedAt": "2024-01-01T12:00:00.000Z"
}
```

### User Progress
```json
{
  "user_id": "0x...",
  "display_name": "User Name",
  "xp": 1000,
  "completed_modules": ["module-1", "module-2"],
  "completed_lessons": ["lesson-1-1", "lesson-1-2"],
  "badges": [
    {
      "id": "module-1",
      "txHash": "0x...",
      "contractAddress": "0x...",
      "mintedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## API Endpoints

### Get Contract Configuration
```
GET /api/contract-config
```
Returns the deployed contract address and network info

### Save Contract Configuration (Post-Deployment)
```
POST /api/contract-config
{
  "FhenixLearnBadge": "0x...",
  "network": "arb-sepolia",
  "chainId": 421614
}
```

### Update Badge with On-Chain Info
```
POST /api/progress/:userId/badge/:badgeId
{
  "tokenId": 0,
  "txHash": "0x...",
  "contractAddress": "0x..."
}
```

## Troubleshooting

### "Contract address not loaded" Error
- Ensure backend API is running on port 3101
- Check that `/api/contract-config` returns a valid address
- Deploy the contract: `npm run deploy:arb-sepolia`

### "Wrong network. Please switch to Arbitrum Sepolia"
- User's wallet is on a different network
- Add Arbitrum Sepolia to wallet:
  - Network: Arbitrum Sepolia
  - RPC URL: https://sepolia-rollup.arbitrum.io/rpc
  - Chain ID: 421614
  - Currency: ETH

### Transaction Rejected
- Ensure user has ETH for gas fees on Arbitrum Sepolia
- Check that Privy wallet is properly configured
- Verify wallet is connected to correct account

### Backend Can't Save Badge
- Check that API server is running
- Verify database is accessible
- Check network connectivity

## Monitoring

### Check Deployed Contract
View on Arbitrum Sepolia Explorer:
```
https://sepolia.arbiscan.io/address/0x...
```

### View User Badges
```bash
curl http://localhost:3101/api/progress/:userId
```

### View Leaderboard
```bash
curl http://localhost:3101/api/leaderboard?limit=50
```

## Security Notes

- Private key is stored in `.env` and should NOT be committed to version control
- Contract is ERC-721 compliant but allows public minting
- Consider making mint function onlyOwner in production
- Consider adding signature verification for production
- Implement rate limiting on badge endpoints
- Store private key in secure environment variable management system

## Next Steps

1. ✅ Deploy contract to Arbitrum Sepolia
2. ✅ Verify contract address is saved in database
3. ✅ Test badge minting flow
4. ✅ Monitor transaction confirmations
5. Consider: Add badge metadata to IPFS for permanence
6. Consider: Implement signature verification for minting
7. Consider: Add admin dashboard to view all minted badges

## Support

For issues or questions, check:
- Hardhat documentation: https://hardhat.org/
- Arbitrum Sepolia faucet: https://faucet.quicknode.com/arbitrum/sepolia
- OpenZeppelin contracts: https://docs.openzeppelin.com/contracts/
