import Image from "next/image";
import Link from "next/link";
import { auth } from '../../auth';
import { getProjectDetails } from "../../lib/actions/actions";
import Modal from "../../components/Modal";
import ProjectActions from "../../components/ProjectActions";
import RelatedProjects from "../../components/RelatedProjects";
import { addView } from "@/app/lib/redis/redis";

const Project = async ({ params }) => {
  const { projectId } =await params;
  const session = await auth();
  const result = await getProjectDetails(projectId);
  await addView(projectId)
  if (!result?.project) {
    return <p className="text-center text-gray-500 mt-10">Failed to fetch project info</p>;
  }

  const project = result.project;
  const {
    title,
    description,
    category,
    githubUrl,
    liveSiteUrl,
    poster,
    user,
    _id
  } = project;

  const userId = user?._id?.toString();
  const projectIdStr = _id?.toString();

  const isProjectOwner = session?.user?.id === userId;
  console.log(user?.resume?.url)

  return (
    <Modal>
      <div className="overflow-y-auto max-h-[calc(100vh-2rem)] px-4 md:px-6 pt-6 pb-22">
        {/* Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full max-w-4xl mx-auto">
          {/* Creator Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href={`/profile/${userId}`}>
              <Image
                src={user?.avatarUrl}
                width={50}
                height={50}
                alt="Creator Avatar"
                className="rounded-full object-cover"
              />
            </Link>

            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold">{title}</p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link href={`/profile/${userId}`} className="hover:text-primary-purple">
                  {user?.name}
                </Link>
                <Image src="/dot.svg" width={4} height={4} alt="dot" />
                <Link
                  href={`/?category=${category}`}
                  className="text-primary-purple font-semibold hover:underline"
                >
                  {category}
                </Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isProjectOwner && (
            <ProjectActions projectId={projectIdStr} />
          )}
        </section>

        {/* Image Section */}
        <section className="mt-10 w-full max-w-4xl mx-auto">
          <Image
            src={poster}
            alt="Project Cover"
            width={1064}
            height={798}
            className="rounded-2xl object-cover w-full max-h-[700px]"
          />
        </section>

        {/* Description & Links */}
        <section className="mt-16 text-center px-4 flex flex-col items-center">
          <p className="max-w-5xl text-lg text-gray-300">{description}</p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm font-medium">
            <Link
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary-purple flex items-center gap-1 hover:underline"
            >
              🖥 <span>GitHub</span>
            </Link>
            <Image src="/dot.svg" width={4} height={4} alt="dot" />
            <Link
              href={liveSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary-purple flex items-center gap-1 hover:underline"
            >
              🚀 <span>Live Site</span>
            </Link>
          </div>
        </section>

        {/* Divider with Avatar */}
        <section className="flex items-center justify-center w-full gap-8 mt-20">
          <span className="w-full h-0.5 bg-gray-200" />
          <Link href={`/profile/${userId}`} className="min-w-[82px] h-[82px]">
            <Image
              src={user?.avatarUrl}
              alt="Creator"
              width={82}
              height={82}
              className="rounded-full object-cover"
            />
          </Link>
          <span className="w-full h-0.5 bg-gray-200" />
        </section>

        {/* Related Projects */}
        <section className="mt-16">
          <RelatedProjects userId={userId} projectId={projectIdStr} />
        </section>
      </div>
    </Modal>
  );
};

export default Project;
