import { Client } from 'orbs-client-sdk';
import { GetBlockResponse } from 'orbs-client-sdk/dist/codec/OpGetBlock';
import { ILogger, INewBlocksHandler, IOrbsBlocksPolling } from './types';

/**
 * Copyright 2019 the prism authors
 * This file is part of the prism library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */
export const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));

export class OrbsBlocksPolling implements IOrbsBlocksPolling {
  private latestKnownHeight: bigint = BigInt(0);
  private listeners: Map<INewBlocksHandler, INewBlocksHandler> = new Map();
  private timeoutId: any;

  constructor(private logger: ILogger, private orbsClient: Client) {}

  public async init(): Promise<void> {
    this.logger.info('initializing OrbsAdapter');
    let initialized = false;
    while (!initialized) {
      try {
        this.latestKnownHeight = await this.getLatestKnownHeight();
        initialized = true;
      } catch (err) {
        this.logger.warn(`Unable to initialize OrbsAdapter, retrying in 1sec. err: ${err}`);
        await sleep(1000);
      }
    }
    this.logger.info('OrbsAdapter initialized');
  }

  public async initPooling(poolingInterval: number): Promise<void> {
    this.logger.info('initializing the scheduler');
    this.schedualNextRequest(poolingInterval);
  }

  public RegisterToNewBlocks(handler: INewBlocksHandler): void {
    this.listeners.set(handler, handler);
  }

  public UnregisterFromNewBlocks(handler: INewBlocksHandler): void {
    this.listeners.delete(handler);
  }

  public dispose(): void {
    this.listeners = new Map();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  public async getBlockAt(height: bigint): Promise<GetBlockResponse> {
    const getBlockResponse = await this.getBlockWrapper(height, 'getBlockAt');
    if (getBlockResponse) {
      if (getBlockResponse.requestStatus === 'COMPLETED') {
        if (getBlockResponse.blockHeight === BigInt(0)) {
          this.logger.error(
            'OrbsClient responded with requestStatus===completed, but blockheight===0, requested block was: ' +
              height.toString(),
          );
        }
        return getBlockResponse;
      } else {
        this.logger.error(`OrbsClient responded with bad requestStatus`, {
          func: 'getBlockAt',
          requestStatus: getBlockResponse.requestStatus,
          requestedBlockHeight: height.toString(),
        });
      }
    }

    return null;
  }

  public async getLatestKnownHeight(): Promise<bigint> {
    this.logger.info(`Asking Orbs for the lastest height`);
    const getBlockResponse: GetBlockResponse = await this.orbsClient.getBlock(BigInt(0));

    if (typeof getBlockResponse.blockHeight !== 'bigint') {
      throw new Error(`orbsClient.getBlock(0n) returned with bad blockHeight`);
    }

    this.logger.info(`Lastest height is ${getBlockResponse.blockHeight}`);
    return getBlockResponse.blockHeight;
  }

  private async checkForNewBlocks(poolingInterval: number): Promise<void> {
    try {
      const nextHeight = this.latestKnownHeight + BigInt(1);
      this.logger.info(`get block at => ${nextHeight}`);
      const getBlockResponse = await this.getBlockWrapper(nextHeight, 'checkForNewBlocks');
      if (getBlockResponse) {
        const blockHeight: bigint = BigInt(getBlockResponse.blockHeight);
        this.logger.info(`block height <= ${blockHeight}`);

        if (blockHeight > this.latestKnownHeight) {
          this.listeners.forEach(handler => handler.handleNewBlock(getBlockResponse));
          this.latestKnownHeight = blockHeight;
        }
      } else {
        this.logger.info(`bad response, ignoring`);
      }
    } catch (err) {
      this.logger.error(`checkForNewBlocks failed`, err);
    }
    this.schedualNextRequest(poolingInterval);
  }

  private async getBlockWrapper(blockHeight: bigint, sourceMethod: string): Promise<GetBlockResponse> {
    let getBlockResponse: GetBlockResponse;
    try {
      getBlockResponse = await this.orbsClient.getBlock(blockHeight);
    } catch (err) {
      this.logger.error(`getBlock failed`, {
        func: 'getBlockWrapper',
        sourceMethod,
        err,
        errMessage: err.message,
        stack: err.stack,
        blockHeight: blockHeight.toString(),
      });
      return null;
    }

    return getBlockResponse;
  }

  private schedualNextRequest(poolingInterval: number): void {
    this.timeoutId = setTimeout(() => this.checkForNewBlocks(poolingInterval), poolingInterval);
  }
}
