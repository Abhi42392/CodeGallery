
import PostsFilter from './components/PostsFilter';

async function getProjects() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/get-all-posts`);
  const data = await res.json();
  return data.data;
}

export default async function Home() {
  const projects = await getProjects();
  console.log(projects)
  return (
    <div className='my-4 sm:my-8'>
      <PostsFilter posts={projects}/>
    </div>
  );
}
