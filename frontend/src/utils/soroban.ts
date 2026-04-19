import { 
  rpc, 
  TransactionBuilder, 
  Networks, 
  Contract,
  Address,
  nativeToScVal,
  BASE_FEE
} from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const server = new rpc.Server(RPC_URL);

// REAL CONTRACT IDS - DEPLOYED TO TESTNET
export const NFT_CONTRACT_ID = 'CAAERVDMPWVEOVRO24OZRT7MTQU4Q3FACQ3ABZVWXQR5TSSXH3FOEL7A'; 
export const MARKETPLACE_CONTRACT_ID = 'CDNTJDRFJZHLTY3BVWSBYKGJGJR3UDTWAX2PU65FEDNGB5CVMWGTZEKL'; 

export const getEvents = async (contractId: string) => {
  try {
    const response = await server.getEvents({
      startLedger: 0,
      filters: [{
        type: 'contract',
        contractIds: [contractId],
      }],
      limit: 10,
    });
    return response.events;
  } catch (e) {
    console.error("Failed to fetch events", e);
    return [];
  }
};

export const buyNFT = async (
  buyerAddress: string, 
  nftAddress: string, 
  tokenId: number, 
  sign: (xdr: string) => Promise<string>
) => {
  // VALIDATION - Ensure addresses are formatted correctly for the Stellar SDK
  if (!buyerAddress.startsWith('G') || buyerAddress.length !== 56) {
    throw new Error("Invalid buyer address. Please check your wallet connection.");
  }
  if (!nftAddress.startsWith('C') || nftAddress.length !== 56) {
    throw new Error(`Invalid NFT contract address: "${nftAddress}". The metadata for this item is incorrectly configured.`);
  }

  try {
    const account = await server.getAccount(buyerAddress);
    const marketplace = new Contract(MARKETPLACE_CONTRACT_ID);

    // 1. Build Transaction
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        marketplace.call(
          "buy",
          new Address(buyerAddress).toScVal(),
          new Address(nftAddress).toScVal(),
          nativeToScVal(tokenId, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    // 2. Simulate
    const simulated = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${JSON.stringify(simulated.error)}`);
    }

    // 3. Assemble Transaction (for fees and resources)
    const assembledTx = rpc.assembleTransaction(tx, simulated).build();

    // 4. Sign with Freighter (returns base64 XDR)
    const signedXdr = await sign(assembledTx.toXDR());

    // 5. Build signed transaction object and submit
    const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const result = await server.sendTransaction(signedTx);
    return result;
  } catch (e: any) {
    console.error("Purchase failed", e);
    throw e;
  }
};
