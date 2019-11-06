import { BlockTransaction, GetBlockResponse, ResultsBlockHeader, TransactionsBlockHeader } from 'orbs-client-sdk/dist/codec/OpGetBlock';
import { RequestStatus } from 'orbs-client-sdk/dist/codec/RequestStatus';

export class GetBlockResponseMock implements GetBlockResponse {
  public requestStatus: RequestStatus = null;
  public blockTimestamp: Date;
  public transactionsBlockHash: Uint8Array = null;
  public transactionsBlockHeader: TransactionsBlockHeader = null;
  public resultsBlockHash: Uint8Array = null;
  public resultsBlockHeader: ResultsBlockHeader = null;
  public transactions: BlockTransaction[] = [];

  constructor(public blockHeight: bigint) {
    this.blockTimestamp =  new Date();
  }
}
