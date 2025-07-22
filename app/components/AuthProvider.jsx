"use server"
import React from 'react'
import {auth} from "../auth"  
import Link from 'next/link'
import RightNav from './RightNav'

const AuthProvider = async() => {
  const session=await auth();

  if(session?.user){
    return(
      <div>
        <RightNav session={session}/>
      </div>
    )
  }
  return(
    <div>
      <Link href="/pages/sign-in">
        <button className='bg-purple-600 m-4 rounded-md py-1 px-4 text-white cursor-pointer'>Sign in</button>
      </Link>
    </div>
  )
}

export default AuthProvider
