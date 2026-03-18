# EVVM Deployer

Web app for deploying EVVM (Ethereum Virtual Machine) contracts, registering instances on the Sepolia registry, and managing deployment manifests and signatures.

## Features

- **Deploy** – Full EVVM genesis deployment on Base Sepolia:
  - Staking → EVVM Core (with CoreHashUtils) → Name Service → Estimator → Treasury → P2P Swap
  - Automatic registration of the EVVM instance on the Ethereum Sepolia registry
- **Registry** – Register deployed EVVMs and track deployment records
- **Signatures** – Workflow for EVVM-related signing using `@evvm/viem-signature-library`
- **Dashboard** – View and manage deployments

## Tech stack

- **Frontend:** React 18, TypeScript, Vite 8
- **UI:** Tailwind CSS, shadcn/ui (Radix), Framer Motion
- **Auth & EOA:** [Privy](https://privy.io) (email, Google, Discord, wallet) + `@privy-io/wagmi` (wagmi bindings)
- **Account abstraction:** [ZeroDev](https://zerodev.app) Kernel on **Base Sepolia** and **Ethereum Sepolia** (gas-sponsored UserOps; the Privy embedded wallet is the ECDSA owner via `signerToEcdsaValidator`)
- **Web3:** wagmi, viem, `permissionless` (pulled in by ZeroDev)
- **EVVM:** `@evvm/viem-signature-library` for ABIs and signature utilities
‑ **Polyfills:** `buffer` polyfill wired in `src/main.tsx` to provide a browser‑safe global `Buffer` for web3/auth dependencies that still expect the Node global

## Prerequisites

- Node.js 18+
- npm or bun
- Privy app ID and (recommended) ZeroDev project with **Base Sepolia** enabled

## Getting started

```bash
cp .env.example .env
# Set VITE_PRIVY_APP_ID (required). Optionally set ZeroDev RPC overrides.

npm install --legacy-peer-deps

# Run development server (default: http://localhost:8080)
npm run dev
```

**Privy dashboard:** enable Base Sepolia and Ethereum Sepolia, and turn on **embedded Ethereum wallets**.  
**ZeroDev dashboard:** enable both chains, and copy the project id shown there (defaults in this repo to `92691254-2986-488c-9c5d-b6028a3deb3a`).

By default, the app uses **v3 unified RPCs**:

- Base Sepolia: `https://rpc.zerodev.app/api/v3/<PROJECT_ID>/chain/84532`
- Ethereum Sepolia: `https://rpc.zerodev.app/api/v3/<PROJECT_ID>/chain/11155111`

You can override them with:

- `VITE_ZERODEV_RPC` / `VITE_ZERODEV_RPC_SEPOLIA` (bundler URLs)
- `VITE_ZERODEV_PAYMASTER_RPC` / `VITE_ZERODEV_PAYMASTER_RPC_SEPOLIA` (optional, defaults to the same URL as bundler)

**Deploy** runs entirely via **ZeroDev Kernel**: six contract deploys on **Base Sepolia** plus **registry** on **Ethereum Sepolia** are **sponsored UserOps**. The Privy embedded wallet signs the UserOps; ZeroDev’s paymaster/bundler handle gas.  
**Signatures** still use your Privy EOA via wagmi and do **not** go through account abstraction.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start Vite dev server    |
| `npm run build`| Production build         |
| `npm run build:dev` | Build in development mode |
| `npm run preview`   | Preview production build |
| `npm run lint`     | Run ESLint               |
| `npm run test`     | Run Vitest once          |
| `npm run test:watch` | Run Vitest in watch mode |

## Project structure

- `src/pages/` – Deploy, Signatures, Dashboard, Index
- `src/lib/contracts/` – Deployment logic, bytecodes, registry integration
- `src/hooks/` – `useEVVMDeployment` and deployment state
- `src/components/` – UI components and Web3Provider

## Lovable compatibility

This repo is set up to work with [Lovable](https://lovable.dev) when the project is connected to GitHub:

- **GitHub as source of truth:** Connect this repo in Lovable (Settings → Connectors → GitHub). Lovable syncs from the **default branch (`main`)** only. Push changes to `main` so Lovable loads this frontend.
- **Dev server port:** The app runs on **port 8080** (`vite.config.ts`). Playwright is configured with `baseURL: http://localhost:8080` so Lovable’s browser tests hit the same app.
- **Stack:** React + Vite + TypeScript + Tailwind, with `lovable-tagger` and `lovable-agent-playwright-config` for Lovable’s tooling.

If Lovable was showing a different frontend, ensure the Lovable project is linked to **this** repository and that you’re on `main`. After pushing to `main`, Lovable will sync and preview this codebase.

## License

Private.
