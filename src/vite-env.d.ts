/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_ZERODEV_RPC?: string;
  readonly VITE_ZERODEV_PAYMASTER_RPC?: string;
  readonly VITE_ZERODEV_RPC_SEPOLIA?: string;
  readonly VITE_ZERODEV_PAYMASTER_RPC_SEPOLIA?: string;
  /** Optional: defaults to your ZeroDev project id in code if unset */
  readonly VITE_ZERODEV_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
