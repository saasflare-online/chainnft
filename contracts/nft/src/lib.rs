#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, symbol_short};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Owner(i128),      // TokenID -> Owner
    Metadata(i128),   // TokenID -> URI
    Supply,           // Total minted
    Admin,            // Admin address
}

#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        let supply: i128 = 0;
        env.storage().instance().set(&DataKey::Supply, &supply);
    }

    pub fn mint(env: Env, to: Address, metadata_uri: String) -> i128 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let mut supply: i128 = env.storage().instance().get(&DataKey::Supply).unwrap_or(0);
        supply += 1;
        
        env.storage().persistent().set(&DataKey::Owner(supply), &to);
        env.storage().persistent().set(&DataKey::Metadata(supply), &metadata_uri);
        env.storage().instance().set(&DataKey::Supply, &supply);

        env.events().publish((symbol_short!("mint"), to), supply);

        supply
    }

    pub fn transfer(env: Env, from: Address, to: Address, token_id: i128) {
        from.require_auth();

        let owner: Address = env.storage().persistent().get(&DataKey::Owner(token_id)).expect("token not found");
        if owner != from {
            panic!("not owner");
        }

        env.storage().persistent().set(&DataKey::Owner(token_id), &to);
        
        env.events().publish((symbol_short!("transfer"), from, to), token_id);
    }

    pub fn owner_of(env: Env, token_id: i128) -> Address {
        env.storage().persistent().get(&DataKey::Owner(token_id)).expect("token not found")
    }

    pub fn metadata_uri(env: Env, token_id: i128) -> String {
        env.storage().persistent().get(&DataKey::Metadata(token_id)).expect("token not found")
    }
    
    pub fn supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Supply).unwrap_or(0)
    }
}

mod test;
