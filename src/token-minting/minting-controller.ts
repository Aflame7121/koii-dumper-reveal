import { TokenMinter } from './token-minter';
import { AccessControl } from './access-control';

export interface MintingEvent {
  walletAddress: string;
  tokenAmount: number;
  timestamp: number;
  transactionHash?: string;
}

export class MintingController {
  private tokenMinter: TokenMinter;
  private mintingEvents: MintingEvent[] = [];
  private totalMintedTokens = 0;
  private MAX_DAILY_MINT_LIMIT = 50; // Dramatically reduced for precise testing
  private GLOBAL_TOTAL_MINT_CAP = 1000000;

  constructor(
    tokenMinter?: TokenMinter 
  ) {
    this.tokenMinter = tokenMinter || new TokenMinter();
  }

  /**
   * Mint tokens with comprehensive restrictions and tracking
   * @param walletAddress Wallet to mint tokens for
   * @returns Minted token amount
   */
  async mintTokens(walletAddress: string): Promise<number> {
    // Validate wallet authorization using strict AccessControl
    const accessControl = new AccessControl();
    if (!accessControl.canMint(walletAddress)) {
      throw new Error('Wallet not authorized to mint tokens');
    }

    // Validate minting limits
    this.validateMintingLimits();

    // Generate tokens
    const tokenAmount = await this.tokenMinter.generateTokens(walletAddress);

    // Record minting event
    const mintingEvent: MintingEvent = {
      walletAddress,
      tokenAmount,
      timestamp: Date.now(),
      transactionHash: this.generateTransactionHash()
    };

    // Update tracking
    this.mintingEvents.push(mintingEvent);
    this.totalMintedTokens += tokenAmount;

    return tokenAmount;
  }

  /**
   * Validate minting limits before token generation
   */
  private validateMintingLimits(): void {
    const dailyMintedTokens = this.getDailyMintedTokens();

    // Strict daily minting limit check
    if (dailyMintedTokens >= this.MAX_DAILY_MINT_LIMIT) {
      throw new Error('Daily minting limit exceeded');
    }

    // Global minting cap check
    if (this.totalMintedTokens >= this.GLOBAL_TOTAL_MINT_CAP) {
      throw new Error('Global minting cap reached');
    }
  }

  /**
   * Calculate tokens minted in the last 24 hours
   */
  private getDailyMintedTokens(): number {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    return this.mintingEvents
      .filter(event => event.timestamp >= twentyFourHoursAgo)
      .reduce((total, event) => total + event.tokenAmount, 0);
  }

  /**
   * Generate a mock transaction hash
   */
  private generateTransactionHash(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get minting events
   */
  getMintingEvents(): MintingEvent[] {
    return [...this.mintingEvents];
  }

  /**
   * Get total minted tokens
   */
  getTotalMintedTokens(): number {
    return this.totalMintedTokens;
  }

  /**
   * Reset minting state (useful for testing)
   */
  resetState(): void {
    this.mintingEvents = [];
    this.totalMintedTokens = 0;
  }
}