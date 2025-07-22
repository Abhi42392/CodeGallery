"use client"
import React,{useRef,useCallback} from 'react'
import { useRouter } from 'next/navigation'
const Modal = ({children}) => {
    const overlay=useRef(null)
    const router=useRouter()
    const handleClick=useCallback((e)=>{
         if(e.target===overlay.current){
             router.push("/")
         }
    },[router,overlay])
  return (
    <div ref={overlay} onClick={handleClick} className='fixed inset-0  cursor-pointer bg-[rgba(0,0,0,0.7)] z-20 flex justify-center'>
        <div className='bg-white  absolute bottom-0 lg:w-[55vw] lg:h-[85vh] w-[90vw] h-[90vh] rounded-t-3xl'>{children}</div>
    </div>
  )
}

export default Modal