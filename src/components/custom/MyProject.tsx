import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ArrowUpRightIcon, FolderIcon } from "lucide-react";
import type { Project } from "@/Workspace/project/Outline";
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { firebaseDb } from "./../../../config/FirebaseConfig";
import { useUser } from "@clerk/clerk-react";
import { sync, time } from "motion/react";
import PPT_ICON from './../../assets/ppt.png';
import moment from "moment";
import { Link } from "react-router-dom";

function MyProject() {

  const [projects,setProjects]=useState<Project[]>([]);
  const {user} = useUser();
  const formatDate=(Timestamp:any)=>{
    const formatDate=moment(Timestamp).fromNow();
    return formatDate;
  }

  useEffect(()=>{
    user&&GetProjects();
  },[user])

  const GetProjects = async()=>{
     const q = query(collection(firebaseDb,  "projects"), where("createdBy", "==", user?.primaryEmailAddress?.emailAddress));
     const querySnapshot = await getDocs(q);

     querySnapshot.forEach((doc) => {
         // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
          setProjects((prev:any)=>[...prev,doc.data()])
         });


  }

  return (
    <div className="mx-32 mt-20">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl">My Project </h2>
        <Button>+ Create New Project</Button>
      </div>
      <div>
       
        '{!projects?.length? <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderIcon />
            </EmptyMedia>
            <EmptyTitle>No Projects Yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any projects yet. Get started by creating
              your first project.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Button>Create Project</Button>
              {/* <Button variant="outline">Import Project</Button> */}
            </div>
          </EmptyContent>
          <Button
            variant="link"
            asChild
            className="text-muted-foreground"
            size="sm"
          >
            <a href="#">
              Learn More <ArrowUpRightIcon />
            </a>
          </Button>  
        </Empty>:
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          
          {projects.map((project,index)=>(

            <Link to={'/workspace/project/'+project.projectId+'/editor'}>

            <div key={index} className="p-4 border rounded-2xl shadow mt-3 space-y-1">
              <img src={PPT_ICON} width={50} height={50}/>
              <h2 className="font-bold text-lg">{project?.userInputPrompt}</h2>
              <h2 className=" text-red-600">Total : {project?.slides?.length} Slides</h2>
              <p className="text-gray-400">{formatDate(project?.createdAt)}</p>
            </div>
            </Link>
          ))}
        </div>
}
      </div>
    </div>
  );
}

export default MyProject;
