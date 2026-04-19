#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

mod nft_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/nft.wasm"
    );
}

mod splitter_contract {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/royalty_splitter.wasm"
    );
}

#[derive(Clone)]
#[contracttype]
pub struct Listing {
    pub seller: Address,
    pub nft_address: Address,
    pub token_id: i128,
    pub price: i128,
    pub currency: Address, // Token to pay with (e.g. XLM)
    pub splitter: Address, // Splitter contract to handle royalties
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Listing(Address, i128), // (NFTAddress, TokenID) -> Listing
}

#[contract]
pub struct Marketplace;

#[contractimpl]
impl Marketplace {
    pub fn list(env: Env, seller: Address, nft_address: Address, token_id: i128, price: i128, currency: Address, splitter: Address) {
        seller.require_auth();

        let listing = Listing {
            seller: seller.clone(),
            nft_address: nft_address.clone(),
            token_id,
            price,
            currency,
            splitter,
        };

        env.storage().persistent().set(&DataKey::Listing(nft_address.clone(), token_id), &listing);

        env.events().publish((symbol_short!("listed"), seller), (nft_address, token_id, price));
    }

    pub fn buy(env: Env, buyer: Address, nft_address: Address, token_id: i128) {
        buyer.require_auth();

        let listing: Listing = env.storage().persistent().get(&DataKey::Listing(nft_address.clone(), token_id)).expect("listing not found");

        // 1. Distribute Royalties via Splitter
        let splitter_client = splitter_contract::Client::new(&env, &listing.splitter);
        splitter_client.split(&listing.currency, &buyer, &listing.price);

        // 2. Transfer NFT
        let nft_client = nft_contract::Client::new(&env, &listing.nft_address);
        nft_client.transfer(&listing.seller, &buyer, &listing.token_id);

        // 3. Remove Listing
        env.storage().persistent().remove(&DataKey::Listing(nft_address.clone(), token_id));

        env.events().publish((symbol_short!("sold"), buyer), (nft_address, token_id, listing.price));
    }

    pub fn cancel(env: Env, seller: Address, nft_address: Address, token_id: i128) {
        seller.require_auth();

        let listing: Listing = env.storage().persistent().get(&DataKey::Listing(nft_address.clone(), token_id)).expect("listing not found");
        if listing.seller != seller {
            panic!("not seller");
        }

        env.storage().persistent().remove(&DataKey::Listing(nft_address, token_id));

        env.events().publish((symbol_short!("cancel"), seller), token_id);
    }
}
