

## Problem

The "Use Connected Wallet" button does nothing because:

1. **`resolvedAddress` is `undefined`** — `useAccount().address` is `undefined` (wagmi hasn't synced the embedded wallet yet), and `useWallets().wallets` may also be empty or not yet populated at the time the button is clicked.
2. **Fill logic only writes blank fields** — even if the address resolves later, clicking a second time won't overwrite already-populated fields.
3. **No user feedback** — when the address can't be resolved, the button silently does nothing.

The Privy session response confirms the user's embedded wallet address is `0x584f6325538Dff80743C67Bb68daFe811E05597e`, but this isn't reaching the Deploy page's `resolvedAddress` variable.

## Plan

### 1. Fix address resolution in `Deploy.tsx`

Add `usePrivy()` user object as a third fallback for address resolution:

```
const resolvedAddress =
  address ??
  (wallets.find(w => w.walletClientType === 'privy')?.address as `0x${string}` | undefined) ??
  (user?.wallet?.address as `0x${string}` | undefined);
```

This uses `user.wallet.address` from Privy's session data, which is available immediately after login even before wagmi/wallets sync.

### 2. Make `fillAddress` always overwrite

Change `fillAddress` to unconditionally set all three fields (user chose "Overwrite all"):

```ts
const fillAddress = () => {
  if (resolvedAddress) {
    setAdminAddr(resolvedAddress);
    setGoldenFisher(resolvedAddress);
    setActivator(resolvedAddress);
  }
};
```

### 3. Add feedback when no address is available

If `resolvedAddress` is still undefined when the button is clicked, show a toast notification explaining the wallet hasn't loaded yet.

### Files changed
- `src/pages/Deploy.tsx` — all three changes above

