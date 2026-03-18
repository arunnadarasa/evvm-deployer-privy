import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia, sepolia } from "wagmi/chains";
import { config } from "@/lib/wagmi";
import { ZeroDevKernelProvider } from "@/contexts/ZeroDevKernelContext";
import { ActiveWalletSync } from "@/components/ActiveWalletSync";

const queryClient = new QueryClient();

const appId = import.meta.env.VITE_PRIVY_APP_ID ?? "cmmv0z6dv06bs0djs07c7vrl3";

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        supportedChains: [baseSepolia, sepolia],
        defaultChain: baseSepolia,
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        loginMethods: ["email", "google", "wallet", "discord"],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <ActiveWalletSync />
          <ZeroDevKernelProvider>{children}</ZeroDevKernelProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
