"use client";
import React from "react";
import Image from "next/image";

//Internal Import
import Style from "./Hero.module.css";
import images from "@/public/images";

const Hero = () => {
    return (
        <div className={Style.hero}>
            <div className={Style.hero_box}>
                <div className={Style.hero_box_left}>
                    <h1>Discover, collect, and sell NFTs 🖼️</h1>
                    <p className="text-2xl">Aptos NFT Marketplace</p>
                </div>
                <div className={Style.hero_box_right}>
                    <Image src={images.hero} alt="Hero section" width={600} height={600} />
                </div>
            </div>
        </div>
    )
};

export default Hero;