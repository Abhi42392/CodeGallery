"use client"
import React, { useCallback, useEffect, useState} from 'react'
import Modal from '../components/Modal'
import { useRouter} from "next/navigation"
import ProjectForm from '../components/ProjectForm'

const CreateProject = () => {
    
    const router=useRouter();
    const onDismiss=useCallback(()=>{
        router.push("/")
    },[router])
    
  return (
    <Modal>
        <div className='relative sm:m-4 '>
            <h3 className='font-bold font-primary mt-4 sm:mt-8 mx-3 text-3xl sm:text-5xl'>Create your project</h3>
            <p className='absolute -top-2 right-3 cursor-pointer' onClick={onDismiss}>X</p>
            <ProjectForm type="create" />
        </div>
    </Modal>
  )
}

export default CreateProject