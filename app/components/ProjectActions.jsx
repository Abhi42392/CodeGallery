'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { deleteProject} from '../lib/actions/actions';

const ProjectActions = ({ projectId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
     if(!confirm("Do you really want to delete?")){
      return;
     }
      const res=await deleteProject(projectId);
      if(res.success){
        router.push('/');
      }else{
        throw new Error('Failed to delete project try again')
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Link
        href={`/edit-project/${projectId}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 transition"
      >
        <Image src="/pencile.svg" width={15} height={15} alt="edit"  />
      </Link>

      <button
        type="button"
        disabled={isDeleting}
        onClick={handleDeleteProject}
        className={`flex items-center justify-center w-10 cursor-pointer h-10 rounded-full transition text-white ${
          isDeleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        <Image src="/trash.svg" width={15} height={15} alt="delete" />
      </button>
    </div>
  );
};

export default ProjectActions;
