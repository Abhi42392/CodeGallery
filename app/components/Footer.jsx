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
    <footer className='px-6 py-2 '>
      <div className='my-2'>
        <Image src={"/logo-purple.svg"} width={114} height={43} alt="this "/>
        <p className='mt-5'>Flexibble is the worlds leading community for<br/>creators to show, grow, and get hired</p>
      </div>
      <div className='flex flex-wrap md:justify-between gap-12 mt-5 '>
        {createFooterLink(footerLinks[0])}
        <div>
          {createFooterLink(footerLinks[1])}
          {createFooterLink(footerLinks[2])}
        </div>
        {createFooterLink(footerLinks[3])}
        {createFooterLink(footerLinks[4])}
        {createFooterLink(footerLinks[5])}
        {createFooterLink(footerLinks[6])}
      </div>
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