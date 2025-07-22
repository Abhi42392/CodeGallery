import { getUserDetails, getUserProjects } from '../../lib/actions/actions'
import ProfilePage from '../../components/ProfilePage'

const UserProfile = async ({ params }) => {
  const { profileId } =await params;
  const result1=await getUserDetails(profileId)
  const result2=await getUserProjects(profileId)
  if (!result1?.success) {
    return (
      <p className="font-black text-3xl my-2 text-red">Failed to fetch user info</p>
    )
  }

  return <ProfilePage user={result1.user} projects={result2.projects}/>
}

export default UserProfile
