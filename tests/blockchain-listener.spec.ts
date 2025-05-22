import { describe, it, expect, beforeEach } from 'vitest';
import { BlockchainTransactionListener, BlockchainTransaction } from '../src/blockchain-listener';

describe('BlockchainTransactionListener', () => {
  let listener: BlockchainTransactionListener;
  
  const createMockTransaction = (overrides: Partial<BlockchainTransaction> = {}): BlockchainTransaction => ({
    id: 'tx_123',
    sender: 'wallet_sender',
    recipient: 'wallet_recipient',
    amount: 500,
    timestamp: Date.now(),
    ...overrides
  });

  beforeEach(() => {
    listener = new BlockchainTransactionListener();
  });

  it('should add a valid transaction', () => {
    const transaction = createMockTransaction();
    listener.addTransaction(transaction);
    
    expect(listener.getTransactionCount()).toBe(1);
  });

  it('should throw an error for invalid transaction', () => {
    const invalidTransaction = {
      id: '',
      sender: '',
      recipient: '',
      amount: -1,
      timestamp: 0
    } as BlockchainTransaction;

    expect(() => listener.addTransaction(invalidTransaction)).toThrow('Invalid transaction');
  });

  it('should retrieve wallet transactions', () => {
    const transaction1 = createMockTransaction({ sender: 'wallet_a' });
    const transaction2 = createMockTransaction({ recipient: 'wallet_a' });
    
    listener.addTransaction(transaction1);
    listener.addTransaction(transaction2);

    const walletTransactions = listener.getWalletTransactions('wallet_a');
    expect(walletTransactions.length).toBe(2);
  });

  it('should detect token dump when amount exceeds threshold', (context) => {
    return new Promise((resolve) => {
      listener.onTokenDump((transaction) => {
        expect(transaction.amount).toBeGreaterThanOrEqual(1000);
        resolve(true);
      });

      listener.addTransaction(createMockTransaction({ amount: 1500 }));
    });
  });

  it('should reset transactions', () => {
    const transaction = createMockTransaction();
    listener.addTransaction(transaction);
    
    listener.reset();
    expect(listener.getTransactionCount()).toBe(0);
  });
});