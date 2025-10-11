
import Image from 'next/image'
import ProjectCard from './ProjectCard'


const ProfilePage = ({ user,projects}) =>{
  const plainUser = {
    ...user,
  _id: user._id.toString(),
};

  return(
  <section className="flex flex-col items-center max-w-7xl w-full mx-auto p-6">
    {/* User Info Section */}
    <div className="flex justify-between items-start w-full flex-col lg:flex-row gap-10">
      {/* Left Column: User Info */}
      <div className="flex flex-col items-start gap-5 w-full">
        <Image
          src={user.avatarUrl}
          width={100}
          height={100}
          className="rounded-full  max-sm:w-[80px]"
          alt="user image"
        />
        <p className="text-3xl sm:text-4xl font-bold">{user.name}</p>
        <p className="text-3xl md:text-4xl font-extrabold sm:mt-4">
          I’m Software Engineer at JSM 
        </p>
        <a 
          href={`https://mail.google.com/mail/?view=cm&to=${user.email}`} 
          target="_blank"
        >
          <button className='bg-purple-500 text-lg sm:text-2xl text-white font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-md cursor-pointer'>
            Hire me
          </button>
        </a>
        </div>
      </div>



    {/* Recent Work Section */}
    <div className="w-full mt-16 lg:mt-28">
      <p className="text-lg font-semibold mb-6">Recent Work</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects?.length > 0 ? (
    projects.map((project) => (
      <ProjectCard
        key={project._id.toString()}
        image={project.poster}
        title={project.title}
        name={plainUser.name}
        avatarUrl={plainUser.avatarUrl}
        user={plainUser} // now safe
        id={project._id.toString()}
        likesCount={project.likes}
        viewsCount={project.views}
      />
    ))
  ) : (
    <p>No projects found</p>
  )}
      </div>
    </div>
    
  </section>
  
)
}
  

export default ProfilePage
