"use client";
import React, { useState, FC } from "react";
import { FaSearch } from "react-icons/fa";

interface SideFilterProps {
    setSearchQuery: (query: string) => void;
    setPriceRange: (range: { min: number; max: number }) => void;
};

const SideFilter: FC<SideFilterProps> = ({ setSearchQuery, setPriceRange }) => {
    const [searchQuery, setSearchQueryState] = useState<string>("");
    const [priceRange, setPriceRangeState] = useState<{ min: number; max: number }>({ min: 0, max: 0 });

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQueryState(query);
        setSearchQuery(query);
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, type: "min" | "max") => {
        const value = Number(event.target.value);
        const newPriceRange = { ...priceRange, [type]: value };
        setPriceRangeState(newPriceRange);
        setPriceRange(newPriceRange);
    };

    return (
        <div className='flex flex-row gap-12 justify-between w-full px-40'>
            <div className='flex flex-row items-center gap-2 ml-8'>
                <FaSearch />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className="rounded-md text-black pl-2 py-1"
                />
            </div>
            <div className='flex flex-col mr-8 gap-2'>
                <h3>Price Range</h3>
                <div className='flex flex-row'>
                    <label>
                        Min:
                        <input
                            type="number"
                            value={priceRange.min}
                            step={0.01}
                            onChange={(e) => handlePriceChange(e, "min")}
                            className="mr-6 ml-2 rounded-md text-black pl-2 py-1"
                        />
                    </label>
                    <label>
                        Max:
                        <input
                            type="number"
                            value={priceRange.max}
                            step={0.01}
                            onChange={(e) => handlePriceChange(e, "max")}
                            className="ml-2 rounded-md text-black pl-2 py-1"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SideFilter;