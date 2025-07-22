import React from 'react';
import { githubLogIn, googleLogIn} from '../lib/actions/auth';
import Image from 'next/image';
const SignInButton=({title})=>{
  const isGoogle=title.toLowerCase()==="google"
  return (isGoogle)?(
    <form action={googleLogIn}>
      <button className='cursor-pointer'
       type='submit'>
        <Image src={"/google_logo.png"} width={25} height={25} alt='google logo'/>
      </button>
    </form>
  ):(
    <form action={githubLogIn}>
      <button className='cursor-pointer'
      type='submit'>
       <Image src={"/github_logo.png"} width={25} height={25} alt='github logo'/>
      </button>
    </form>
  )
}

export default SignInButton;
