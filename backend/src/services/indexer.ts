import { rpc, scValToNative } from '@stellar/stellar-sdk';
import NFT from '../models/NFT';
import Listing from '../models/Listing';
import Activity from '../models/Activity';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const server = new rpc.Server(RPC_URL);

// REAL CONTRACT IDS - DEPLOYED TO TESTNET
const NFT_CONTRACT_ID = 'CAAERVDMPWVEOVRO24OZRT7MTQU4Q3FACQ3ABZVWXQR5TSSXH3FOEL7A'; 
const MARKETPLACE_CONTRACT_ID = 'CDNTJDRFJZHLTY3BVWSBYKGJGJR3UDTWAX2PU65FEDNGB5CVMWGTZEKL'; 

export const startIndexer = async () => {
  console.log('Starting Soroban Indexer...');
  setInterval(async () => {
    try {
      await pollEvents();
    } catch (e) {
      console.error('Indexer error:', e);
    }
  }, 10000); // Poll every 10 seconds
};

async function pollEvents() {
  const response = await server.getEvents({
    startLedger: 0, // In production, store and resume from last ledger
    filters: [
      { contractIds: [NFT_CONTRACT_ID, MARKETPLACE_CONTRACT_ID] }
    ],
    limit: 50,
  });

  for (const event of response.events) {
    await processEvent(event);
  }
}

async function processEvent(event: any) {
  const topics = event.topic.map((t: string) => scValToNative(t));
  const type = topics[0]; // e.g., "mint", "listed", "sold"

  if (type === 'mint') {
    const to = topics[1].toString();
    const tokenId = scValToNative(event.value);
    
    await NFT.findOneAndUpdate(
      { contractId: event.contractId, tokenId },
      { owner: to, metadataUri: 'pending' }, // In real app, fetch from contract or metadata
      { upsert: true }
    );

    await createActivity('mint', to, `Minted NFT #${tokenId}`, event.txHash, event.contractId);
  }

  if (type === 'listed') {
    const seller = topics[1].toString();
    const [nftAddr, tokenId, price] = scValToNative(event.value);

    const nft = await NFT.findOne({ contractId: nftAddr, tokenId });
    if (nft) {
      await Listing.findOneAndUpdate(
        { nft: nft._id, contractId: event.contractId },
        { seller, price: price.toString(), currency: 'XLM', active: true },
        { upsert: true }
      );
      await createActivity('list', seller, `Listed NFT #${tokenId} for ${price} XLM`, event.txHash, event.contractId);
    }
  }

  if (type === 'sold') {
    const buyer = topics[1].toString();
    const [nftAddr, tokenId, price] = scValToNative(event.value);

    const nft = await NFT.findOneAndUpdate(
      { contractId: nftAddr, tokenId },
      { owner: buyer }
    );

    if (nft) {
      await Listing.findOneAndUpdate(
        { nft: nft._id },
        { active: false }
      );
      await createActivity('sold', buyer, `Purchased NFT #${tokenId} for ${price} XLM`, event.txHash, event.contractId);
    }
  }
}

async function createActivity(type: string, user: string, details: string, txHash: string, contractId: string) {
  // @ts-ignore
  await Activity.create({ type, user, details, txHash, contractId });
}
