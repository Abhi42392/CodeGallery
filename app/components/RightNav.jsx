"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

const RightNav = ({ session }) => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="flex items-center gap-4  sm:mx-4 sm:my-6 relative">
      {/* Share Work Button */}
      <Link href="/create-project">
        <button
          className="hidden sm:block border-2 border-black text-black px-3 sm:px-6 py-1 rounded-full cursor-pointer 
                     hover:bg-black hover:text-white  transition-colors duration-300"
        >
          Share work
        </button>
      </Link>

      {/* User Profile Menu */}
      <div 
        className={`px-3 sm:px-6 py-2 sm:shadow-md sm:flex sm:items-center sm:gap-2 transition-all duration-300 cursor-pointer ${
          openMenu ? "sm:rounded-t-lg" : "sm:rounded-full"
        } sm:bg-white relative`}
        onClick={() => setOpenMenu((prev) => !prev)}
      >
        <Image
          src={session.user.image}
          width={20}
          height={20}
          alt="User Avatar"
          className="rounded-full hover:scale-105 transition-transform duration-300 max-sm:h-8  max-sm:w-8"
          
        />

        <div className="hidden sm:flex items-center gap-1" >
          <p className="text-sm text-gray-800 hidden sm:block">{session.user.name}</p>
          {openMenu ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4 transition-transform duration-300 rotate-180"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 15.75L12 8.25l7.5 7.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4 transition-transform duration-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25L12 15.75 4.5 8.25"
              />
            </svg>
          )}
        </div>

        {/* Dropdown Menu */}
        <div
          className={`absolute top-full right-0 sm:left-0 w-fit sm:w-full  bg-white z-10 shadow-md rounded-b-md px-6 py-2 transition-all duration-300 origin-top transform ${
            openMenu ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
          }`}
          style={{ transformOrigin: "top" }}
        >
          <Link href="/my-profile">
            <p className="text-gray-700 py-2 whitespace-nowrap hover:text-black cursor-pointer transition-colors">
              My Profile
            </p>
          </Link>
          
          <Link href="/create-project">
            <p
            className="text-gray-700 pb-2 hover:text-black cursor-pointer transition-colors whitespace-nowrap"
          >
            Share Work
          </p>
          </Link>
          <p
            className="text-gray-700 pb-2 hover:text-black cursor-pointer transition-colors"
            onClick={() => signOut()}
          >
            Logout
          </p>
        </div>
      </div>
    </div>
  );
};

export default RightNav;
