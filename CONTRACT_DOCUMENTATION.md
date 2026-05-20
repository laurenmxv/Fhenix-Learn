# FhenixLearnBadge Contract Documentation

## Contract Overview

**Contract Name:** FhenixLearnBadge
**Type:** ERC-721 NFT (Non-Fungible Token)
**Network:** Arbitrum Sepolia (Chain ID: 421614)
**Standard:** OpenZeppelin ERC721URIStorage + Ownable

## Contract Features

### 1. ERC-721 Compliance
- Fully compliant with OpenZeppelin's ERC-721 standard
- Each badge is a unique NFT with a tokenId
- Supports metadata URIs for badge information

### 2. Public Minting
```solidity
function mint(string memory uri) public returns (uint256)
```
- **Caller:** Any wallet address
- **Input:** Metadata URI (typically base64-encoded JSON)
- **Output:** Returns the minted tokenId
- **Actions:**
  - Increments internal `_nextTokenId`
  - Safely mints NFT to caller's address
  - Sets token metadata URI
  - Emits `BadgeMinted` event
- **Gas Cost:** ~70-100k gas depending on URI length

**Example:**
```javascript
const metadataUri = 'data:application/json;base64,eyJuYW1lIjoiTW9kdWxlIEJhZGdlIiwgImltYWdlIjoiaXBmczovL2Jhzm5hZC4uLiJ9';
const tokenId = await badgeContract.mint(metadataUri);
```

### 3. Admin Minting
```solidity
function adminMint(address to, string memory uri) public onlyOwner returns (uint256)
```
- **Caller:** Contract owner only
- **Input:** Recipient address and metadata URI
- **Output:** Returns the minted tokenId
- **Use Cases:**
  - Retroactively award badges
  - Award special badges
  - Handle failed transactions
  - Admin panel functionality

**Example:**
```javascript
await badgeContract.adminMint('0x...', metadataUri);
```

### 4. Events
```solidity
event BadgeMinted(address indexed to, uint256 indexed tokenId, string uri)
```
- **Emitted:** Every time a badge is minted (public or admin)
- **Indexed:** Address (`to`) and tokenId for easy filtering
- **Use:** Listen for minting events in off-chain indexers

## Metadata Format

Badges use JSON metadata stored as base64-encoded data URIs:

```json
{
  "name": "Module 1 Badge",
  "description": "You've mastered the fundamentals of FHE",
  "image": "ipfs://bafkreiet6x2hw6c57q36o6srfpqedlcyr6m43d7sokq4f2f45v6z3qg4ma",
  "attributes": [
    {
      "trait_type": "Badge ID",
      "value": "module-1"
    },
    {
      "trait_type": "Module",
      "value": "1"
    }
  ]
}
```

### Encoding Example
```javascript
const metadata = {
  name: "Module 1 Badge",
  description: "...",
  image: "ipfs://...",
  attributes: [...]
};
const jsonString = JSON.stringify(metadata);
const base64 = btoa(jsonString);
const uri = `data:application/json;base64,${base64}`;
```

## Gas Costs

| Operation | Gas (approx) | Cost (at 0.1 GWEI) |
|-----------|------|----------|
| Mint | 70,000-100,000 | 0.007-0.01 ETH |
| Transfer | 50,000-60,000 | 0.005-0.006 ETH |
| Approve | 45,000-50,000 | 0.0045-0.005 ETH |

## Contract Addresses

### Arbitrum Sepolia
```
FhenixLearnBadge: 0x... (Deployed via deploy.js)
```

Get current address:
```bash
curl http://localhost:3101/api/contract-config
```

## Integration Points

### 1. Frontend (BadgeAwardModal.jsx)
- Fetches contract address from backend
- Encodes metadata as base64 URI
- Calls `mint()` function via Privy wallet
- Saves transaction hash to database

### 2. Backend (server.js)
- Stores contract address in `contract-config.json`
- Provides address to frontend via `/api/contract-config`
- Records minted badges with txHash and address

### 3. Database
Stores badge records:
```json
{
  "id": "module-1",
  "name": "Module 1 Badge",
  "txHash": "0x...",
  "contractAddress": "0x...",
  "tokenId": 0,
  "mintedAt": "2024-01-01T12:00:00Z"
}
```

## Verification

### Check Deployment
```bash
# View on block explorer
https://sepolia.arbiscan.io/address/0x...

# Call read function
curl -X POST https://sepolia-rollup.arbitrum.io/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [{
      "to": "0x...",
      "data": "0x..."
    }, "latest"],
    "id": 1
  }'
```

### Monitor Minting
Listen for BadgeMinted events:
```javascript
const filter = badgeContract.filters.BadgeMinted();
badgeContract.on(filter, (to, tokenId, uri) => {
  console.log(`Badge minted to ${to}, token ${tokenId}`);
});
```

## Security Considerations

### Current Implementation
⚠️ **Public minting** - Anyone can mint badges

### Recommendations for Production

1. **Restrict Minting to Backend**
```solidity
mapping(address => bool) private authorized;

function mint(string memory uri) public returns (uint256) {
    require(authorized[msg.sender], "Not authorized");
    // ... rest of mint logic
}
```

2. **Add Signature Verification**
```solidity
function mintWithSignature(string memory uri, bytes memory signature) public {
    bytes32 hash = keccak256(abi.encodePacked(msg.sender, uri));
    address signer = recoverSigner(hash, signature);
    require(signer == owner(), "Invalid signature");
    // ... rest of mint logic
}
```

3. **Rate Limiting**
```solidity
mapping(address => uint256) private lastMintTime;

function mint(string memory uri) public returns (uint256) {
    require(block.timestamp >= lastMintTime[msg.sender] + 1 days, "Wait 24h");
    lastMintTime[msg.sender] = block.timestamp;
    // ... rest of mint logic
}
```

## Metadata Best Practices

1. **Use IPFS for Images**
   - Upload badge images to IPFS
   - Use pinning service for persistence
   - Reference with `ipfs://` protocol

2. **Standard Attributes**
   - Badge ID
   - Module number
   - Completion date
   - Rarity (common/rare/special)

3. **Versioning**
   - Include version in metadata
   - Handle upgrades in indexers
   - Maintain backward compatibility

## Contract Upgrade Path

To upgrade the contract:

1. Deploy new contract
2. Update `/api/contract-config` endpoint
3. Frontend automatically loads new address
4. Old badges remain on old contract

For permanent badge migration, use a factory pattern or proxy.

## Testing

### Local Testing (Hardhat)
```bash
npx hardhat test
```

### Testnet Testing (Arbitrum Sepolia)
```bash
npm run deploy:arb-sepolia
```

### Mainnet Deployment (When Ready)
```bash
npx hardhat run scripts/deploy.js --network arbitrum-mainnet
```

## References

- **Solidity Docs:** https://docs.soliditylang.org/
- **OpenZeppelin Contracts:** https://docs.openzeppelin.com/contracts/5.x/
- **ERC-721 Standard:** https://eips.ethereum.org/EIPS/eip-721
- **Arbitrum Docs:** https://docs.arbitrum.io/
