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
//Clean data is the data after removing complex or non serializable data
  const user = JSON.parse(JSON.stringify(result1?.user));
  const projects = JSON.parse(JSON.stringify(result2?.projects));

  return <ProfilePage user={user} projects={projects} />
}

export default UserProfile
