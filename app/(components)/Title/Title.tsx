"use client";
import React from "react";
import Divider from '@mui/material/Divider';

// Internal Import
import Style from "./Title.module.css";

interface TitleProps {
    heading: string
    paragraph: string
}

const Title: React.FC<TitleProps> = ({heading, paragraph}) => {
    return (
        <div className={Style.title}>
            <div className={Style.title_box}>
                <h2>{heading}</h2>
                <p>{paragraph}</p>
                <Divider orientation="horizontal" variant="fullWidth" className='bg-white mb-6 mt-8'/>
            </div>
        </div>
    )
};

export default Title;