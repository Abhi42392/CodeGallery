import React from 'react'
import MyProfileForm from '../components/MyProfileForm'
import { getUserDetails} from '../lib/actions/actions';
import { auth } from '../auth';
const page = async() => {
  const session=await auth();
  const response=await getUserDetails(session.user.id)
  if(!response.success){
    return <p>Unauthorised access</p>
  }
  console.log(response.user)
  return (
    <div>
      <div className="w-full h-[150px] bg-gradient-to-b from-purple-500 to-purple-700 absolute top-0 left-0 z-[-1]"></div>
      <MyProfileForm user={response.user} />
    </div>
  )
}

export default page