"use client";
import { useState,FC } from "react";
import { BsImages } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";

import Style from "./NFTCard.module.css";
import ConfirmationModal from "../ConfirmationModal";

interface NFTCardProps {
    listedNfts: any;
};

const NFTCard : FC<NFTCardProps> = ({listedNfts}) => {
    const [openModal, setOpenModal] = useState(false);
    const [selectedNft, setSelectedNft] = useState<any>();

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleOpenModal = (nft: any) => {
        setSelectedNft(nft);
        setOpenModal(true);
    };

    return (
        <div className="flex items-center">
            {listedNfts.length > 0 ? (
                <div className={Style.NFTCard}>
                {listedNfts.map((nft: any, i: number) => (
                    <div className={`${Style.NFTCard_box} cursor-pointer`} key={i + 1} onClick={() => handleOpenModal(nft)}>
                        <div className={Style.NFTCard_box_img}>
                            <Image src={nft.image} alt={nft.name} width={600} height={600} className={Style.NFTCard_box_img_img} />
                        </div>
    
                        <div className={Style.NFTCard_box_update}>
                            <div className={Style.NFTCard_box_update_right}>
                                <div className={Style.NFTCard_box_update_right_info}>
                                    <small>{nft.price} APT</small>
                                </div>
                            </div>
                        </div>
    
                        <div className={Style.NFTCard_box_update_details}>
                            <div className={Style.NFTCard_box_update_details_name}>
                                <div className={Style.NFTCard_box_update_details_name_box}>
                                    <h4>{nft.name}</h4>
                                    <h2 className="mt-4 text-sm">{nft.category}</h2>
                                    <Link
                                        href={`https://explorer.aptoslabs.com/object/${nft.nftAddress}?network=testnet`}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        className="hover:text-blue-700 cursor-pointer"
                                    >
                                        <p className='text-sm'>View on Aptos Explorer</p>
                                    </Link>
                                </div>
                            </div>
                            <div className={Style.NFTCard_box_update_details_category}>
                                <BsImages />
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <h1 className="text-3xl font-bold text-white text-center">No NFTs Listed</h1>
            )}

            <ConfirmationModal open={openModal} nft={selectedNft} handleClose={handleCloseModal} />
        </div>
    )
};

export default NFTCard;