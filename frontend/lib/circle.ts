import { createPublicClient, defineChain } from 'viem';
import { 
  toCircleSmartAccount, 
  toModularTransport, 
  toPasskeyTransport, 
  toWebAuthnCredential, 
  WebAuthnMode 
} from '@circle-fin/modular-wallets-core';
import { toWebAuthnAccount } from 'viem/account-abstraction';

const CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || '';
const CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL || '';

// Define ARC Testnet manually in viem
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'ARC Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ARC',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
});

export function isCircleEnabled(): boolean {
  return !!(CLIENT_KEY && CLIENT_URL);
}

export function getPasskeyTransport() {
  if (!isCircleEnabled()) {
    throw new Error('Circle configuration is missing. Please set NEXT_PUBLIC_CIRCLE_CLIENT_KEY and NEXT_PUBLIC_CIRCLE_CLIENT_URL.');
  }
  return toPasskeyTransport(CLIENT_URL, CLIENT_KEY);
}

export function getPublicClient() {
  if (!isCircleEnabled()) {
    throw new Error('Circle configuration is missing.');
  }
  // Fallback to polygonAmoy if not on ARC or specified
  const modularTransport = toModularTransport(`${CLIENT_URL}/polygonAmoy`, CLIENT_KEY);
  
  return createPublicClient({
    chain: arcTestnet,
    transport: modularTransport,
  });
}

export interface CircleWalletSession {
  address: string;
  username: string;
  credentialId: string;
}

export async function registerPasskeyWallet(username: string): Promise<CircleWalletSession> {
  const passkeyTransport = getPasskeyTransport();
  const client = getPublicClient();

  // Register passkey credential via WebAuthn
  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Register,
    username,
  });

  // Create smart account owner using the credential
  const owner = toWebAuthnAccount({ credential });

  // Instantiate the smart account wallet
  const account = await toCircleSmartAccount({
    client,
    owner,
    name: username,
  });

  return {
    address: account.address,
    username,
    credentialId: credential.id
  };
}

export async function loginPasskeyWallet(username: string): Promise<CircleWalletSession> {
  const passkeyTransport = getPasskeyTransport();
  const client = getPublicClient();

  // Login/Retrieve passkey credential
  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Login,
    username,
  });

  const owner = toWebAuthnAccount({ credential });

  const account = await toCircleSmartAccount({
    client,
    owner,
    name: username,
  });

  return {
    address: account.address,
    username,
    credentialId: credential.id
  };
}
