import { redirect } from "next/navigation";

import Modal from "../../components/Modal";
import ProjectForm from "../../components/ProjectForm";
import { getProjectDetails } from "../../lib/actions/actions";
import {auth} from '../../auth'
const EditProject = async ({ params }) => {
  const { projectId } = await params;
  const session=await auth()

  if(!session){
   redirect("/")
  }

  const result = await getProjectDetails(projectId);
  
  if (!result?.project) {
    return (
      <p className="text-gray-600">Failed to fetch project info</p>
    );
  }
  const plainProject={
      _id:result.project._id.toString(),
      title:result.project.title,
      description:result.project.description,
      liveSiteUrl:result.project.liveSiteUrl,
      githubUrl:result.project.githubUrl,
      category:result.project.category,
      poster:result.project.poster
  }
  return (
    <Modal>
      <h3 className="font-bold text-4xl">Edit Project</h3>
      <ProjectForm type="edit"  project={plainProject} />
      
    </Modal>
  );
};

export default EditProject;
