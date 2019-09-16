import { IOrbsBlocksPolling, INewBlocksHandler } from '../IOrbsBlocksPolling';
import { GetBlockResponse } from 'orbs-client-sdk/dist/codec/OpGetBlock';

export class OrbsBlocksPollingMock implements IOrbsBlocksPolling {
  private blockChain: GetBlockResponse[] = [];

  public async init(): Promise<void> {
    // nothing to do
  }

  public async initPooling(poolingInterval: number): Promise<void> {
    // nothing to do
  }

  public RegisterToNewBlocks(handler: INewBlocksHandler): void {
    // nothing to do
  }

  public UnregisterFromNewBlocks(handler: INewBlocksHandler): void {
    // nothing to do
  }

  public dispose(): void {
    // nothing to do
  }

  public async getBlockAt(height: bigint): Promise<GetBlockResponse> {
    return this.blockChain.find(b => BigInt(b.blockHeight) === height);
  }

  public async getLatestKnownHeight(): Promise<bigint> {
    return this.blockChain.map(block => BigInt(block.blockHeight)).reduce((prev, cur) => cur > prev ? cur : prev, BigInt(0));
  }

  // helper functions
  public setBlockChain(blockChain: GetBlockResponse[]): void {
    this.blockChain = blockChain;
  }
}
