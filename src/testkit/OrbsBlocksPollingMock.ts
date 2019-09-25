import { IOrbsBlocksPolling, INewBlocksHandler } from '../IOrbsBlocksPolling';
import { GetBlockResponse } from 'orbs-client-sdk/dist/codec/OpGetBlock';

export class OrbsBlocksPollingMock implements IOrbsBlocksPolling {
  private blockChain: GetBlockResponse[] = [];
  private listeners: Map<INewBlocksHandler, INewBlocksHandler> = new Map();

  public async init(): Promise<void> {
    // nothing to do
  }

  public async initPooling(poolingInterval: number): Promise<void> {
    // nothing to do
  }

  public RegisterToNewBlocks(handler: INewBlocksHandler): void {
    this.listeners.set(handler, handler);
  }

  public UnregisterFromNewBlocks(handler: INewBlocksHandler): void {
    this.listeners.delete(handler);
  }

  public dispose(): void {
    this.listeners = new Map();
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

  public emitNewBlock(getBlockResponse: GetBlockResponse): void {
    this.listeners.forEach(handler => handler.handleNewBlock(getBlockResponse));
  }
}
