#!/usr/bin/env node
// Verify that the REFERENCE_CONTRACT string baked into src/lib/contract-deployer.js
// still matches hardhat/contracts/HiddenValue.sol byte-for-byte (after light normalization).
// Run as part of CI / build to prevent silent drift between the lesson reference and
// the actual on-chain source.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SOL_PATH = path.join(ROOT, 'hardhat/contracts/HiddenValue.sol');
const DEPLOYER_PATH = path.join(ROOT, 'src/lib/contract-deployer.js');

const sol = fs.readFileSync(SOL_PATH, 'utf8');
const deployer = fs.readFileSync(DEPLOYER_PATH, 'utf8');

const match = deployer.match(/const\s+REFERENCE_CONTRACT\s*=\s*`([\s\S]*?)`;/);
if (!match) {
    console.error('FAIL: could not find REFERENCE_CONTRACT in contract-deployer.js');
    process.exit(1);
}
const reference = match[1];

const normalize = (s) =>
    s
        .replace(/\/\/\/[^\n]*\n/g, '\n')       // strip NatSpec triple-slash lines
        .replace(/\/\/[^\n]*\n/g, '\n')          // strip // comments
        .replace(/\s+/g, ' ')                    // collapse whitespace
        .trim();

if (normalize(sol) !== normalize(reference)) {
    console.error('FAIL: REFERENCE_CONTRACT in contract-deployer.js has drifted from HiddenValue.sol');
    console.error('---- HiddenValue.sol (normalized) ----');
    console.error(normalize(sol));
    console.error('---- REFERENCE_CONTRACT (normalized) ----');
    console.error(normalize(reference));
    process.exit(1);
}

console.log('OK: REFERENCE_CONTRACT matches HiddenValue.sol');
