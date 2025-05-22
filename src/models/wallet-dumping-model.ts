/**
 * Represents a wallet transaction for dumping detection analysis
 */
export interface WalletTransaction {
  /**
   * Unique identifier for the transaction
   */
  id: string;

  /**
   * Wallet address initiating the transaction
   */
  walletAddress: string;

  /**
   * Amount of tokens transferred
   */
  amount: number;

  /**
   * Timestamp of the transaction
   */
  timestamp: number;

  /**
   * Destination wallet address
   */
  destinationAddress: string;
}

/**
 * Represents the dumping detection analysis for a wallet
 */
export interface WalletDumpingAnalysis {
  /**
   * Wallet address being analyzed
   */
  walletAddress: string;

  /**
   * Total number of transactions
   */
  totalTransactions: number;

  /**
   * Total amount of tokens transferred
   */
  totalTokensTransferred: number;

  /**
   * Percentage of tokens dumped relative to total holdings
   */
  dumpingPercentage: number;

  /**
   * Transactions considered as potential dumping
   */
  dumpingTransactions: WalletTransaction[];
}

/**
 * Wallet Dumping Detection Service
 * Analyzes wallet transactions to identify potential token dumping behavior
 */
export class WalletDumpingDetector {
  /**
   * Detect if a wallet is engaging in dumping behavior
   * @param transactions Array of wallet transactions
   * @param dumpingThreshold Percentage of tokens considered as dumping
   * @returns Wallet dumping analysis
   */
  detectDumping(
    transactions: WalletTransaction[], 
    dumpingThreshold: number = 0.2
  ): WalletDumpingAnalysis {
    // Validate input
    if (!transactions || transactions.length === 0) {
      throw new Error('No transactions provided for analysis');
    }

    const walletAddress = transactions[0].walletAddress;
    const totalTokensTransferred = transactions.reduce(
      (sum, tx) => sum + tx.amount, 
      0
    );

    // Sort transactions by amount in descending order
    const sortedTransactions = [...transactions].sort((a, b) => b.amount - a.amount);

    // Identify dumping transactions based on individual transaction size
    const dumpingTransactions = sortedTransactions.filter(tx => 
      tx.amount / totalTokensTransferred >= dumpingThreshold
    );

    return {
      walletAddress,
      totalTransactions: transactions.length,
      totalTokensTransferred,
      dumpingPercentage: dumpingTransactions.length / transactions.length,
      dumpingTransactions
    };
  }
}