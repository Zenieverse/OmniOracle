<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1mWbEJh34Be9n5TQ_iOsXDfLskDEso_ZM

or https://poe.com/OmniOracle

https://omni-oracle-synth.lovable.app

Demo Video: https://app.heygen.com/videos/8e5c668721e044cc8243d93596169fc8 
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

OmniOracle — Trustworthy Prediction Markets
OmniOracle is a decentralized prediction-market platform that integrates verified real-world data with a decentralized dispute resolution DAO, AI market creation, and incentive-aligned tokenomics.
Features
Create markets on any topic with AI-assisted rules
Trade using AMM or orderbook models
Multi-oracle verification and cryptographic attestations
On-chain finalization and automatic payouts
Validator staking & dispute DAO
Tokenized incentives (ONI token)
Architecture
Frontend: React + TypeScript, Web3 wallet support (MetaMask/WalletConnect)
Backend: Microservices (Node.js / Go), Kafka for events
Databases: PostgreSQL for core state, Timescale/InfluxDB for timeseries
Blockchain: EVM-compatible L2 (recommended) for low gas
Oracles: Chainlink/Pyth + Custom REST adapters (signed payloads)
Smart Contracts
FactoryContract — deploys markets
MarketContract — per-market logic and settlement
LiquidityPool / AMM — market pricing and liquidity
StakingAndValidator — stake, vote, slash
Governance — on-chain proposals
Check /contracts for the Solidity sources and unit tests.
Getting started (developer)
Install dependencies
git clone <repo>
cd omnioracle
yarn install
Run local blockchain (Hardhat)
yarn hardhat node
Deploy contracts (local)
yarn deploy:local
Start backend services
docker-compose up --build
Start frontend
cd web
yarn start
Deployment
Use an L2 (e.g., Optimism, Arbitrum) for final deployment to reduce gas.
Use IPFS/Arweave to store market metadata.
Configure multisig for protocol admin actions.
Tokenomics
ONI token — total supply 1,000,000,000
Allocation: 40% treasury / 20% team / 15% community / 10% liquidity / 10% investors / 5% airdrop
Security
Audit all contracts (recommended: 2 audits pre-mainnet)
Use EIP-712 for oracle signatures
Implement timelocks for upgrades and slashing appeals
Roadmap
MVP: AMM markets, oracle orchestration, basic UI
Phase 2: DAO, dispute flow, staking & reputation
Phase 3: Institutional features, private markets, cross-chain
Contributing
See CONTRIBUTING.md for setup and test guidelines
Run yarn test to run unit tests and coverage
License
MIT

