/**
 * WalletDumpingDetector provides logic to detect token dumping behaviors
 * based on transaction patterns and wallet activity.
 */
export class WalletDumpingDetector {
  // Configuration for dumping detection
  private config: {
    dumpThresholdPercentage: number;
    timeWindowHours: number;
    minTransactionAmount: number;
  };

  constructor(config?: {
    dumpThresholdPercentage?: number;
    timeWindowHours?: number;
    minTransactionAmount?: number;
  }) {
    // Default configuration with sensible defaults
    this.config = {
      dumpThresholdPercentage: config?.dumpThresholdPercentage ?? 50,
      timeWindowHours: config?.timeWindowHours ?? 24,
      minTransactionAmount: config?.minTransactionAmount ?? 100
    };
  }

  /**
   * Analyzes wallet transactions to detect potential dumping behavior
   * @param transactions Array of wallet transactions
   * @returns Boolean indicating if the wallet is likely dumping tokens
   */
  detectDumping(transactions: Array<{
    amount: number;
    timestamp: number;
    type: 'buy' | 'sell';
  }>): boolean {
    // Validate input
    if (!transactions || transactions.length === 0) {
      return false;
    }

    // Filter transactions within the specified time window
    const currentTime = Date.now();
    const relevantTransactions = transactions.filter(tx => 
      currentTime - tx.timestamp <= this.config.timeWindowHours * 3600 * 1000
    );

    // Not enough transactions to determine dumping
    if (relevantTransactions.length < 2) {
      return false;
    }

    // Calculate total buy and sell volumes
    const totalBuyVolume = relevantTransactions
      .filter(tx => tx.type === 'buy')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalSellVolume = relevantTransactions
      .filter(tx => tx.type === 'sell')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Check if sell volume exceeds the threshold percentage of buy volume
    const dumpRatio = (totalSellVolume / totalBuyVolume) * 100;
    return dumpRatio >= this.config.dumpThresholdPercentage 
      && totalSellVolume >= this.config.minTransactionAmount;
  }

  /**
   * Updates detection configuration
   * @param newConfig Partial configuration to update
   */
  updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
  }
}