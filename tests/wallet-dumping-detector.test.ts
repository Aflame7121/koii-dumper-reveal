import { describe, it, expect } from 'vitest';
import { WalletDumpingDetector } from '../src/wallet-dumping-detector';

describe('WalletDumpingDetector', () => {
  // Test default configuration
  it('should create with default configuration', () => {
    const detector = new WalletDumpingDetector();
    expect(detector).toBeTruthy();
  });

  // Test custom configuration
  it('should allow custom configuration', () => {
    const detector = new WalletDumpingDetector({
      dumpThresholdPercentage: 70,
      timeWindowHours: 12,
      minTransactionAmount: 200
    });
    
    // Additional validations could be added here
    expect(detector).toBeTruthy();
  });

  // Test dumping detection scenarios
  describe('detectDumping', () => {
    it('should return false for empty transactions', () => {
      const detector = new WalletDumpingDetector();
      expect(detector.detectDumping([])).toBe(false);
    });

    it('should detect token dumping when sell volume is high', () => {
      const detector = new WalletDumpingDetector();
      const transactions = [
        { amount: 1000, timestamp: Date.now() - 3600000, type: 'buy' },
        { amount: 800, timestamp: Date.now() - 1800000, type: 'sell' }
      ];
      
      expect(detector.detectDumping(transactions)).toBe(true);
    });

    it('should not detect dumping when sell volume is low', () => {
      const detector = new WalletDumpingDetector();
      const transactions = [
        { amount: 1000, timestamp: Date.now() - 3600000, type: 'buy' },
        { amount: 200, timestamp: Date.now() - 1800000, type: 'sell' }
      ];
      
      expect(detector.detectDumping(transactions)).toBe(false);
    });

    it('should handle transactions outside time window', () => {
      const detector = new WalletDumpingDetector({ timeWindowHours: 1 });
      const transactions = [
        { amount: 1000, timestamp: Date.now() - 25 * 3600000, type: 'buy' },
        { amount: 800, timestamp: Date.now() - 26 * 3600000, type: 'sell' }
      ];
      
      expect(detector.detectDumping(transactions)).toBe(false);
    });
  });

  // Test configuration update
  it('should update configuration', () => {
    const detector = new WalletDumpingDetector();
    detector.updateConfig({ dumpThresholdPercentage: 60 });
    
    // Additional validation might require exposing config or adding a getter
    expect(detector).toBeTruthy();
  });
});