"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const CustomMenu = ({ title, state, filters, setState }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelection = (value) => {
        setState(value);
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col w-full  relative  mx-4 " ref={dropdownRef}>
            <label htmlFor={title} className="w-full my-2">{title}</label>
            <div className="relative w-full max-w-[200px]">
                <button
                    type="button"
                    className="flex  w-full"
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    {state || 'Category'}
                    <Image
                        src="/arrow-down.svg"
                        width={10}
                        height={5}
                        alt="arrow down"
                        className="ml-4"
                    />
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-2 w-full flexStart custom_menu-items bg-[#ffffff] border border-gray-400 rounded-md shadow-lg">
                        {filters.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                value={tag}
                                className="custom_menu-item w-full text-left px-4 py-2 hover:text-white hover:bg-gray-600"
                                onClick={() => handleSelection(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomMenu;
