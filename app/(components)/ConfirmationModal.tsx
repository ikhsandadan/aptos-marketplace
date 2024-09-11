"use client";
import { FC, useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Image from 'next/image';
import { CircularProgress } from '@mui/material';

import { useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    p: 2,
    bgcolor: 'primary.main',
    borderRadius: 5,
    borderColor: 'primary.secondary',
    border: '2px solid',
};

interface ConfirmationModalProps {
    open: boolean,
    nft: any,
    handleClose: () => void,
};

const ConfirmationModal: FC<ConfirmationModalProps> = ({ open, nft, handleClose }) => {
    const { userAddress } = useUserContext();
    const { adminAccount, handlePurchaseNft } = useAppContext();
    const [ isLoading, setIsloading ] = useState(false);

    const handleBuyNft = async () => {
        setIsloading(true);

        if (adminAccount && userAddress) {
            await handlePurchaseNft(adminAccount, userAddress, nft);
            setIsloading(false);
            handleClose();
        } else {
            console.log('Please connect your wallet');
            setIsloading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
        >
            <Box sx={style}>
                <div className='flex flex-col items-center max-w-[400px]'>
                    <p className='mb-4 text-lg'>Are you sure you want to buy this NFT?</p>
                    <Image 
                        src={nft?.image} 
                        alt={nft?.name} 
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: '40%', height: 'auto' }}
                    />
                    <div className='flex flex-row mt-4 gap-2'>
                        <button onClick={handleClose} className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-slate-500 hover:text-white transition ease-in-out 300ms'>
                            {isLoading ? <CircularProgress size="20px" className='text-white'/> : 'Cancel'}
                        </button>
                        <button onClick={handleBuyNft} className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-slate-500 hover:text-white transition ease-in-out 300ms'>
                            {isLoading ? <CircularProgress size="20px" className='text-white'/> : 'Confirm'}
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default ConfirmationModal;