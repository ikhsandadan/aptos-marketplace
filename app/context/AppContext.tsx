"use client";
import {
    useWallet,
    InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import {
    Account,
    AccountAddress,
    AnyNumber,
    Aptos,
    AptosConfig,
    InputViewFunctionData,
    Network,
    NetworkToNetworkName,
    Ed25519PrivateKey 
} from "@aptos-labs/ts-sdk";
import axios from 'axios';
import { FC, ReactNode, useState, useContext, createContext } from "react";
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { AlertProvider, useAlert } from "../provider/AlertProvider";
import { AutoConnectProvider } from "../provider/AutoConnectProvider";
import { WalletContext } from "./WalletContext";
import { UserContextProvider } from "./UserContext";

export const ADMIN_PRIVATEKEY = process.env.NEXT_PUBLIC_ADMIN_PRIVATEKEY;

const theme = createTheme({
    palette: {
        primary: {
        main: "#000000",
        },
        secondary: {
        main: "#FFFFFF",
        },
    },
});

interface UploadResponse {
    url: string;
};

export interface NFT {
    name: string;
    image: string;
    description: string;
    category: string;
};

export interface NFTInfo {
    name: string;
    address: string;
};

interface ListedNft {
    name?: string;
    image?: string;
    category?: string;
    description?: string;
    price?: number;
    listingObjectAddress?: string;
    nftAddress?: string;
    sellerAddress?: string;
};

interface AppContextState {
    aptos: any;
    adminAccount: Account | null;
    myBalance: number;
    nftCollectionAddress: string | null;
    myNft: any[];
    ownedNfts: any[];
    allNfts: any[];
    listedNfts: any[];
    setAdminAccount: (admin: Account) => void;
    fetchAdminAccount: (adminPrivateKey: string) => Promise<Account>;
    fetchBalance: (accountAddress: AccountAddress, versionToWaitFor?: bigint | undefined) => Promise<void>;
    uploadImageToIPFS: (formData: FormData) => Promise<string>;
    handleMintNft: (admin: Account, accountAddress: AccountAddress, nft: NFT) => Promise<string>;
    fetchNftCollectionAddress: (admin: Account) => Promise<void>;
    getUserOwnedNft: (ownerAddr: string) => Promise<any>;
    getNft: (admin: Account, nftAddress: string) => Promise<any>;
    handleListNft: (admin: Account, account: AccountAddress, nftObjectAddress: any, price: string) => Promise<string>;
    getAllNfts: () => void;
    getAllSellers: (admin: Account) => Promise<string[]>;
    getAllListedNfts: (admin: Account) => void;
    handlePurchaseNft: (admin: Account, account: AccountAddress, nft: any) => Promise<string>;
};

export const AppContexts = createContext<AppContextState | undefined>(
    undefined
);

export function useAppContext(): AppContextState {
    const context = useContext(AppContexts);
    if (!context)
        throw new Error("useAppContext must be used within an AppContextProvider");
    return context;
};

const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [adminAccount, setAdminAccount] = useState<Account | null>(null);
    const APT = "0x1::aptos_coin::AptosCoin";
    const APT_UNIT = 100_000_000;
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);
    const {
        signAndSubmitTransaction,
    } = useWallet();
    const { setSuccessAlertMessage, setErrorAlertMessage, setLoadingAlertMessage, setLoadingUpdateAlertMessage } = useAlert();
    const [myBalance, setMyBalance] = useState<number>(0);
    const [nftCollectionAddress, setNftCollectionAddress] = useState<any>();
    const [myNft, setMyNft] = useState<any[]>([]);
    const [ownedNfts, setOwnedNfts] = useState<any[]>([]);
    const [allNfts, setAllNfts] = useState<any[]>([]);
    const [listedNfts, setListedNfts] = useState<any[]>([]);

    const fetchAdminAccount = async (adminPrivateKey: string) : Promise<Account> => {
        const privateKey = new Ed25519PrivateKey(adminPrivateKey);
        const account = await Account.fromPrivateKey({ privateKey });

        return account;
    };

    const fetchBalance = async (accountAddress: AccountAddress, versionToWaitFor?: bigint | undefined) => {
        try {
            const amount = await aptos.getAccountAPTAmount({
                accountAddress,
                minimumLedgerVersion: versionToWaitFor ?? undefined,
            });
            
            setMyBalance(amount / 100000000);
        } catch (error: any) {
            setErrorAlertMessage(error.message);
        }
    };

    const uploadImageToIPFS = async (formData: FormData): Promise<string> => {
        const loadingMessage = `Please wait. Uploading image...`;
        const id = setLoadingAlertMessage(loadingMessage);

        try {
            const { data } = await axios.post<UploadResponse>('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        
            setLoadingUpdateAlertMessage(id, `Successfully uploaded image!`, "success");
            return data.url;
        } catch (error: any) {
            setLoadingUpdateAlertMessage(id, `Failed to upload image!`, "error");
            return error.message;
        }
    };

    const handleMintNft = async (admin: Account, accountAddress: AccountAddress, nft: NFT) : Promise<string> => {
        const loadingMessage = `Please wait. Minting Item...`;
        const id = setLoadingAlertMessage(loadingMessage);

        try {
            const txnMint = await mintNft(id, admin, accountAddress, nft); 
            if (txnMint === "Error") {
                setLoadingUpdateAlertMessage(id, "Failed to mint NFT. Please try again later", "error");
                await fetchBalance(accountAddress);
                return "Error";
            }

            await fetchNftCollectionAddress(admin);
            await getUserOwnedNft(accountAddress.toString());

            return txnMint;
        } catch (error: any) {
            setLoadingUpdateAlertMessage(id, "Failed to mint NFT. Please try again later", "error");
            await fetchNftCollectionAddress(admin);
            await getUserOwnedNft(accountAddress.toString());
            return "Error";
        }
    };

    const mintNft = async (id: any, admin: Account, accountAddress: AccountAddress, nft: NFT) : Promise<string> => {
        try {
            const response = await signAndSubmitTransaction({
                sender: accountAddress,
                data: {
                    function: `${admin.accountAddress}::main::create_aptosnft`,
                    typeArguments: [],
                    functionArguments: [
                        nft.name,
                        nft.category,
                        nft.description,
                        nft.image,
                    ],
                    },
            });

            await aptos.waitForTransaction({
                transactionHash: response.hash,
            });

            setLoadingUpdateAlertMessage(id, `Successfully minted ${nft.name}!. With hash ${response.hash}`, "success");

            return response.hash;
        } catch (error: any) {
            return "Error";
        }
    };

    const fetchNftCollectionAddress = async (admin: Account) => {
        try {
            let response = await aptos.view({
                payload: {
                    function: `${admin.accountAddress}::main::get_aptosnft_collection_address`,
                    functionArguments: [],
                },
            });

            setNftCollectionAddress(response[0] as any);
        } catch (error: any) {
            console.error("NFT Collection Address not found");
        }
    };

    const getUserOwnedNft = async (ownerAddr: string) => {
        const result = await aptos.getAccountOwnedTokensFromCollectionAddress({
            accountAddress: ownerAddr,
            collectionAddress: nftCollectionAddress,
        });

        setMyNft(result);
    };

    const getNft = async (admin: Account, itemObjectAddress: string) => {
        try {
            const response = await aptos.view({
                payload: {
                    function: `${admin.accountAddress}::main::get_aptosnft`,
                    typeArguments: [],
                    functionArguments: [itemObjectAddress],
                },
            });
    
            const [name, attributes] = response;
    
            const typeAttributes = attributes as { category: string, description: string, image: string};
    
            setOwnedNfts((prevNft) => {
                if (prevNft.some(nft => nft.name === name)) {
                    return prevNft;
                }
                return [
                    ...prevNft,
                    {
                        itemObjectAddress: itemObjectAddress,
                        name: name as string,
                        category: typeAttributes.category,
                        description: typeAttributes.description,
                        image: typeAttributes.image,
                    }
                ];
            });
        } catch (error: any) {
            if (error instanceof Error) {
                console.error("Error fetching nft:", error.message);
                // You might want to show this error to the user
                // setError(error.message);
            } else {
                console.error("An unknown error occurred:", error);
            }
        }
    };

    const handleListNft = async (admin: Account, account: AccountAddress, nftObjectAddress: any, price: string) : Promise<string> => {
        const loadingMessage = `Please wait. Listing NFT...`;
        const id = setLoadingAlertMessage(loadingMessage);

        try {
            const txnList = await listNft(id, admin, account, nftObjectAddress, price); 
            if (txnList === "Error") {
                setLoadingUpdateAlertMessage(id, "Failed to list NFT. Please try again later", "error");
                await getUserOwnedNft(account.toString());
                await getAllSellers(admin);
                await getAllListedNfts(admin);
                await getNft(admin, nftObjectAddress);
                return "Error";
            }

            await getUserOwnedNft(account.toString());
            await getAllSellers(admin);
            await getAllListedNfts(admin);
            await getNft(admin, nftObjectAddress);
            return txnList;
        } catch (error: any) {
            setLoadingUpdateAlertMessage(id, "Failed to list NFT. Please try again later", "error");
            await getUserOwnedNft(account.toString());
            await getAllSellers(admin);
            await getAllListedNfts(admin);
            await getNft(admin, nftObjectAddress);
            return "Error";
        }
    };

    const listNft = async (id: any, admin: Account, account: AccountAddress, nftObjectAddress: any, price: string) : Promise<string> => {
        try {
            const response = await signAndSubmitTransaction({
                sender: account,
                data: {
                    function: `${admin.accountAddress}::marketplace::list_with_fixed_price`,
                    typeArguments: [APT],
                    functionArguments: [
                        nftObjectAddress,
                        parseFloat(price) * APT_UNIT,
                    ],
                    },
            });

            await aptos.waitForTransaction({
                transactionHash: response.hash,
            });

            setLoadingUpdateAlertMessage(id, `Successfully Listed NFT!`, "success");

            return response.hash;
        } catch (error: any) {
            return "Error";
        }
    };

    const getAllNfts = async () => {
        const result: {
            current_token_datas_v2: NFTInfo[];
        } = await aptos.queryIndexer({
            query: {
                query: `
                query MyQuery($collectionId: String) {
                    current_token_datas_v2(
                    where: {collection_id: {_eq: $collectionId}}
                    ) {
                    name: token_name
                    address: token_data_id
                    }
                }
                `,
                variables: { collectionId: nftCollectionAddress },
            },
        });
        
        setAllNfts(result.current_token_datas_v2);
    };

    const getAllSellers = async (admin: Account) : Promise<string[]> => {
        const allSellers: [string[]] = await aptos.view({
            payload: {
                function: `${admin.accountAddress}::marketplace::get_sellers`,
                typeArguments: [],
                functionArguments: [],
            },
        });

        return allSellers[0];
    };

    const getAllListingObjectAddresses = async ( admin: Account, sellerAddr: string) => {
        const allListings: [string[]] = await aptos.view({
            payload: {
                function: `${admin.accountAddress}::marketplace::get_seller_listings`,
                typeArguments: [],
                functionArguments: [sellerAddr],
            },
        });

        return allListings[0];
    };

    const getListingObjectAndSeller = async (
        admin: Account,
        listingObjectAddr: string
    ): Promise<[string, string]> => {
        const listingObjectAndSeller = await aptos.view({
            payload: {
                function: `${admin.accountAddress}::marketplace::listing`,
                typeArguments: [],
                functionArguments: [listingObjectAddr],
            },
        });

        return [
            // @ts-ignore
            listingObjectAndSeller[0]["inner"] as string,
            listingObjectAndSeller[1] as string,
        ];
    };

    const getListingObjectPrice = async (
        admin: Account,
        listingObjectAddr: string
    ): Promise<number> => {
        const listingObjectPrice = await aptos.view({
            payload: {
                function: `${admin.accountAddress}::marketplace::price`,
                typeArguments: [APT],
                functionArguments: [listingObjectAddr],
            },
        });
        // @ts-ignore
        return (listingObjectPrice[0]["vec"] as number) / APT_UNIT;
    };

    const getAllListedNfts = async (admin: Account) => {
        const sellers = await getAllSellers(admin);
        if (!sellers) return;
    
        const listedNfts: ListedNft[] = [];
        const ownedNftNames = new Set(ownedNfts.map(nft => nft.name));
        const processedNfts = new Set<string>();
    
        // Process every seller
        const sellerPromises = sellers.map(async (seller: string) => {
            try {
                // Get all listing object addresses
                const listingObjectAddresses = await getAllListingObjectAddresses(admin, seller);
                if (!listingObjectAddresses) return;
    
                // Process every listing object address
                const nftPromises = listingObjectAddresses.map(async (listingObjectAddress) => {
                    try {
                        const [nftAddress, sellerAddress] = await getListingObjectAndSeller(admin, listingObjectAddress);
                        const price = await getListingObjectPrice(admin, listingObjectAddress);
                        const [name, category, description, image] = (await getListedNftInfo(admin, nftAddress)) as [string, string, string, string];
    
                        const listedNft: ListedNft = {
                            name,
                            category,
                            description,
                            image,
                            price,
                            listingObjectAddress,
                            nftAddress,
                            sellerAddress,
                        };
    
                        if (!ownedNftNames.has(name) && !processedNfts.has(listingObjectAddress)) {
                            listedNfts.push(listedNft);
                            processedNfts.add(listingObjectAddress);
                        }
    
                    } catch (error: any) {
                        console.error("Error processing listing object address:", error);
                    }
                });
    
                // Wait until itemPromises is finished
                await Promise.all(nftPromises);
    
            } catch (error) {
                console.error("Error processing seller:", seller, error);
            }
        });
    
        // Wait until sellerPromises is finished
        await Promise.all(sellerPromises);
    
        // Sort listedNfts based on price from highest to lowest
        const sortedListedNfts = listedNfts.sort((a, b) => Number(b.price) - Number(a.price));

        // Update state with sorted items
        setListedNfts(sortedListedNfts);
    };    

    const getListedNftInfo = async (admin: Account, itemObjectAddress: string) : Promise<[string, string, string, string] | undefined> => {
        try {
            const response = await aptos.view({
                payload: {
                    function: `${admin.accountAddress}::main::get_aptosnft`,
                    typeArguments: [],
                    functionArguments: [itemObjectAddress],
                },
            });
    
            const [name, attributes] = response;
    
            const typeAttributes = attributes as { category: string, description: string, image: string};
    
            return [name as string, typeAttributes.category, typeAttributes.description, typeAttributes.image];
        } catch (error: any) {
            if (error instanceof Error) {
                console.error("Error fetching nft:", error.message);
            } else {
                console.error("An unknown error occurred:", error);
            }
        }
    };

    const handlePurchaseNft = async (admin: Account, account: AccountAddress, nft: any) : Promise<string> => {
        const loadingMessage = `Please wait. Purchasing NFT...`;
        const id = setLoadingAlertMessage(loadingMessage);

        try {
            const txnPurchase = await purchaseListedNft(id, admin, account, nft); 
            if (txnPurchase === "Error") {
                setLoadingUpdateAlertMessage(id, "Failed to purchase NFT. Please try again later", "error");
                await getUserOwnedNft(account.toString());
                await getAllListedNfts(admin);
                await getNft(admin, nft.itemObjectAddress);
                return "Error";
            }

            await getUserOwnedNft(account.toString());
            await getAllListedNfts(admin);
            await getNft(admin, nft.itemObjectAddress);
            return txnPurchase;
        } catch (error: any) {
            setLoadingUpdateAlertMessage(id, "Failed to purchase NFT. Please try again later", "error");
            await getUserOwnedNft(account.toString());
            await getAllListedNfts(admin);
            await getNft(admin, nft.itemObjectAddress);
            return "Error";
        }
    };

    const purchaseListedNft = async (id: any, admin: Account, account: AccountAddress, nft: ListedNft) => {
        try {
            const response = await signAndSubmitTransaction({
                sender: account,
                data: {
                    function: `${admin.accountAddress}::marketplace::purchase`,
                    typeArguments: [APT],
                    functionArguments: [nft.listingObjectAddress],
                    },
            });

            await aptos.waitForTransaction({
                transactionHash: response.hash,
            });

            setLoadingUpdateAlertMessage(id, `Successfully Purchased ${nft.name}!`, "success");

            await getAllListedNfts(admin);
            await getUserOwnedNft(account.toString());

            return response.hash;
        } catch (error: any) {
            console.log(error);
            await getAllListedNfts(admin);
            return "Error";
        }
    };

    return (
        <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst>
        <AppContexts.Provider
        value={{ 
                aptos,
                adminAccount,
                myBalance,
                nftCollectionAddress,
                myNft,
                ownedNfts,
                allNfts,
                listedNfts,
                setAdminAccount,
                fetchAdminAccount,
                fetchBalance,
                uploadImageToIPFS,
                handleMintNft,
                fetchNftCollectionAddress,
                getUserOwnedNft,
                getNft,
                handleListNft,
                getAllNfts,
                getAllSellers,
                getAllListedNfts,
                handlePurchaseNft,
            }}>
            {children}
        </AppContexts.Provider>
        </StyledEngineProvider>
        </ThemeProvider>
    )
};

export const AppContext: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <AlertProvider>
        <AutoConnectProvider>
        <WalletContext>
        <UserContextProvider>
            <AppContextProvider>{children}</AppContextProvider>
        </UserContextProvider>
        </WalletContext>
        </AutoConnectProvider>
        </AlertProvider>
    );
};
