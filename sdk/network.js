import { StacksMainnet, StacksTestnet } from '@stacks/network';

export function resolveStacksNetwork(network = 'mainnet') {
  if (network && typeof network === 'object') {
    return network;
  }

  if (network === 'mainnet') {
    return new StacksMainnet();
  }

  if (network === 'testnet') {
    return new StacksTestnet();
  }

  throw new TypeError('network must be "mainnet", "testnet", or a Stacks network object');
}
