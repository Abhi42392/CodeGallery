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
        <div className='relative m-4  '>
            <h3 className='font-bold font-primary mt-8 ml-4 text-5xl'>Create your project</h3>
            <p className='absolute top-0 right-2 cursor-pointer' onClick={onDismiss}>X</p>
            <ProjectForm type="create" />
        </div>
    </Modal>
  )
}

export default CreateProject