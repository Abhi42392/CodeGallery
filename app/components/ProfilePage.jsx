import Image from 'next/image'
import Link from 'next/link'
import Button from './Button'
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
          className="rounded-full"
          alt="user image"
        />
        <p className="text-4xl font-bold">{user.name}</p>
        <p className="text-3xl md:text-5xl font-extrabold max-w-lg mt-4">
          I’m Software Engineer at JSM 👋
        </p>

        <div className="flex gap-4 mt-6 flex-wrap">
          
          <a
            href={user?.resume?.url}
            download="resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            

            <Button
              title="Resume"
              leftIcon="/download_icon.png"
              bgColor="bg-gray-200"
              textColor="text-black"
            />
          </a>

          <Link href={`mailto:${user.email}`}>
            <Button title="Hire Me" leftIcon="/email.svg" />
          </Link>
        </div>
      </div>

      {/* Right Column: Featured Project Image */}
      <div className="w-full flex justify-center lg:justify-end">
        <Image
          src={
             '/profile-post.png'
          }
          alt="project image"
          width={739}
          height={554}
          className="rounded-xl object-contain"
        />
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
