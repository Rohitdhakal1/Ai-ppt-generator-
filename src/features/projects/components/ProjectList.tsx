import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ArrowUpRightIcon, FolderIcon } from "lucide-react";
import type { Project } from "../pages/OutlinePage";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firebaseDb } from "../../../config/firebase";
import { useUser } from "@clerk/clerk-react";
import PPT_ICON from "../../../assets/ppt.png";
import { Link } from "react-router-dom";

function MyProject() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { user } = useUser();

  const formatDate = (timestamp: number | string | Date) => {
    if (!timestamp) return 'long ago';
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  useEffect(()=>{
    user&&GetProjects();
  },[user])

  const GetProjects = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    
    // Ensure email is lowercase to match Firestore data
    const email = user.primaryEmailAddress.emailAddress.toLowerCase();
    const q = query(
      collection(firebaseDb, "projects"),
      where("createdBy", "==", email)
    );
    
    try {
      const querySnapshot = await getDocs(q);
      const fetchedProjects = querySnapshot.docs.map(doc => doc.data() as Project);
      
      // Sort by createdAt descending (most recent first)
      fetchedProjects.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
      
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  return (
    <div className="mx-8 md:mx-16 lg:mx-32 mt-12 mb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-2xl text-gray-800">My Projects</h2>
        <Button 
          onClick={() => {
            const promptBox = document.getElementById('create-prompt');
            const textarea = document.getElementById('prompt-textarea');
            promptBox?.scrollIntoView({ behavior: 'auto' });
            textarea?.focus();
          }}
          className="bg-primary hover:bg-primary/90"
        >
          + Create New Project
        </Button>
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
              <Button onClick={() => {
                const promptBox = document.getElementById('create-prompt');
                const textarea = document.getElementById('prompt-textarea');
                promptBox?.scrollIntoView({ behavior: 'auto' });
                textarea?.focus();
              }}>
                Create Project
              </Button>
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

            <Link to={'/workspace/project/'+project.projectId+'/editor'} key={index} className="block group">
              <div className="flex flex-col p-5 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-1 bg-white h-full space-y-4 hover:border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover:bg-blue-100 transition-colors">
                    <img src={PPT_ICON} className="w-10 h-10 object-contain" alt="ppt" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {project?.userInputPrompt || "Untitled Project"}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-auto mt-auto border-t border-gray-50 pt-3">
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                    {(project?.slides?.length || project?.outline?.length) ?? 0} Slides
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDate(project?.createdAt)}
                  </span>
                </div>
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
