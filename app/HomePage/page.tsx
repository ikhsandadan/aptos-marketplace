"use client";
import React from 'react';
import { useUserContext } from '../context/UserContext';
import { useAppContext } from '../context/AppContext';
import Hero from '../(components)/Hero/Hero';
import Service from '../(components)/Service/Service';
import NFTCard from '../(components)/NFTCard/NFTCard';
import Title from '../(components)/Title/Title';

const HomePage = () => {
    const { userAddress } = useUserContext();
    const {
        listedNfts,
    } = useAppContext();

    // Limit the number of NFTs displayed by 6
    const limitedListedNfts = listedNfts.slice(0, 6);

    return (
        <div style={{minHeight: '75vh'}} className='flex flex-col gap-4 items-center justify-center mt-20'>
            {userAddress ? (
                <>
                <Hero />
                <Service />
                <Title heading="Featured NFTs" paragraph="Discover the most outstanding NFTs." />
                <NFTCard listedNfts={limitedListedNfts}/>
                </>
            ) : (
                <div className='w-full flex flex-col items-center'>
                    <div className='flex flex-col items-center gap-4'>
                        <h1 className='text-3xl font-bold'>Please connect your wallet</h1>
                    </div>
                </div>
            )}
        </div>
    )
};

export default HomePage;