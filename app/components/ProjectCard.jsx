"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingDots from "./LoadingDots";

const ProjectCard = ({ id, image, title,user,likesCount,viewsCount}) => {
  const [likes, setLikes] = useState(likesCount);
  const [views, setViews] = useState(viewsCount);
  const[isLiked,setIsLiked]=useState(false)
  const[loading,setLoading]=useState(true)

const getData = async () => {
  try {
    const response = await fetch(`/api/post/get-all-data/${id}`);
    const data = await response.json();

    setLikes(likesCount+data.likes);         
    setIsLiked(data.isLiked);      
    setViews(data.views)
  } catch (err) {
    console.log(err);
  }
};



  const handleLike=async()=>{
    try{
      if(isLiked){
        setIsLiked(false)
        setLikes(prev=>prev-1)
      }else{
        setIsLiked(true)
        setLikes(prev=>prev+1)
      }
       const response=await fetch(`/api/post/likes/${id}`,{
        method:"POST"
       })
       if(response.status!=200){
        throw new Error(response.error)
       }
    }catch(err){
      console.log(err)
    }
  }
 

useEffect(() => {
  getData().finally(() => setLoading(false));
}, []);

if (loading) return <LoadingDots />; 
  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden">
      <Link href={`/project/${id}`} className="relative group">
        <Image
          src={image}
          width={414}
          height={314}
          className="w-full h-64 object-contain object-center transition-transform duration-300 group-hover:scale-105"
          alt="project image"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-4 py-2 text-white text-lg font-semibold hidden group-hover:block">
          {title}
        </div>
      </Link>

      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/profile/${user._id}`}>
          <div className="flex items-center gap-2 hover:underline">
            <Image
              src={user.avatarUrl}
              width={32}
              height={32}
              className="rounded-full border"
              alt="profile image"
            />
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {user.name}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            {isLiked?(<Image src="/hearth-purple.svg" width={16} height={16} alt="heart" onClick={handleLike} />):
            (<Image src="/hearth.svg" width={16} height={16} alt="heart" onClick={handleLike} />)}
            <p className="text-sm">{likes}</p>
          </div>
          <div className="flex items-center gap-1">
            <Image src="/eye.svg" width={16} height={16} alt="eye" />
            <p className="text-sm">{views}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
