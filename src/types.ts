/**
 * Copyright 2019 the prism authors
 * This file is part of the prism library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { GetBlockResponse } from 'orbs-client-sdk/dist/codec/OpGetBlock';

export interface ILogger {
	warn(description: string, ...meta: any[]): void;
	info(description: string, ...meta: any[]): void;
	error(description: string, ...meta: any[]): void;
}

export interface INewBlocksHandler {
  handleNewBlock(block: GetBlockResponse): Promise<void>;
}

export interface IOrbsBlocksPolling {
  init(): Promise<void>;
  initPolling(pollingInterval: number): Promise<void>;
  RegisterToNewBlocks(handler: INewBlocksHandler): void;
  UnregisterFromNewBlocks(handler: INewBlocksHandler): void;
  dispose(): void;
  getBlockAt(height: bigint): Promise<GetBlockResponse>;
  getLatestKnownHeight(): Promise<bigint>;
}
