import React from 'react'
import { footerLinks } from '../constants/data'
import Link from 'next/link'
import Image from 'next/image'
const Footer = () => {

  const createFooterLink=(data)=>{
    return(
      <div>
        <h1 className='font-bold'>{data.title}</h1>
        <ul className='my-1 flex flex-col gap-2'>
          {data.links.map((link)=>{
            return (<Link key={link} href={link} className='text-sm'>{link}</Link>)
          })}
        </ul>
      </div>
    )
  }

  return (
    <footer className='px-3 sm:px-6 pb-2 py-2 mt-4 sm:mt-8 bg-black text-white'>
      <div className=''>
        <h1 className='text-xl sm:text-2xl font-bold'>Code Gallery</h1>
        <p className='max-sm:text-xs text-gray-200'>Show your work to the world</p>
      </div>
    </footer>
  )
}

export default Footer