import Link from 'next/link';
import Image from 'next/image';
import { getUserProjects } from '../lib/actions/actions';
import { getUserDetails } from '../lib/actions/actions';

const RelatedProjects = async ({ userId, projectId }) => {
  const result = await getUserProjects(userId);
  if(!result.success){
    return <p className='font-bold text-red-500'>{result.error}</p>
  }
  const user=await getUserDetails(userId)
  const filteredProjects = result?.projects?.filter((node)=>node._id.toString()!==projectId)
  if (!filteredProjects || filteredProjects.length === 0) return null;

  return (
    <section className="flex flex-col mt-32 w-full">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">
          More by {user?.name}
        </p>
        <Link
          href={`/profile/${user?._id}`}
          className="text-primary-purple text-base hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(( node ) => (
          <div
            key={node._id}
            className="flex justify-center items-center bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300"
          >
            <Link
              href={`/project/${node?._id.toString()}`}
              className="relative w-full h-60 overflow-hidden rounded-2xl group"
            >
              <Image
                src={node?.poster}
                alt="project image"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <p className="text-white text-lg font-medium text-center px-2">
                  {node?.title}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProjects;
