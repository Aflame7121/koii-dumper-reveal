import { describe, it, expect } from 'vitest';
import { WalletDumpingDetector, WalletTransaction } from '../src/models/wallet-dumping-model';

describe('WalletDumpingDetector', () => {
  const walletAddress = '0x1234567890';

  const createTransactions = (amounts: number[]): WalletTransaction[] => 
    amounts.map((amount, index) => ({
      id: `tx${index}`,
      walletAddress,
      amount,
      timestamp: Date.now() - index * 1000,
      destinationAddress: `0x${index}`
    }));

  it('should detect dumping when transactions exceed threshold', () => {
    const transactions = createTransactions([100, 200, 50, 300]);
    
    const detector = new WalletDumpingDetector();
    const analysis = detector.detectDumping(transactions);

    expect(analysis.walletAddress).toBe(walletAddress);
    expect(analysis.totalTransactions).toBe(4);
    expect(analysis.totalTokensTransferred).toBe(650);
    expect(analysis.dumpingTransactions.length).toBeGreaterThan(0);
  });

  it('should throw error for empty transactions', () => {
    const detector = new WalletDumpingDetector();

    expect(() => detector.detectDumping([])).toThrow('No transactions provided for analysis');
  });

  it('should handle custom dumping threshold with large transactions', () => {
    const transactions = createTransactions([500, 200, 50, 300]);
    
    const detector = new WalletDumpingDetector();
    const analysis = detector.detectDumping(transactions, 0.5);

    expect(analysis.dumpingTransactions.length).toBeGreaterThan(0);
    expect(analysis.dumpingTransactions[0].amount).toBe(500);
  });
});