"use client";
import React, { useEffect } from 'react';
import Divider from '@mui/material/Divider';

import { useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';

import NFTCardCreation from '../(components)/NFTCardCreation';
import NFTCardProfile from '../(components)/NFTCardProfile';

const Profile = () => {
    const { adminAccount, nftCollectionAddress, myNft, ownedNfts, getUserOwnedNft, getNft } = useAppContext();
    const { userAddress } = useUserContext();

    useEffect(() => {
        const fetchData = async () => {
            if (adminAccount && nftCollectionAddress && userAddress) {
                await getUserOwnedNft(userAddress?.toString());
            }
        };

        fetchData();
    }, [adminAccount, nftCollectionAddress, userAddress]);

    useEffect(() => {
        const fetchData = async () => {
            if (myNft.length !== 0 && adminAccount) {
                myNft.map(async (nft: any) => {
                    await getNft(adminAccount, nft.token_data_id);
                })
            }
        };

        fetchData();
    }, [myNft]);

    return (
        <div style={{minHeight: '75vh'}} className='flex flex-col gap-4 items-center justify-center mt-20'>
            <div className='text-4xl font-bold'>Profile</div>
            <div className='flex flex-col gap-2 w-9/12 items-center'>
                <NFTCardCreation />
                <div className='text-2xl font-bold mt-16'>My NFTs Collection</div>
                <Divider orientation="horizontal" variant="fullWidth" className='bg-white mb-6 mt-8 w-full'/>
                <NFTCardProfile />
            </div>
        </div>
    )
};

export default Profile;