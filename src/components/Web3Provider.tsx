import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { baseSepolia, sepolia } from 'wagmi/chains';

const queryClient = new QueryClient();

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'clxva58fj00k5czl3gzmqhwdq';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#0047FF',
        },
        loginMethods: ['email', 'google', 'discord', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia, sepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
