# On-Chain Badging Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FHENIX LEARN PLATFORM                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌────────────┐  ┌────────────┐  ┌────────────┐
        │  Frontend  │  │  Backend   │  │ Contracts  │
        │ (React)    │  │ (Express)  │  │(Hardhat)   │
        └────────────┘  └────────────┘  └────────────┘
                │               │               │
                └───────────────┼───────────────┘
                        │
                    ┌───┴─────────────┐
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │   Database   │  │Arbitrum Sepolia
            │              │  │
            └──────────────┘  └──────────────┘
```

## Component Interactions

### 1. Frontend (BadgeAwardModal.jsx)

```
┌─────────────────────────────────────────────┐
│        BadgeAwardModal Component            │
├─────────────────────────────────────────────┤
│                                             │
│  onMount:                                   │
│  ├─ fetch /api/contract-config              │
│  └─ store badgeContractAddress              │
│                                             │
│  onMint Click:                              │
│  ├─ encode metadata to base64 URI           │
│  ├─ create mint transaction                 │
│  ├─ send via Privy wallet to contract       │
│  ├─ wait for confirmation                   │
│  ├─ post to /api/progress/:id/badge/:id     │
│  └─ show success                            │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Backend API (server.js)

```
┌──────────────────────────────────────────────┐
│          Express.js Backend                  │
├──────────────────────────────────────────────┤
│                                              │
│  GET /api/contract-config                    │
│  ├─ Load from contract-config.json           │
│  └─ Return { address, network, chainId }    │
│                                              │
│  POST /api/contract-config                   │
│  ├─ Receive from deploy script               │
│  ├─ Save to contract-config.json             │
│  └─ Return saved config                      │
│                                              │
│  POST /api/progress/:userId/badge/:badgeId   │
│  ├─ Load user progress                       │
│  ├─ Find badge by ID                         │
│  ├─ Add txHash, contractAddress, mintedAt    │
│  ├─ Save to database                         │
│  └─ Return updated badge                     │
│                                              │
│  Existing endpoints:                         │
│  ├─ GET /api/progress/:userId                │
│  ├─ POST /api/progress                       │
│  └─ GET /api/leaderboard                     │
│                                              │
└──────────────────────────────────────────────┘
```

### 3. Smart Contract (FhenixLearnBadge.sol)

```
┌──────────────────────────────────────────────┐
│   FhenixLearnBadge ERC-721 Contract          │
│   (Arbitrum Sepolia, Chain ID: 421614)       │
├──────────────────────────────────────────────┤
│                                              │
│  ► mint(string uri) public                   │
│    ├─ Increment _nextTokenId                 │
│    ├─ _safeMint(msg.sender, tokenId)         │
│    ├─ _setTokenURI(tokenId, uri)             │
│    ├─ emit BadgeMinted(...)                  │
│    └─ return tokenId                         │
│                                              │
│  ► adminMint(address to, string uri)         │
│                     public onlyOwner          │
│    ├─ Same as mint() but to specific addr    │
│    └─ Admin override capability              │
│                                              │
│  ◄ event BadgeMinted(address indexed to,     │
│                  uint256 indexed tokenId,     │
│                  string uri)                  │
│                                              │
│  Inherits:                                   │
│  ├─ ERC721URIStorage (token metadata)        │
│  └─ Ownable (access control)                 │
│                                              │
└──────────────────────────────────────────────┘
```

## Data Flow Diagram

### Deployment Phase

```
1. npm run deploy:arb-sepolia
        ↓
2. Hardhat compile & deploy FhenixLearnBadge
        ↓
3. Contract deployed → contractAddress returned
        ↓
4. Save to hardhat/deployments.json
        ↓
5. POST /api/contract-config with address
        ↓
6. Backend saves to contract-config.json
        ↓
✅ Ready for minting!
```

### Minting Phase

```
1. User completes module
        ↓
2. BadgeAwardModal opens
        ↓
3. Component: GET /api/contract-config
        ↓
4. Backend returns contractAddress
        ↓
5. Frontend stores badgeContractAddress
        ↓
6. User clicks "Mint On-Chain Badge"
        ↓
7. Encode metadata as base64 URI
        ↓
8. Create mint transaction
        ├─ to: badgeContractAddress
        ├─ data: encodeFunctionData('mint', [uri])
        └─ chainId: 421614
        ↓
9. Send via Privy sendTransaction()
        ↓
10. User confirms in wallet
        ↓
11. Transaction sent to Arbitrum Sepolia
        ↓
12. Network confirms → txHash received
        ↓
13. POST /api/progress/:userId/badge/:badgeId
        ├─ body: { txHash, contractAddress }
        ↓
14. Backend adds to user's badges array:
        ├─ txHash
        ├─ contractAddress
        ├─ mintedAt (timestamp)
        └─ Save to database
        ↓
15. Frontend shows "Awesome!" confirmation
        ↓
✅ Badge on-chain + recorded in DB!
```

## Storage Architecture

```
┌─────────────────────────────────────────┐
│         File System & Database          │
├─────────────────────────────────────────┤
│                                         │
│  Root Directory:                        │
│  ├─ .env (credentials)                  │
│  ├─ contract-config.json (addresses)    │
│  ├─ progress.json (user data)           │
│  │   OR progress.db (SQLite)            │
│  └─ DEPLOY_NOW.md, etc.                 │
│                                         │
│  hardhat/:                              │
│  └─ deployments.json (local backup)     │
│                                         │
│  contract-config.json structure:        │
│  {                                      │
│    "FhenixLearnBadge": "0x...",         │
│    "network": "arb-sepolia",            │
│    "chainId": 421614,                   │
│    "lastUpdated": "2024-01-01T..."      │
│  }                                      │
│                                         │
│  User Progress structure:               │
│  {                                      │
│    "user_id": "0x...",                  │
│    "badges": [                          │
│      {                                  │
│        "id": "module-1",                │
│        "name": "...",                   │
│        "txHash": "0x...",               │
│        "contractAddress": "0x...",      │
│        "tokenId": 0,                    │
│        "mintedAt": "2024-01-01T..."     │
│      }                                  │
│    ]                                    │
│  }                                      │
│                                         │
└─────────────────────────────────────────┘
```

## Network Architecture

```
┌──────────────────────────────────────────────┐
│         Arbitrum Sepolia Network             │
│           (Chain ID: 421614)                 │
├──────────────────────────────────────────────┤
│                                              │
│  RPC Endpoint:                               │
│  https://sepolia-rollup.arbitrum.io/rpc      │
│                                              │
│  Smart Contract:                             │
│  Address: 0x... (deployed)                   │
│  Type: ERC-721 (NFT)                         │
│  Source: FhenixLearnBadge.sol                │
│                                              │
│  Transaction Flow:                           │
│  ┌─────────────────────────────────────┐    │
│  │ 1. Receive mint() transaction       │    │
│  │ 2. Verify no errors                 │    │
│  │ 3. Execute contract logic           │    │
│  │ 4. Mint NFT (tokenId++)             │    │
│  │ 5. Store metadata URI               │    │
│  │ 6. Emit BadgeMinted event           │    │
│  │ 7. Return txHash                    │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  View on Explorer:                           │
│  https://sepolia.arbiscan.io/                │
│                                              │
└──────────────────────────────────────────────┘
```

## Environment Variables Flow

```
┌───────────────────────────────────────────┐
│            Environment Setup              │
├───────────────────────────────────────────┤
│                                           │
│  .env (Root)                              │
│  ├─ PRIVATE_KEY (for signing txs)         │
│  └─ ARBITRUM_SEPOLIA_RPC_URL (node)       │
│           ↓                               │
│  hardhat/hardhat.config.js                │
│  ├─ Loads .env with require('dotenv')    │
│  ├─ Sets up arb-sepolia network          │
│  └─ Provides account & RPC                │
│           ↓                               │
│  hardhat/scripts/deploy.js                │
│  ├─ Uses PRIVATE_KEY to sign              │
│  ├─ Uses RPC_URL to connect               │
│  ├─ Deploys contract                      │
│  └─ Saves address                         │
│                                           │
│  Frontend (vite.config.js)                │
│  ├─ Sets PROGRESS_API_ORIGIN              │
│  │   default: http://localhost:3101       │
│  └─ Passes to window.PROGRESS_API_ORIGIN  │
│           ↓                               │
│  BadgeAwardModal.jsx                      │
│  ├─ Reads from window.PROGRESS_API_ORIGIN │
│  └─ Calls backend endpoints               │
│                                           │
└───────────────────────────────────────────┘
```

## Deployment Checklist

```
Pre-Deployment:
├─ .env created with credentials ✅
├─ hardhat.config.js updated ✅
├─ deploy.js updated ✅
└─ server.js updated ✅

Backend Ready:
├─ npm run dev (Terminal #1) 
├─ http://localhost:3101 accessible ✅
└─ /api/contract-config endpoint ready ✅

Contract Deployment:
├─ npm run deploy:arb-sepolia (Terminal #2)
├─ Contract deployed to Arbitrum Sepolia ✅
├─ Address saved to contract-config.json ✅
└─ Address saved to database ✅

Frontend Integration:
├─ BadgeAwardModal fetches address ✅
├─ Mint button functional ✅
├─ Transaction confirmation works ✅
└─ Badge saved to database ✅

Post-Deployment:
├─ Contract visible on Arbiscan
├─ Can mint badges successfully
├─ Badge info in database with txHash
└─ All data persisted correctly
```

---

**This architecture ensures:**
- ✅ Contract deployed once, used everywhere (no hardcoding)
- ✅ All badge data tracked on-chain and in database
- ✅ Scalable to multiple contract versions
- ✅ Full audit trail via transaction hashes
- ✅ User-friendly minting experience
