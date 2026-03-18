import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Chain,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { baseSepolia, sepolia } from 'wagmi/chains';
import {
  deployEVVMContracts,
  type DeploymentConfig,
  type DeploymentProgress,
  type ContractAddresses,
} from '@/lib/contracts/deployment';
import { hasBytecodes } from '@/lib/contracts/bytecodes';
import {
  saveDeployment,
  generateId,
  type DeploymentRecord,
} from '@/lib/storage';
import { getChainName } from '@/lib/wagmi';

const SUPPORTED_DEPLOY_CHAINS: Record<number, Chain> = {
  [baseSepolia.id]: baseSepolia,
  [sepolia.id]: sepolia,
};

const resolveSupportedChain = (chainId?: number | null): Chain | null => {
  if (!chainId) return null;
  return SUPPORTED_DEPLOY_CHAINS[chainId] ?? null;
};

export function useEVVMDeployment() {
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState<DeploymentProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  const resolvedAddress =
    address ??
    (embeddedWallet?.address as `0x${string}` | undefined) ??
    (user?.wallet?.address as `0x${string}` | undefined);

  const canDeploy = !!resolvedAddress && hasBytecodes();

  const deploy = useCallback(
    async (config: DeploymentConfig): Promise<DeploymentRecord | null> => {
      let activeWalletClient = walletClient as WalletClient | undefined;
      let activeChain = resolveSupportedChain(chain?.id ?? walletClient?.chain?.id ?? publicClient?.chain?.id);
      let activePublicClient =
        (publicClient as PublicClient | undefined) ??
        (activeChain
          ? createPublicClient({
              chain: activeChain,
              transport: http(activeChain.rpcUrls.default.http[0]),
            })
          : undefined);

      if ((!activeWalletClient || !activeChain) && embeddedWallet && resolvedAddress) {
        const provider = await embeddedWallet.getEthereumProvider();

        if (!activeChain) {
          const providerChainId = await provider.request({ method: 'eth_chainId' });
          const parsedChainId =
            typeof providerChainId === 'string'
              ? Number.parseInt(providerChainId, 16)
              : Number(providerChainId);
          activeChain = resolveSupportedChain(parsedChainId);
        }

        if (activeChain && !activePublicClient) {
          activePublicClient = createPublicClient({
            chain: activeChain,
            transport: http(activeChain.rpcUrls.default.http[0]),
          });
        }

        if (activeChain && !activeWalletClient) {
          activeWalletClient = createWalletClient({
            account: resolvedAddress,
            chain: activeChain,
            transport: custom(provider),
          });
        }
      }

      if (!resolvedAddress || !activeWalletClient || !activePublicClient || !activeChain) {
        setError('Wallet not connected');
        return null;
      }

      setDeploying(true);
      setError(null);

      const deploymentId = generateId();
      const record: DeploymentRecord = {
        id: deploymentId,
        createdAt: new Date().toISOString(),
        evvmName: config.evvmName,
        principalTokenName: config.principalTokenName,
        principalTokenSymbol: config.principalTokenSymbol,
        hostChainId: activeChain.id,
        hostChainName: getChainName(activeChain.id),
        adminAddress: config.adminAddress,
        goldenFisherAddress: config.goldenFisherAddress,
        activatorAddress: config.activatorAddress,
        deploymentStatus: 'deploying',
        currentStep: 0,
        txHashes: {},
        totalSupply: config.totalSupply.toString(),
        eraTokens: config.eraTokens.toString(),
        rewardPerOperation: config.rewardPerOperation.toString(),
      };

      saveDeployment(record);

      try {
        const addresses: ContractAddresses = await deployEVVMContracts(
          config,
          activeWalletClient as any,
          activePublicClient as any,
          (p) => {
            setProgress(p);
            record.currentStep = p.step;
            if (p.txHash) {
              record.txHashes[p.stage] = p.txHash;
            }
            saveDeployment(record);
          }
        );

        record.stakingAddress = addresses.staking;
        record.evvmCoreAddress = addresses.evvmCore;
        record.nameServiceAddress = addresses.nameService;
        record.estimatorAddress = addresses.estimator;
        record.treasuryAddress = addresses.treasury;
        record.p2pSwapAddress = addresses.p2pSwap;
        if (addresses.evvmId !== undefined) {
          record.evvmId = Number(addresses.evvmId);
        }
        record.deploymentStatus = 'completed';
        record.currentStep = 7;
        saveDeployment(record);

        setProgress({
          stage: 'complete',
          message: 'Deployment complete!',
          step: 7,
          totalSteps: 7,
        });

        return record;
      } catch (err: any) {
        record.deploymentStatus = 'failed';
        saveDeployment(record);
        setError(err?.message || 'Deployment failed');
        setProgress({
          stage: 'failed',
          message: err?.message || 'Deployment failed',
          step: record.currentStep,
          totalSteps: 7,
        });
        return null;
      } finally {
        setDeploying(false);
      }
    },
    [walletClient, chain?.id, publicClient, embeddedWallet, resolvedAddress]
  );

  return { deploying, progress, error, canDeploy, deploy };
}
