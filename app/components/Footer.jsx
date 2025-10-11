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
    <footer className='px-6 pb-2 max-sm:mt-4'>
      <h1 className='text-2xl font-bold'>Code Gallery</h1>
      <div className='flex justify-between'>
        <p>@ 2025, Flexibble all copy rights reserved.</p>
        <p className='flex gap-2 text-gray-600'>
          <span className='text-black'>10,214</span>
          projects submitted
        </p>
      </div>
    </footer>
  )
}

export default Footer