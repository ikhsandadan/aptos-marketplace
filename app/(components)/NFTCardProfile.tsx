"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

import { useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';

const NFTCardProfile = () => {
    const { adminAccount, ownedNfts, listedNfts, handleListNft } = useAppContext();
    const { userAddress } = useUserContext();
    const [ showPrices, setShowPrices ] = useState<{ [key: string]: boolean }>({});
    const [ price, setPrice ] = useState("");
    const [ isLoading, setIsLoading ] = useState(false);
    const [ myListedNfts, setMyListedNfts ] = useState<any[]>([]);

    const handleListButton = (nftName: string) => {
        setShowPrices(prev => ({ ...prev, [nftName]: true }));
    };

    const handleListNftButton = async (nftName: string, nftObjectAddress: any) => {
        setIsLoading(true);
        
        if (adminAccount && userAddress) {
            try {
                await handleListNft(adminAccount, userAddress, nftObjectAddress, price);
                setIsLoading(false);
                setShowPrices(prev => ({ ...prev, [nftName]: false }));

                window.location.reload();
            } catch (error: any) {
                console.log(error);
                setIsLoading(false);
                setShowPrices(prev => ({ ...prev, [nftName]: false }));
            }
        } else {
            setIsLoading(false);
            setShowPrices(prev => ({ ...prev, [nftName]: false }));
        }
    };

    const handleCancelButton = (nftName: string) => {
        setShowPrices(prev => ({ ...prev, [nftName]: false }));
    };

    useEffect(() => {
        if (listedNfts.length > 0 && userAddress) {
            const myNfts = listedNfts.filter((nft: any) => nft.sellerAddress === userAddress.toString());
            setMyListedNfts(myNfts);
        }
    }, [listedNfts, userAddress]);

    return (
        <div className='w-full flex flex-col items-center'>
        {ownedNfts.length > 0 ? (
            <div className='h-full flex flex-row flex-wrap gap-4 justify-center'>
            {ownedNfts.map((nft: any, index: number) => (
                <Card sx={{ width: 345 }} key={index} className='flex flex-col'>
                    <CardMedia
                        sx={{ height: "60vh" }}
                        image={nft.image}
                        title={nft.name}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h4" component="div">
                            {nft.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {nft.description}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {nft.category}
                        </Typography>
                        <Link
                            href={`https://explorer.aptoslabs.com/object/${nft.itemObjectAddress}?network=testnet`}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="hover:text-blue-700 cursor-pointer"
                        >
                            <p className='text-sm'>View on Aptos Explorer</p>
                        </Link>
                    </CardContent>
                    <CardActions>
                        {!isLoading ? (
                            <>
                            {showPrices[nft.name] ? (
                                <div className='flex flex-row place-content-center'>
                                    <Button
                                        size="small"
                                        className='ml-2 mb-2 bg-slate-500 text-white hover:bg-white hover:text-slate-500 transition ease-in-out 300ms'
                                        sx={{ border: '1px solid #64748b', rounded: '5px'}}
                                        onClick={() => handleListNftButton(nft.name, nft.itemObjectAddress)}
                                    >
                                        List
                                    </Button>
                                    <Button
                                        size="small"
                                        className='ml-2 mb-2 mr-6 bg-red-500 text-white hover:bg-white hover:text-red-500 transition ease-in-out 300ms'
                                        sx={{ border: '1px solid #64748b', rounded: '5px'}}
                                        onClick={() => handleCancelButton(nft.name)}
                                    >
                                        Cancel
                                    </Button>
                                    <TextField
                                        id={`price-input-${nft.name}`}
                                        label="Price in APT"
                                        type="number"
                                        variant="standard"
                                        slotProps={{
                                            inputLabel: {
                                            shrink: true,
                                            },
                                        }}
                                        defaultValue={0}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <Button
                                    size="small"
                                    className='ml-2 mb-2 bg-slate-500 text-white hover:bg-white hover:text-slate-500 transition ease-in-out 300ms'
                                    sx={{ border: '1px solid #64748b', rounded: '5px'}}
                                    onClick={() => handleListButton(nft.name)}
                                >
                                    List
                                </Button>
                            )}
                            </>
                        ) : (
                            <CircularProgress size="25px" className='text-black mb-2 ml-2'/>
                        )}
                    </CardActions>
                </Card>
            ))}
            </div>
        ) : (
            <Typography variant="body2" className='text-white text-xl'>
                No NFTs owned.
            </Typography>
        )}

        <div className='text-2xl font-bold mt-20'>My Listed NFTs</div>
        <Divider orientation="horizontal" variant="fullWidth" className='bg-white mb-6 mt-8 w-full'/>

        {myListedNfts.length > 0 ? (
            <div className='h-full flex flex-row flex-wrap gap-4 justify-center'>
            {myListedNfts.map((nft: any, index: number) => (
                <Card sx={{ width: 345 }} key={index} className='flex flex-col'>
                    <CardMedia
                        sx={{ height: "60vh" }}
                        image={nft.image}
                        title={nft.name}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h4" component="div">
                            {nft.name}
                        </Typography>
                        <Typography gutterBottom variant="h6" component="div">
                            {nft.price} APT
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {nft.description}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {nft.category}
                        </Typography>
                        <Link
                            href={`https://explorer.aptoslabs.com/object/${nft.nftAddress}?network=testnet`}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="hover:text-blue-700 cursor-pointer"
                        >
                            <p className='text-sm'>View on Aptos Explorer</p>
                        </Link>
                    </CardContent>
                </Card>
            ))}
            </div>
        ) : (
            <Typography variant="body2" className='text-white text-xl'>
                No Listed NFTs.
            </Typography>
        )}
        </div>
    );
};

export default NFTCardProfile;