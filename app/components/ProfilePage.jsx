import Image from 'next/image'
import ProjectCard from './ProjectCard'


const ProfilePage = ({ user,projects}) =>{
  const userData = {
    ...user,
    _id: user._id.toString(),
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const calculateDuration = (startDate, endDate, isCurrent) => {
    if (!startDate) return "";
    
    const start = new Date(startDate);
    const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : null);
    
    if (!end) return "";
    
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();
    
    if (end.getDate() < start.getDate()) {
      months--;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    let duration = "";
    if (years > 0) {
      duration += `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    if (remainingMonths > 0) {
      if (duration) duration += ", ";
      duration += `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
    
    return duration || "Less than a month";
  };


  return(
  <section className="flex flex-col items-center max-w-7xl w-full mx-auto p-6">
    {/* User Info Section */}
    <div className="flex justify-between items-start w-full flex-col lg:flex-row gap-10">
      {/* Left Column: User Info */}
      <div className="flex flex-col items-start gap-5 w-full">
        <Image
          src={user.avatarUrl}
          width={200}
          height={200}
          className="rounded-md w-[150px] sm:w-[200px]"
          alt="user image"
        />
        <p className="text-3xl sm:text-4xl font-bold">{user.name}</p>
        <p>
          {userData.headline}
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
      {/*About me */}
      <Section
          title="About Me"
        >
          <p className="text-gray-800 text-sm whitespace-pre-wrap">
              {userData.about || "Tell us about yourself"}
            </p>
        </Section>

        {/*Contact Details*/}
        <Section
          title="Contact Details"
        >
              <p className="text-gray-800 text-sm">
                {userData.phone || "Add your phone number here..."}
              </p>
              <p className="text-gray-800 text-sm">{userData.email || "Email"}</p>
        </Section>

        <Section
          title="Organizations"
        >
          {userData.organizations.map((org, idx) => (
            <div key={idx} className="border border-purple-200 rounded-lg p-4 bg-gray-50">
              
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="font-semibold text-gray-800">{org.name || "Organization Name"}</h3>
                    {org.isCurrent && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Current</span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm mb-1">{org.jobTitle || "Job Title"}</p>
                  {(org.startDate || org.endDate) && (
                    <p className="text-gray-600 text-xs">
                      {formatDate(org.startDate)} - {org.isCurrent ? "Present" : formatDate(org.endDate)}
                      {org.startDate && (org.endDate || org.isCurrent) && (
                        <span className="ml-2 text-purple-600">
                          ({calculateDuration(org.startDate, org.endDate, org.isCurrent)})
                        </span>
                      )}
                    </p>
                  )}
                </div>
            </div>
          ))}
        </Section>

        <Section
          title="Portfolio"
        >
          {userData.portfolio.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <p className="w-1/4 max-sm:px-1 px-3 max-sm:py-1 py-2 rounded-md border border-purple-200 bg-gray-50 max-sm:text-xs">
                  {item.site}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 max-sm:px-1 px-3 max-sm:py-1 max-sm:text-xs py-2 rounded-md border border-purple-200 bg-gray-50 text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  {item.url}
                </a>
              </div>
            ))}
        </Section>


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
        name={userData.name}
        avatarUrl={userData.avatarUrl}
        user={userData} // now safe
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
  
const Section = ({ title, children }) => (
  <div className="px-3 sm:px-6 pb-3 sm:pb-6 sm:pt-2 pt-4 rounded-xl shadow-md  bg-white relative mt-6 max-lg:w-[90vw] w-full">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h1>
      <div  className="cursor-pointer">
      </div>
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

export default ProfilePage
