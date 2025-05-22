import { EventEmitter } from 'events';

/**
 * Represents a blockchain transaction
 */
export interface BlockchainTransaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
}

/**
 * Blockchain Transaction Listener for detecting token dumping behaviors
 */
export class BlockchainTransactionListener {
  private eventEmitter: EventEmitter;
  private transactions: BlockchainTransaction[] = [];
  private dumpThreshold: number;

  /**
   * Create a new Blockchain Transaction Listener
   * @param dumpThreshold Minimum amount to consider as a potential dump
   */
  constructor(dumpThreshold: number = 1000) {
    this.eventEmitter = new EventEmitter();
    this.dumpThreshold = dumpThreshold;
  }

  /**
   * Add a new transaction to the listener
   * @param transaction Blockchain transaction to process
   */
  addTransaction(transaction: BlockchainTransaction): void {
    // Validate transaction
    if (!this.validateTransaction(transaction)) {
      throw new Error('Invalid transaction');
    }

    this.transactions.push(transaction);
    this.checkForDumpingBehavior(transaction);
  }

  /**
   * Validate a blockchain transaction
   * @param transaction Transaction to validate
   * @returns Boolean indicating transaction validity
   */
  private validateTransaction(transaction: BlockchainTransaction): boolean {
    return !!(
      transaction.id && 
      transaction.sender && 
      transaction.recipient && 
      transaction.amount >= 0 && 
      transaction.timestamp > 0
    );
  }

  /**
   * Check for potential token dumping behavior
   * @param transaction Recent transaction to analyze
   */
  private checkForDumpingBehavior(transaction: BlockchainTransaction): void {
    // Simple dumping detection: large transaction amount
    if (transaction.amount >= this.dumpThreshold) {
      this.eventEmitter.emit('token-dump-detected', transaction);
    }
  }

  /**
   * Get recent transactions for a specific wallet
   * @param walletAddress Wallet to retrieve transactions for
   * @returns Array of transactions for the wallet
   */
  getWalletTransactions(walletAddress: string): BlockchainTransaction[] {
    return this.transactions.filter(
      tx => tx.sender === walletAddress || tx.recipient === walletAddress
    );
  }

  /**
   * Subscribe to token dumping events
   * @param callback Function to call when a dump is detected
   */
  onTokenDump(callback: (transaction: BlockchainTransaction) => void): void {
    this.eventEmitter.on('token-dump-detected', callback);
  }

  /**
   * Clear all transactions
   */
  reset(): void {
    this.transactions = [];
  }

  /**
   * Get total number of tracked transactions
   * @returns Number of transactions
   */
  getTransactionCount(): number {
    return this.transactions.length;
  }
}