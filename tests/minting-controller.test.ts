import { describe, it, expect, beforeEach } from 'vitest';
import { MintingController } from '../src/token-minting/minting-controller';
import { AccessControl } from '../src/token-minting/access-control';

describe('MintingController', () => {
  let mintingController: MintingController;
  const validWallet = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    mintingController = new MintingController();
    mintingController.resetState(); // Reset state before each test
  });

  it('should restrict minting for unauthorized wallets', async () => {
    const accessControl = new AccessControl();
    accessControl.blockAddress(validWallet);

    await expect(mintingController.mintTokens(validWallet)).rejects.toThrow('Wallet not authorized to mint tokens');
  });

  it('should track total minted tokens', async () => {
    const initialTotal = mintingController.getTotalMintedTokens();
    await mintingController.mintTokens(validWallet);
    
    const newTotal = mintingController.getTotalMintedTokens();
    expect(newTotal).toBeGreaterThan(initialTotal);
  });

  it('should generate unique transaction hashes for each minting event', async () => {
    const mintEvents1 = await Promise.all([
      mintingController.mintTokens(validWallet),
      mintingController.mintTokens(validWallet)
    ]);

    const events = mintingController.getMintingEvents();
    const uniqueHashes = new Set(events.map(e => e.transactionHash));
    
    expect(uniqueHashes.size).toBe(events.length);
  });

  it('should prevent minting beyond daily limit', async () => {
    // Simulate multiple minting attempts to exceed daily limit
    const maxAttempts = 10; // Adjust based on MAX_DAILY_MINT_LIMIT
    const promises = Array(maxAttempts).fill(null).map(() => 
      mintingController.mintTokens(validWallet)
    );

    await expect(Promise.all(promises)).rejects.toThrow('Daily minting limit exceeded');
  });
});