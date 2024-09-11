module Aptos_NFT::main {
    use aptos_framework::event;
    use aptos_framework::object::{Self, ExtendRef, Object};
    use aptos_token_objects::collection;
    use aptos_token_objects::token::{Token, Self};
    use aptos_token_objects::royalty;
    use std::option;
    use std::signer;
    use std::signer::address_of;
    use std::string::{String, utf8};

    /// AptosNFT not exist at given address
    const EAPTOSNFT_NOT_EXIST: u64 = 1;

    const APP_OBJECT_SEED: vector<u8> = b"APTOS NFT";
    const APTOSNFT_COLLECTION_NAME: vector<u8> = b"Aptos NFT Collection";
    const APTOSNFT_COLLECTION_DESCRIPTION: vector<u8> = b"Aptos NFT Collection Description";
    const APTOSNFT_COLLECTION_URI: vector<u8> = b"https://amethyst-implicit-silkworm-944.mypinata.cloud/ipfs/QmVRPDuHWJxziBDXFys4x4pWyFtfNbAURFpgoUxDf1Lkoz";

    struct Attributes has copy, drop, key, store {
        category: String,
        description: String,
        image: String,
    }

    struct AptosNFT has key {
        attributes: Attributes,
        extend_ref: ExtendRef,
        mutator_ref: token::MutatorRef,
        burn_ref: token::BurnRef,
    }

    #[event]
    struct MintAptosNFTEvent has drop, store {
        aptosnft_address: address,
        token_name: String,
    }

    // Tokens require a signer to create, so this is the signer for the collection
    struct CollectionCapability has key {
        extend_ref: ExtendRef,
    }

    // This function is only called once when the module is published for the first time.
    fun init_module(account: &signer) {
        let constructor_ref = object::create_named_object(
            account,
            APP_OBJECT_SEED,
        );
        let extend_ref = object::generate_extend_ref(&constructor_ref);
        let app_signer = &object::generate_signer(&constructor_ref);

        move_to(app_signer, CollectionCapability {
            extend_ref,
        });

        create_aptosnft_collection(app_signer);
    }

    fun get_collection_address(): address {
        object::create_object_address(&@Aptos_NFT, APP_OBJECT_SEED)
    }

    fun get_collection_signer(collection_address: address): signer acquires CollectionCapability {
        object::generate_signer_for_extending(&borrow_global<CollectionCapability>(collection_address).extend_ref)
    }

    fun get_aptosnft_signer(aptosnft_address: address): signer acquires AptosNFT {
        object::generate_signer_for_extending(&borrow_global<AptosNFT>(aptosnft_address).extend_ref)
    }

    // Create the collection that will hold all the Aptogotchis
    fun create_aptosnft_collection(creator: &signer) {
        let description = utf8(APTOSNFT_COLLECTION_DESCRIPTION);
        let name = utf8(APTOSNFT_COLLECTION_NAME);
        let uri = utf8(APTOSNFT_COLLECTION_URI);

        collection::create_unlimited_collection(
            creator,
            description,
            name,
            option::none(),
            uri,
        );
    }

    // Create an AptosNFT token object.
    entry fun create_aptosnft(user: &signer, name: String, category: String, description: String, image: String) acquires CollectionCapability {
        let user_addr = signer::address_of(user);
        let uri = utf8(APTOSNFT_COLLECTION_URI);
        let collection_description = utf8(APTOSNFT_COLLECTION_DESCRIPTION);
        let royalty_numerator = 5;
        let royalty_denominator = 100;
        let royalty = royalty::create(royalty_numerator, royalty_denominator, user_addr);
        let attributes = Attributes {
            category,
            description,
            image,
        };

        let collection_address = get_collection_address();
        let constructor_ref = &token::create(
            &get_collection_signer(collection_address),
            utf8(APTOSNFT_COLLECTION_NAME),
            collection_description,
            name,
            option::some(royalty),
            uri,
        );

        let token_signer_ref = &object::generate_signer(constructor_ref);

        let extend_ref = object::generate_extend_ref(constructor_ref);
        let mutator_ref = token::generate_mutator_ref(constructor_ref);
        let burn_ref = token::generate_burn_ref(constructor_ref);
        let transfer_ref = object::generate_transfer_ref(constructor_ref);

        // Initialize and set default AptosNFT struct values
        let aptosnft = AptosNFT {
            attributes,
            extend_ref,
            mutator_ref,
            burn_ref,
        };
        move_to(token_signer_ref, aptosnft);

        // Emit event for minting AptosNFT token
        event::emit(
            MintAptosNFTEvent {
                aptosnft_address: address_of(token_signer_ref),
                token_name: name,
            },
        );

        // Transfer the AptosNFT to the user
        object::transfer_with_ref(object::generate_linear_transfer_ref(&transfer_ref), address_of(user));
    }

    // Get collection name of AptosNFT collection
    #[view]
    public fun get_aptosnft_collection_name(): (String) {
        utf8(APTOSNFT_COLLECTION_NAME)
    }

    // Get creator address of AptosNFT collection
    #[view]
    public fun get_aptosnft_collection_creator_address(): (address) {
        get_collection_address()
    }

    // Get collection ID of AptosNFT collection
    #[view]
    public fun get_aptosnft_collection_address(): (address) {
        let collection_name = utf8(APTOSNFT_COLLECTION_NAME);
        let creator_address = get_collection_address();
        collection::create_collection_address(&creator_address, &collection_name)
    }

    // Returns all fields for this AptosNFT (if found)
    #[view]
    public fun get_aptosnft(aptosnft_obj: Object<Token>): (String, Attributes) acquires AptosNFT {
        let aptosnft_address = object::object_address(&aptosnft_obj);
        assert!(object::object_exists<Token>(aptosnft_address), EAPTOSNFT_NOT_EXIST);
        let aptosnft = borrow_global<AptosNFT>(aptosnft_address);
        (token::name<Token>(aptosnft_obj), aptosnft.attributes)
    }
}