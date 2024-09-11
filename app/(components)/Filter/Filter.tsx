"use client";
import { useState, FC, useEffect } from "react";

// Internal Import
import Style from "./Filter.module.css";

interface FilterProps {
    category: string;
    setCategory: (category: string) => void;
};

const Filter: FC<FilterProps> = ({ category, setCategory }) => {
    const [selected, setSelected] = useState<string | null>(category);

    const handleSelect = (category: string) => {
        setSelected(category);
        setCategory(category);
    };

    useEffect(() => {
        setSelected(category);
    }, [category]);

    return (
        <div className={Style.filter}>
            <div className={Style.filter_box}>
                <div className={Style.filter_box_left}>
                    <button
                        onClick={() => handleSelect('All')}
                        className={`${selected === 'All' ? 'bg-slate-800 text-white' : 'bg-slate-400 text-white'} rounded-full`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleSelect('Artwork')}
                        className={`${selected === 'Artwork' ? 'bg-slate-800 text-white' : 'bg-slate-400 text-white'} rounded-full`}
                    >
                        Artwork
                    </button>
                    <button
                        onClick={() => handleSelect('Meme')}
                        className={`${selected === 'Meme' ? 'bg-slate-800 text-white' : 'bg-slate-400 text-white'} rounded-full`}
                    >
                        Meme
                    </button>
                    <button
                        onClick={() => handleSelect('Photography')}
                        className={`${selected === 'Photography' ? 'bg-slate-800 text-white' : 'bg-slate-400 text-white'} rounded-full`}
                    >
                        Photography
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Filter;