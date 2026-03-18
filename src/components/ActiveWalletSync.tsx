import { useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";

export function ActiveWalletSync() {
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();

  useEffect(() => {
    const embedded = wallets.find((w) => w.walletClientType === "privy");
    if (embedded) {
      void setActiveWallet(embedded);
    }
  }, [wallets, setActiveWallet]);

  return null;
}
