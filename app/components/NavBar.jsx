import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { NavLinks } from '../constants/data'
import AuthProvider from './AuthProvider'

const NavBar = () => {
  const session=false;
  const createNavLink=(data,i)=>{
    return (
    <Link key={i}href={data.href}>
      {data.text}
    </Link>
    )
  }
  return (
    <nav className='flex items-center'>
      <div className='flex flex-1 gap-10 m-2 sm:mx-4 sm:my-6 '>
        <Link href="/">
          <h1 className='text-2xl font-bold'>Code Gallery</h1>
        </Link>
        <ul className='lg:flex hidden items-center text-sm gap-4'>
          {NavLinks.map((data,i)=>(createNavLink(data,i)))}
        </ul>
      </div>
      <div>
          <AuthProvider />
      </div>
    </nav>
  )
}

export default NavBar