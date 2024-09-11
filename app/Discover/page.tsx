"use client";
import { useEffect, useState } from 'react';
import Divider from '@mui/material/Divider';

import { useAppContext } from "../context/AppContext";
import Filter from '../(components)/Filter/Filter';
import NFTCard from '../(components)/NFTCard/NFTCard';
import SideFilter from '../(components)/SideFilter';

const Discover = () => {
    const { listedNfts } = useAppContext();
    const [ filteredNfts, setFilteredNfts ] = useState<any>(listedNfts);
    const [ category, setCategory ] = useState<string>('All');
    const [ searchQuery, setSearchQuery ] = useState<string>('');
    const [ priceRange, setPriceRange ] = useState<{ min: number; max: number }>({ min: 0, max: 0 });

    useEffect(() => {
        const filterNfts = () => {
            return listedNfts.filter((nft) => {
                const matchesCategory = category === 'All' || nft.category === category;
                const matchesSearch = searchQuery === '' || nft.name.toLowerCase().includes(searchQuery.toLowerCase());
                const price = parseFloat(nft.price);
                const matchesPriceRange = 
                    (priceRange.min === 0 && priceRange.max === 0) ||
                    (priceRange.max === 0 && price >= priceRange.min) ||
                    (price >= priceRange.min && price <= priceRange.max);

                return matchesCategory && matchesSearch && matchesPriceRange;
            });
        };

        setFilteredNfts(filterNfts());
    }, [category, searchQuery, priceRange, listedNfts]);

    useEffect(() => {
        console.log(priceRange);
        console.log(filteredNfts);
    }, [priceRange, filteredNfts]);

    return (
        <div style={{minHeight: '75vh'}} className='flex flex-col gap-4 items-center justify-center mt-20'>
            <div className='text-4xl font-bold'>Discover All NFTs</div>
            <Filter category={category} setCategory={setCategory}/>
            <SideFilter setSearchQuery={setSearchQuery} setPriceRange={setPriceRange} />
            <Divider orientation="horizontal" variant="fullWidth" className='bg-white mb-6 mt-0 w-9/12'/>
            <NFTCard listedNfts={filteredNfts} />
        </div>
    )
};

export default Discover;